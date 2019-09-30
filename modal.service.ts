import { ApplicationRef, ComponentFactoryResolver, ComponentRef, Injectable, Injector } from '@angular/core';
import { ModalComponent } from './modal.component';
import { ModalConfig } from './modal.config';
import { ModalRef } from './modal.ref';

@Injectable()
export class ModalService {

	constructor (private resolver : ComponentFactoryResolver,
				 private appRef : ApplicationRef,
				 private injector : Injector) {
	}

	/**
	 * 设置定时关闭弹窗，并返回实例
	 * @param {ModalConfig} defaults
	 * @param {string} type
	 * @returns {ModalRef}
	 */
	private handlerModalRef (defaults : ModalConfig, type : string) {
		const modalRef : any = this.initLayerWrapper(defaults, type);
		if (defaults.autoClose && Number(defaults.autoClose)) {
			setTimeout(() => {
				modalRef.onCancel();
			}, defaults.autoClose);
		}
		return modalRef;
	}

	/**
	 * open a dialog window
	 *  e.g.
	 *  ```typescript
	 *        const modalRef = this.modal.dialog({
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
	 */
	public dialog (config : ModalConfig) : ModalRef {
		const defaults : ModalConfig = {
			modalClass : 'modal-dialog',
			animate : 'top',
			position : 'top-60',
			cancelText : null,
			confirmText : null
		};
		ModalService.mergeConfig(defaults, config);
		return this.handlerModalRef(defaults, 'dialog');
	}

	/**
	 * open a alert window
	 * e.g.
	 * ```typescript
	 * this.modal.alert({ template: 'alert 对话框' });
	 * ```
	 * scale, top, bottom, left, right, zoom,
	 * rotate, rotatex, rotatey, scalex, scaley
	 */
	public alert (config? : ModalConfig) : ModalRef {
		const defaults : ModalConfig = {
			modalClass : 'modal-alert',
			animate : 'zoom',
			cancelText : null
		};
		ModalService.mergeConfig(defaults, config);
		return this.handlerModalRef(defaults, 'alert');
	}

	/**
	 * open a confirm window
	 * e.g.
	 * ```typescript
	 * this.modal.confirm({
	 *  template: '测试文本'
	 * });
	 * ```
	 */
	public confirm (config? : ModalConfig) : ModalRef {
		const defaults : ModalConfig = {
			modalClass : 'modal-confirm',
			animate : 'scale',
			autoClose : null
		};
		ModalService.mergeConfig(defaults, config);
		return this.handlerModalRef(defaults, 'confirm');
	}

	/**
	 * open a loading layer
	 * e.g.
	 * ```typescript
	 * const tip = this.modal.loading({ template: '2秒钟后关闭' })
	 * setTimeout(() => {tip.close();}, 2000);
	 * ```
	 */
	public loading (config? : ModalConfig) : ModalRef {
		const defaults : ModalConfig = {
			modalClass : 'modal-loading',
			animate : 'loading',
			template : '正在载入',
			autoClose : 3000,
			title : null,
			cancelText : null,
			confirmText : null,
			height : 100,
			width : 260
		};
		ModalService.mergeConfig(defaults, config);
		return this.handlerModalRef(defaults, 'loading');
	}

	/**
	 * open a actions layer
	 */
	public actions (config? : ModalConfig) : ModalRef {
		const defaults : ModalConfig = {
			modalClass : 'modal-action',
			animate : 'bottom',
			position : 'bottom-20',
			confirmText : null,
			title : null,
			width : '96%'
		};
		ModalService.mergeConfig(defaults, config);
		return this.handlerModalRef(defaults, 'actions');
	}

	/**
	 * Merge config
	 * @param defaults
	 * @param config
	 * @returns {Object}
	 */
	private static mergeConfig (defaults : any, config : any) {
		config = config || {};
		for (const key in config) {
			if (config.hasOwnProperty(key)) {
				defaults[key] = config[key];
			}
		}
		return config;
	}

	/**
	 * Callback processing.
	 * @param {Function} callback
	 * @returns {boolean}
	 * @private
	 */
	private static _callback (callback? : Function) {
		if (typeof callback === 'function') {
			callback();
		}
		return true;
	}

	/**
	 * create layer wrapper
	 * @param config
	 * @param type
	 */
	private initLayerWrapper (config : ModalConfig, type : string) : ModalRef {

		config = ModalService.defaults(config);

		ModalService._callback(config.beforeCallback);

		// Create element
		const popup = document.createElement('app-modal');
		const conFactory = this.resolver.resolveComponentFactory(ModalComponent);
		const containerEl : any = config.containerEl ? (typeof config.containerEl === 'string' ? document.querySelector(config.containerEl) : config.containerEl) : document.body;
		const popupCmpRef : ComponentRef<ModalComponent> = conFactory.create(this.injector, [], popup);
		this.appRef.attachView(popupCmpRef.hostView);
		containerEl.appendChild(popup);

		const instance = popupCmpRef.instance;
		instance.config = config;
		instance.thisRef = popupCmpRef;

		setTimeout(() => instance.initModal());

		// 注册键盘监听事件
		this.keyboardListen(config, instance);

		return instance.lyRef;
	}

	/**
	 * Keyboard event
	 */
	private keyboardListen (config : ModalConfig, instance : any) {
		const keydown = (event : any) => {
			// if (event.keyCode === 13) { // Enter 回车键
			// 	// 取消事件相关的默认行为
			// 	if (event.preventDefault) { // 标准技术
			// 		event.preventDefault();
			// 	}
			// 	if (event.returnValue) { // 兼容IE9之前的IE
			// 		event.returnValue = false;
			// 	}
			// 	return false;   // 用于处理使用对象属性注册的处理程序
			// }

			if (config.onEsc && event.keyCode === 27) { // Esc 退出键
				instance.cancel();
			}
		};

		if (!instance.events) instance.events = [];
		instance.events.push(keydown);
		// instance.eleRef.nativeElement.addEventListener('keydown', keydown, true);
		document.addEventListener('keydown', keydown, true);
	}

	/**
	 * default setting
	 * @param config
	 */
	private static defaults (config : ModalConfig) : ModalConfig {
		const _defaults : ModalConfig = {
			elementId : '',
			containerEl : null,
			modalClass : '',
			modalBodyStyles : null,
			modalHeaderStyles : null,
			title : '提示',
			close : true,
			closeText : '×',
			cancelText : '取消',
			confirmText : '确定',
			position : 'center', // top, bottom, right, left 或者 top-20, bottom-20, right-20, left-20
			animate : 'zoom',    // scale, top, bottom, left, right, zoom, rotate, rotatex, rotatey, scalex, scaley
			animateTime : 250,
			onEsc : true,        // 按Esc键层关闭modal
			onBackdrop : false,  // 点击背景层关闭modal
			template : null,
			width : null,
			height : null,
			autoClose : null,
			beforeCallback : null, // 打开前执行回调函数
			afterCallback : null,  // 打开后执行回调函数
			closeCallback : null,  // 关闭后执行回调函数
			cancelCallback : null, // 取消后执行回调函数
			confirmCallback : null // 确认后执行回调函数
		};
		const keys = Object.keys(_defaults);
		for (const key of keys) {
			if (config[key] === undefined) {
				config[key] = _defaults[key];
			}
		}
		return config;
	}
}