import { ApplicationRef, ComponentFactoryResolver, ComponentRef, Injectable, Injector } from '@angular/core';
import { ContentRef, ModalComponent, ModalRef } from './modal.component';

@Injectable()
export class ModalService {

    constructor(private resolver: ComponentFactoryResolver,
                private app: ApplicationRef,
                private _injector: Injector) {
    }

    /**
     * open a dialog window
     *  e.g.
     *  ```typescript
     *        let modalRef = this.modal.dialog({
	 *			data: '123456',
	 *			template: ProjectsAddComponent,
	 *			beforeCallback: () => {
	 *				console.log('打开前执行回调函数.');
	 *			},
	 *			afterCallback: () => {
	 *				console.log('打开后执行回调函数.');
	 *			}
	 *			cancelCallback: () => {
	 *				console.log('取消回调事件[方法一].');
	 *			},
	 *			confirmCallback: () => {
	 *				console.log('确认回调事件[[方法一]].');
	 *			}
	 *		});
     *        modalRef.cancelCallback(() => {
	 *			// Other handler
	 *			console.log('取消回调事件[方法二].');
	 *			return true; // close window
	 *		});
     *        modalRef.confirmCallback(() => {
	 *			// Other handler
	 *			console.log('确认回调事件[方法二].');
	 *			return true;
	 *		});
     *  ```
     *
     * scale, top, bottom, left, right, zoom,
     * rotate, rotatex, rotatey, scalex, scaley
     *
     * @return {ModalRef}
     */
    public dialog(config: ModalConfig): ModalRef {
        const defaults = {
            modalClass: 'modal-dialog',
            animate: 'top',
            position: 'center',
            template: null,
            width: 550,
            cancelText: false,
            confirmText: false
        };
        this.mergeConfig(defaults, config);
        return this.initLayerWrapper(defaults, 'dialog');
    }

    /**
     * open a alert window
     * e.g.
     * ```typescript
     * this.modal.alert({ template: 'alert 对话框' });
     * ```
     * @return {ModalRef}
     */
    public alert(config?: ModalConfig): ModalRef {
        const defaults = {
            modalClass: 'modal-alert',
            animate: 'zoom',
            template: '',
            cancelText: false
        };
        this.mergeConfig(defaults, config);
        return this.initLayerWrapper(defaults, 'alert');
    }

    /**
     * open a confirm window
     * e.g.
     * ```typescript
     * let modalRef = this.modal.dialog({
	 *  template: ProjectsAddComponent
	 * });
     * modalRef.onClose(() => {
	 *  // Other handler
	 *  console.log('取消回调事件.');
	 *  return true; // close window
	 * });
     * modalRef.onConfirm(() => {
	 *  // Other handler
	 *  console.log('确认回调事件.');
	 *  return true; // close window
	 * });
     * ```
     * @return {ModalRef}
     */
    public confirm(config?: ModalConfig): ModalRef {
        const defaults = {
            modalClass: 'modal-confirm',
            animate: 'scale',
            template: ''
        };
        this.mergeConfig(defaults, config);
        return this.initLayerWrapper(defaults, 'confirm');
    }

    /**
     * open a loading layer
     * e.g.
     * ```typescript
     * let tip = this.modal.loading({ template: '2秒钟后关闭' })
     * setTimeout(() => {tip.close();}, 2000);
     * ```
     * @return {ModalRef}
     */
    public loading(config?: ModalConfig): ModalRef {
        const defaults = {
            modalClass: 'modal-loading',
            animate: false,
            template: '正在载入',
            autoClose: 3000
        };
        this.mergeConfig(defaults, config);
        const modalRef = this.initLayerWrapper(defaults, 'loading');
        if (Number(defaults.autoClose)) {
            setTimeout(() => {
                modalRef.onCancel();
            }, defaults.autoClose);
        }
        return modalRef;
    }

    /**
     * open a actions layer
     * @param {ModalConfig} config
     * @returns {ModalRef}
     */
    public actions(config?: ModalConfig): ModalRef {
        const defaults = {
            modalClass: 'modal-action',
            animate: 'bottom',
            position: 'bottom-20',
            confirmText: false,
            header: false,
            template: '',
            width: '30%'
        };
        this.mergeConfig(defaults, config);
        return this.initLayerWrapper(defaults, 'actions');
    }

    private mergeConfig(defaults, config) {
        config = config || {};
        for (let key in config) {
            defaults[key] = config[key];
        }
        return config;
    }

    private _callback(callback) {
        if (typeof callback === 'function') {
            callback();
        }
        return true;
    }

    /**
     * create layer wrapper
     * @param config
     * @param type
     * @returns {ModalRef}
     */
    private initLayerWrapper(config: ModalConfig, type: string): ModalRef {
        config = this.defaults(config);

        this._callback(config.beforeCallback);

        let conFactory = this.resolver.resolveComponentFactory(ModalComponent);
        const contentRef = this._getContentRef();
        let windowCmpRef: ComponentRef<ModalComponent>;
        const containerEl = document.querySelector('body');
        windowCmpRef = conFactory.create(this._injector, contentRef.nodes);
        this.app.attachView(windowCmpRef.hostView);
        containerEl.appendChild(windowCmpRef.location.nativeElement);

        let instance = windowCmpRef.instance;
        instance.layerType = type;
        instance.config = config;
        instance.thisRef = windowCmpRef;

        return instance.lyRef;
    }

    private _getContentRef(): ContentRef {
        return new ContentRef([]);
    }

    /**
     * default setting
     * @param config
     * @returns {ModalConfig}
     * @private
     */
    private defaults(config: ModalConfig): ModalConfig {
        let _defaults: ModalConfig = {
            modalClass: '',
            title: '温馨提示',
            header: true,
            close: true,
            cancelText: '取消',
            confirmText: '确定',
            position: 'center', // top, bottom, right, left 或者 top-20, bottom-20, right-20, left-20
            animate: 'zoom',    // scale, top, bottom, left, right, zoom, rotate, rotatex, rotatey, scalex, scaley
            template: null,
            width: null,
            height: null,
            autoClose: null,
            beforeCallback: null, // 打开前执行回调函数
            afterCallback: null,  // 打开后执行回调函数
            closeCallback: null,  // 关闭后执行回调函数
            cancelCallback: null, // 取消后执行回调函数
            confirmCallback: null // 确认后执行回调函数
        };
        let keys = Object.keys(_defaults), key: string;
        for (let i in keys) {
            key = keys[i];
            if (config[key] == undefined) {
                config[key] = _defaults[key];
            }
        }
        return config;
    }
}

export class ModalConfig {
    modalClass?: string;
    header?: boolean;
    template?:any;

    /**
     * datas pass to dialog component
     */
    data?: any;

    /**
     * dialog title
     * valid only for dialog layer
     */
    title?: string;

    /**
     * show close button or not.
     * valid only for dialog layer
     */
    close?: boolean;

    /**
     * text of "confirm" button.
     * valid for alert or confirm layer
     */
    confirmText?: any;

    /**
     * text of "cancel" button
     * valid only for confirm layer
     */
    cancelText?: any;

    /**
     * defined a animate by a class selector
     * valid for all type layer.
     *
     * existing options:
     * scale, top, bottom, left, right, zoom,
     * rotate, rotatex, rotatey, scalex, scaley
     */
    animate?: any;

    /**
     * modal style width
     */
    width?: any;

    /**
     * modal style height
     */
    height?: any;

    /**
     * modal position
     */
    position?: string;

    /**
     * Time automatic closing layer
     */
    autoClose?: any;

    beforeCallback?: Function; // 打开前执行回调函数
    afterCallback?: Function;  // 打开后执行回调函数
    closeCallback?: Function;  // 关闭后执行回调函数
    cancelCallback?: Function; // 取消后执行回调函数
    confirmCallback?: Function; // 确认后执行回调函数
}
