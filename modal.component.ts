import { ChangeDetectionStrategy, Compiler, Component, ComponentFactoryResolver, ComponentRef, ElementRef, Inject, Injector, OnDestroy, PLATFORM_ID, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { modalAnimates } from './modal.anim';
import { ModalRef } from './modal.ref';
import { ModalConfig } from './modal.config';

declare const window : any;

/**
 * modal wrapper component
 */
@Component({
    selector : 'modal',
    changeDetection : ChangeDetectionStrategy.OnPush,
    providers : [ModalRef],
    template : `
		<div class="modal-scroll">
			<div class="modal-body" #modalBody>
				<div *ngIf="!isEmpty(config.title)" class="modal-header">
					<span>{{config.title}}</span>
					<span *ngIf="!isEmpty(config.subTitle)" class="sub-title">{{ config.subTitle }}</span>
				</div>
				<div class="modal-content" #modalComponent m-attributes></div>
				<div *ngIf="!isEmpty(config.cancelText) || !isEmpty(config.confirmText)" class="modal-footer">
					<button *ngIf="!isEmpty(config.cancelText)" class="btn btn-outline-default" (click)="cancel()">{{config.cancelText}}</button>
					<button *ngIf="!isEmpty(config.confirmText)" class="btn btn-linear-primary" (click)="confirm()">{{config.confirmText}}</button>
				</div>
				<div *ngIf="config.close" (click)="close();" class="close">{{ config.closeText }}</div>
			</div>
		</div>
    `
})
export class ModalComponent implements OnDestroy {
    thisRef : ComponentRef<any>;
    bodyRef : ComponentRef<any>;
    vcRef : ViewContainerRef;
    bodyEle : any;
    config : ModalConfig = {};
    lyRef : ModalRef;
    events : any[] = [];

    private readonly modalStyleId : string = 'modalStyle';

    @ViewChild('modalBody', { static : true }) private modalBody : ElementRef;
    @ViewChild('modalComponent', { static : true }) private modalComponent : ElementRef;

    private eleListen : () => void;
    private bodyListen : () => void;

    constructor (vcRef : ViewContainerRef,
                 lyRef : ModalRef,
                 private resolver : ComponentFactoryResolver,
                 private eleRef : ElementRef,
                 private compiler : Compiler,
                 private injector : Injector,
                 private render : Renderer2,
                 @Inject(PLATFORM_ID) private platformId : object) {
        this.lyRef = lyRef;
        this.lyRef.instance = this;
        this.vcRef = vcRef;
    }

    isEmpty (args : any) {
        return args === undefined || args === null || args === false;
    }

    initModal () {
        if (isPlatformBrowser(this.platformId)) {
            this.render.setStyle(this.eleRef.nativeElement, 'display', 'none');
            this.eleRef.nativeElement.id = this.config.elementId || 'modal_' + Date.now();
            this.modalBodyStyle('width', this.config.width);
            this.modalBodyStyle('max-width', this.config.width);
            this.modalBodyStyle('height', this.config.height);
            if (this.config.modalHeaderStyles) {
                const modalHeaderDom = this.eleRef.nativeElement.querySelector('.modal-header');
                if (modalHeaderDom) {
                    this.setStyles('header', modalHeaderDom, this.config.modalHeaderStyles);
                }
            }
            if (this.config.modalBodyStyles) {
                this.setStyles('body', this.modalBody.nativeElement, this.config.modalBodyStyles);
            }
            const _right = parseInt(window.getComputedStyle(document.body).getPropertyValue('padding-right') || '0', 10);
            const _width = this.scrollBar();
            if (_width) {
                document.body.style.paddingRight = _right + _width + 'px';
            }
            this.render.addClass(document.body, 'no-scroll');

            this.eleRef.nativeElement.classList.add('modal');
            if (this.config.modalClass) {
                const klassList : string[] = this.config.modalClass.split(' ');
                klassList.forEach(klass => this.eleRef.nativeElement.classList.add(klass));
            }
            this.bodyEle = this.modalBody.nativeElement;
            const modalEle = this.modalComponent.nativeElement;

            // The non-components situation is initialized
            if (typeof this.config.template === 'string') {
                modalEle.innerHTML = this.config.template;
            }
            /* Initialize the popover component */
            if (typeof this.config.template === 'function') {
                const conFactory = this.resolver.resolveComponentFactory(this.config.template);
                this.bodyRef = this.vcRef.createComponent(conFactory, null, this.vcRef.injector);
                modalEle.appendChild(this.bodyRef.location.nativeElement);
            }
            // modalEle.appendChild(this.bodyRef.location.nativeElement);
            this.render.setStyle(this.bodyEle, 'display', 'block');
            if (this.bodyRef && this.config.data && this.config.data instanceof Object) {
                (Object as any).assign(this.bodyRef.instance, this.config.data);
            }
            if (typeof this.config.afterCallback === 'function') {
                this.config.afterCallback();
            }

            setTimeout(() => {
                this.render.setStyle(this.eleRef.nativeElement, 'display', 'block');
                if (this.config.animate && this.bodyEle) {
                    this.animateInit();
                }
                this.initPosition();
            }, 20);

            if (!!this.config.onBackdrop) {
                // 阻止事件冒泡
                this.bodyListen = this.render.listen(this.bodyEle, 'click', (event : Event) => event.stopPropagation());
                this.eleListen = this.render.listen(this.eleRef.nativeElement, 'click', () => this.close());
            }
        }
    }

    /**
     * set modal style
     */
    private setStyles (type : 'header' | 'body', dom : any, styles : any) {
        for (const prop in styles) {
            if (styles.hasOwnProperty(prop)) {
                if (type === 'header') {
                    this.render.setStyle(dom, prop, styles[prop]);
                } else if (type === 'body') {
                    this.modalBodyStyle(prop, styles[prop]);
                }
            }
        }
    }

    /**
     * Less than or equal to IE9
     */
    private static lteIE9 () {
        return (navigator && navigator.appName === 'Microsoft Internet Explorer' &&
            parseInt(navigator.appVersion.split(';')[1].replace(/[ ]/g, '').replace('MSIE', ''), 10) <= 9);
    }

    /**
     * 获取IOS版本
     * @returns {Object}
     */
    private static getIosVersion () {
        const ua = navigator.userAgent.toLowerCase();
        let version : any = null;
        if (ua.indexOf('like mac os x') > 0) {
            const reg = /os [\d._]+/gi;
            const v_info = ua.match(reg);
            version = (v_info + '').replace(/[^0-9|_.]/ig, '').replace(/_/ig, '.'); // 得到版本号x.x.x
            version = parseInt(version.toString().split('.')[0], 10); // 得到版本号第一位
        }
        return version;
    }

    /**
     * 获取Android版本
     * @returns {Object}
     */
    private static getAndroidVersion () {
        const ua = navigator.userAgent.toLowerCase();
        let version = null;
        if (ua.indexOf('android') > 0) {
            const reg = /android [\d._]+/gi;
            const v_info = ua.match(reg);
            version = (v_info + '').replace(/[^0-9|_.]/ig, '').replace(/_/ig, '.'); // 得到版本号x.x.x
            version = parseInt(version.toString().split('.')[0], 10); // 得到版本号第一位
        }
        return version;
    }

    private animateInit (isClose : boolean = false) {
        const iosVersion = ModalComponent.getIosVersion();
        const androidVersion = ModalComponent.getAndroidVersion();
        if (ModalComponent.lteIE9()) return; // 兼容IE9以上
        if (iosVersion && iosVersion <= 8) return; // 兼容ios8以上
        if (androidVersion && androidVersion <= 5) return; // 兼容android5以上
        let animateName = `animate_${ String(this.config.animate).toLowerCase() }`;
        // init keyframes
        const keyframeList = modalAnimates[animateName];
        if (keyframeList && keyframeList.length) {
            animateName = isClose ? animateName + '_close' : animateName;
            const animateTiming = this.config.animateTime / 1000 + 's';
            const timingFun = 'cubic-bezier(0.27, 1.12, 0.32, 1.5)';

            // init animation
            this.setBodyAnimation(animateName, animateTiming, timingFun);

            const keyframes = `
				@keyframes ${ animateName } {
					0% { ${ keyframeList[isClose ? 1 : 0] } }
					100% { ${ keyframeList[isClose ? 0 : 1] } }
				}
			`;
            let modalStyleEl : any = document.getElementById(this.modalStyleId);
            if (!modalStyleEl) {
                modalStyleEl = document.createElement('style');
                modalStyleEl.type = 'text/css';
                modalStyleEl.id = this.modalStyleId;
                modalStyleEl.innerHTML = '';
                document.getElementsByTagName('head')[0].appendChild(modalStyleEl);
            }
            const len : number = document.styleSheets.length;
            let modalStylesheet : any;
            for (let i = 0; i < len; i++) {
                const stylesheet : any = document.styleSheets[i];
                if (stylesheet && stylesheet.ownerNode.id === this.modalStyleId) {
                    modalStylesheet = stylesheet;
                    break;
                }
            }
            try {
                const ruleIndex = modalStylesheet.rules.length;
                modalStylesheet.insertRule(keyframes, ruleIndex);
            } catch (e) {
            }
        }
    }

    /**
     * set body animation
     * @param {string} animateName
     * @param {string} animateTiming
     * @param {string} timingFun
     */
    private setBodyAnimation (animateName : string, animateTiming : string, timingFun : string) {
        this.render.setStyle(this.bodyEle, '-webkit-animation-name', animateName);
        this.render.setStyle(this.bodyEle, '-moz-animation-name', animateName);
        this.render.setStyle(this.bodyEle, '-ms-animation-name', animateName);
        this.render.setStyle(this.bodyEle, 'animation-name', animateName);

        this.render.setStyle(this.bodyEle, '-webkit-animation-duration', animateTiming);
        this.render.setStyle(this.bodyEle, '-moz-animation-duration', animateTiming);
        this.render.setStyle(this.bodyEle, '-ms-animation-duration', animateTiming);
        this.render.setStyle(this.bodyEle, 'animation-duration', animateTiming);

        this.render.setStyle(this.bodyEle, '-webkit-transition-timing-function', timingFun);
        this.render.setStyle(this.bodyEle, '-moz-transition-timing-function', timingFun);
        this.render.setStyle(this.bodyEle, '-ms-transition-timing-function', timingFun);
        this.render.setStyle(this.bodyEle, 'transition-timing-function', timingFun);

        this.render.setStyle(this.bodyEle, '-webkit-animation-fill-mode', 'forwards'); // Animate objects from one place to another and leave it there. (solving scintillation problems)
        this.render.setStyle(this.bodyEle, '-moz-animation-fill-mode', 'forwards');
        this.render.setStyle(this.bodyEle, '-ms-animation-fill-mode', 'forwards');
        this.render.setStyle(this.bodyEle, 'animation-fill-mode', 'forwards');
    }

    private scrollBar () {
        if (document.body.clientWidth >= window.innerWidth) {
            return 0;
        }
        const scrollDiv = this.render.createElement('div');
        this.render.setStyle(scrollDiv, 'width', '100px');
        this.render.setStyle(scrollDiv, 'height', '100px');
        this.render.setStyle(scrollDiv, 'overflow', 'scroll');
        this.render.setStyle(scrollDiv, 'position', 'absolute');
        this.render.setStyle(scrollDiv, 'top', '99999em');
        this.render.appendChild(document.body, scrollDiv);
        const scrollBarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        this.render.removeChild(document.body, scrollDiv);
        return scrollBarWidth;
    }

    /**
     * set modal width and height
     */
    private modalBodyStyle (key : string, value : any) {
        if (this.modalBody && value) {
            if (/^[0-9]*$/.test(value)) {
                this.modalBody.nativeElement.style[key] = `${ value }px`;
            } else {
                this.modalBody.nativeElement.style[key] = value;
            }
        }
    }

    /**
     * position computations
     */
    private offsets () {
        let style = {};
        const winH : number = window.innerHeight;
        const divH : number = this.modalBody.nativeElement.offsetHeight;
        const position : string = this.config.position;
        if (!isNaN(Number(position))) {
            return ['margin-top', position + 'px'];
        }
        const positionTo = position.split('-')[0];
        const num = parseInt(position.split('-')[1], 10) || 0;
        if (positionTo === 'left') {
            style = { 'margin-left' : num + 'px', float : 'left' };
        } else if (positionTo === 'right') {
            style = { 'margin-right' : num + 'px', float : 'right' };
        } else if (positionTo === 'bottom') {
            style = { 'margin-top' : (winH - divH - num) + 'px' };
        } else if (positionTo === 'top') {
            style = { 'margin-top' : num + 'px' };
        } else if (positionTo === 'center') {
            if (divH > (winH - 60)) {
                const gapHalf = 60 / 2;
                style = { 'margin-top' : gapHalf + 'px', 'margin-bottom' : gapHalf + 'px' };
            } else {
                style = { 'margin-top' : ((winH - divH) / 2) + 'px' };
            }
        } else {
            style = ['margin-top', (60 / 2) + 'px'];
        }
        return style;
    }

    /**
     * init position
     */
    private initPosition () {
        const position = this.config.position;
        if (position) {
            const styleMap : any = this.offsets();
            for (const key in styleMap) {
                if (key && styleMap.hasOwnProperty(key)) {
                    this.render.setStyle(this.modalBody.nativeElement, key, styleMap[key]);
                }
            }
        }
    }

    private static _callback (callback : Function, data? : any) {
        if (typeof callback === 'function') {
            return callback(data);
        }
        return true;
    }

    public onConfirm (data? : any) {
        return data || true;
    }

    public onClose (data? : any) {
        return data || true;
    }

    public onCancel (data? : any) {
        return data || true;
    }

    public onCheck (data? : any) {
        return data || true;
    }

    /**
     * alert or confirm layer
     */
    confirm (data? : any) {
        if (this.onConfirm) {
            this.checkCloseWindow('confirmCallback', this.config.confirmCallback || this.onConfirm, data);
        }
    }

    /**
     * alert or confirm layer
     */
    cancel (data? : any) {
        if (this.onCancel) {
            this.checkCloseWindow('cancelCallback', this.config.cancelCallback || this.onCancel, data);
        }
    }

    /** close layer */
    close () {
        if (this.onClose) {
            this.checkCloseWindow('closeCallback', this.config.closeCallback || this.onClose);
        }
    }

    /**
     * alert or check layer
     */
    check (data? : any) {
        if (this.onCheck) {
            this.checkCloseWindow('checkCallback', this.config.checkCallback || this.onCheck, data);
        }
    }

    /**
     * 检测窗口是否关闭，是，关闭
     * @param {Function} callbackName
     * @param {Function} callback
     * @param data
     */
    private checkCloseWindow (callbackName : string, callback : Function, data? : any) {
        const result : any = ModalComponent._callback(callback, data);
        if (result === true) {
            this.closeWindow();
        }
        if (result && result.then) {
            result.then(bool => bool && this.closeWindow());
        }
        if (this.config && this.config[callbackName]) {
            this.closeWindow();
        }
    }

    /**
     * close modal window
     */
    private closeWindow () {
        const destroyAndResetScroll = () => {
            setTimeout(() => {
                document.body.style.removeProperty('padding-right');
                document.body.classList.remove('no-scroll');
                const modalStyleEl = document.getElementById(this.modalStyleId);
                if (modalStyleEl) {
                    document.getElementsByTagName('head')[0].removeChild(modalStyleEl);
                }
                this.thisRef.destroy();
                this.closeEvents();
            }, this.config.animateTime);
        };
        if (this.config.animate) {
            this.animateInit(true);
            destroyAndResetScroll();
        } else {
            destroyAndResetScroll();
        }
    }

    /**
     * 释放所有监听的事件
     */
    private closeEvents () {
        for (const event of this.events) {
            // this.eleRef.nativeElement.removeEventListener(event.name, event, true);
            document.removeEventListener(event.name, event, true);
        }
    }

    ngOnDestroy () : void {
        if (this.bodyListen) this.bodyListen();
        if (this.eleListen) this.eleListen();
    }
}
