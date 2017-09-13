/**
 * modal wrapper component
 */
import {
	AfterViewInit,
	Component,
	ComponentFactoryResolver,
	ComponentRef, ElementRef,
	Renderer2,
	ViewChild,
	ViewContainerRef
} from '@angular/core';

export class ModalRef {

	instance: any;

	onCancel () {
		this.instance.cancel();
	};

	onConfirm () {
		this.instance.confirm();
	};

	showCloseBtn (show: boolean): ModalRef {
		this.instance.config.close = show;
		return this;
	}

	setTitle (title: string): ModalRef {
		this.instance.config.title = title;
		return this;
	}

	setConfirmText (text: string): ModalRef {
		this.instance.config.confirmText = text;
		return this;
	}

	setCancelText (cancel: string): ModalRef {
		this.instance.config.cancelTxt = cancel;
		return this;
	}

	/**
	 * if the callBack return true, the layer will be closed
	 * e.g.
	 * ```typescript
	 * lyRef.closeCallback(() => {
	 *  // Other handler
	 *  return true; // close window
	 * });
	 * ```
	 * @return {ModalRef}
	 */
	closeCallback (callBack: () => boolean): ModalRef {
		this.instance.onClose = callBack;
		return this;
	}

	/**
	 * confirmCallback called on 'confirm' button click. for alert layer or confirm layer
	 * e.g.
	 * ```typescript
	 * lyRef.confirmCallback(()=>{
	 * 	...do something...
	 * 	return true; // close window
	 * });
	 * ```
	 * @return {ModalRef}
	 */
	confirmCallback (callback: () => boolean): ModalRef {
		this.instance.onConfirm = callback;
		return this;
	}

	/**
	 * cancelCallback called on "cancel" button click. for confirm layer only
	 * e.g.
	 * ```typescript
	 * lyRef.cancelCallback(()=>{
	 * 	...do something...
	 * 	return true;
	 * });
	 * ```
	 * @return {ModalRef}
	 */
	cancelCallback (cancelCallback: () => boolean): ModalRef {
		this.instance.onCancel = cancelCallback;
		return this;
	}
}

export class ContentRef {
	constructor (public nodes: any[]) {}
}

@Component({
	selector: 'ng-modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.less'],
	host: {
		'[class]': '"modal"'
	},
	providers: [ModalRef]
})
export class ModalComponent implements AfterViewInit {
	thisRef: ComponentRef<any>;
	bodyRef: ComponentRef<any>;
	vcRef: ViewContainerRef;
	bodyEle: any;
	config: any = {};
	layerType: string;
	lyRef: ModalRef;

	@ViewChild('modalBody', { read: ViewContainerRef })
	modalBody: ViewContainerRef;

	@ViewChild('modalComponent', { read: ViewContainerRef })
	modalComponent: ViewContainerRef;

	constructor (vcRef: ViewContainerRef,
	             lyRef: ModalRef,
	             private resolver: ComponentFactoryResolver,
	             private eleRef: ElementRef,
	             private render: Renderer2) {
		this.lyRef = lyRef;
		this.lyRef.instance = this;
		this.vcRef = vcRef;
	}

	ngAfterViewInit () {
		// Counting scroll bar
		const paddingRight = document.body.style.paddingRight || 0;
		let _right = parseInt(paddingRight.toString(), 10) || 10,
			_width = this.scrollBar();
		if (_width) {
			document.body.style.paddingRight = _right + _width + 'px';
		}

		document.body.classList.add('no-scroll');
		if (this.config.modalClass) {
			this.eleRef.nativeElement.classList.add(this.config.modalClass);
		}
		this.bodyEle = this.modalBody.element.nativeElement;
		let classList = this.bodyEle.classList;
		let modalEle = this.modalComponent.element.nativeElement;

		if (this.config.animate && this.bodyEle) {
			const animateName = `animate-${this.config.animate.toLowerCase()}`;
			classList.add(animateName);
			let aniEnd = () => {
				classList.remove(animateName);
				this.bodyEle.removeEventListener('animationend', aniEnd);
			};
			this.bodyEle.addEventListener('animationend', aniEnd);
		}

		this.modalBodyStyle('width', this.config.width);
		this.modalBodyStyle('height', this.config.height);

		/* Initialize the popover component */
		if (this.layerType == 'dialog') {
			setTimeout(() => {
				if (typeof this.config.template === 'function') {
					let conFactory = this.resolver.resolveComponentFactory(this.config.template);
					this.bodyRef = this.vcRef.createComponent(conFactory, null, this.vcRef.injector);
					// this.modalComponent.insert(this.bodyRef.hostView); // Insert at the same level
					modalEle.appendChild(this.bodyRef.location.nativeElement);
					if (this.config.data && this.config.data instanceof Object) {
						Object.assign(this.bodyRef.instance, this.config.data);
					}
				}
				if (typeof this.config.afterCallback === 'function') {
					this.config.afterCallback();
				}
				this.initPosition();
			});
		} else {
			// The non-components situation is initialized
			modalEle.innerHTML = this.config.template;
			this.initPosition();
		}
	}

	private scrollBar () {
		if (document.body.clientWidth >= window.innerWidth) {
			return 0;
		}

		let div = document.createElement('div');
		div.style.width = '100px';
		div.style.height = '100px';
		div.style.overflow = 'scroll';
		div.style.position = 'absolute';
		div.style.top = '-99999em';
		document.body.appendChild(div);

		let scrollBarWidth = div.offsetWidth - div.clientWidth;
		div.remove();
		return scrollBarWidth;
	}

	/**
	 * set modal width and height
	 */
	private modalBodyStyle (key, value) {
		if (this.modalBody && value) {
			if (/^[0-9]*$/.test(value)) {
				this.modalBody.element.nativeElement.style[key] = `${value}px`;
			} else {
				this.modalBody.element.nativeElement.style[key] = value;
			}
		}
	}

	/**
	 * position computations
	 */
	private offsets () {
		let style = {};
		const winH = document.body.clientHeight;
		const divH = this.modalBody.element.nativeElement.clientHeight;
		const position = this.config.position;
		if (!isNaN(position)) {
			return ['margin-top', position + 'px'];
		}
		const positionTo = position.split('-')[0];
		let number = parseInt(position.split('-')[1]);
		if (!number) number = 0;
		if (positionTo === 'left') {
			style = { 'margin-left': number + 'px', float: 'left' };
		} else if (positionTo === 'right') {
			style = { 'margin-right': number + 'px', float: 'right' };
		} else if (positionTo === 'bottom') {
			style = { 'margin-top': (winH - divH - number) + 'px' };
		} else if (positionTo === 'top') {
			style = { 'margin-top': number + 'px' };
		} else if (positionTo === 'center') {
			if (divH > (winH - 60)) {
				let gapHalf = 60 / 2;
				style = { 'margin-top': gapHalf + 'px', 'margin-bottom': gapHalf + 'px' };
			} else {
				style = { 'margin-top': ((winH - divH) / 2) + 'px' };
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
		let position = this.config.position;
		if (position) {
			const styleMap = this.offsets();
			for (let key in styleMap) {
				if (key) {
					this.render.setStyle(this.modalBody.element.nativeElement, key, styleMap[key]);
				}
			}
		}
	}

	public onConfirm () {
		return true;
	}

	public onClose () {
		return true;
	}

	public onCancel () {
		return true;
	}

	private _callback (callback) {
		if (typeof callback === 'function') {
			callback();
		}
		return true;
	}

	/**
	 * alert or confirm layer
	 */
	confirm () {
		if (this.onConfirm && this.onConfirm()) {
			this.closeWindow();
			this._callback(this.config.confirmCallback);
		}
	}

	/**
	 * alert or confirm layer
	 */
	cancel () {
		if (this.onCancel && this.onCancel()) {
			this.closeWindow();
			this._callback(this.config.cancelCallback);
		}
	}

	/** close layer */
	close () {
		if (this.onClose && this.onClose()) this.closeWindow();
	}

	/**
	 * close modal window
	 */
	private closeWindow () {
		document.body.classList.remove('no-scroll');
		if (this.config.animate) {
			this.bodyEle.classList.add(`animate-${this.config.animate.toLowerCase()}-close`);
			/**
			 * set a delay for layer closeing so the animation has time to play
			 */
			let aniEnd = () => {
				this.thisRef.destroy();
			};
			// CSS 动画完成后触发
			this.bodyEle.addEventListener('animationend', aniEnd);
		} else {
			this.thisRef.destroy();
		}
	}
}
