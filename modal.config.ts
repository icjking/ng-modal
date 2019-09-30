export interface ModalConfig {

	/**
	 * Custom attribute
	 */
	[key : string] : any;

	/**
	 * modal id
	 */
	elementId? : string;

	/**
	 * container
	 */
	containerEl? : string | object;

	/**
	 * modal layout class
	 */
	modalClass? : string;

	/**
	 * modal body layout style
	 */
	modalBodyStyles? : object;

	/**
	 * modal header layout style
	 */
	modalHeaderStyles? : object;

	/**
	 * The text content
	 */
	template? : any;

	/**
	 * data pass to dialog component
	 */
	data? : any;

	/**
	 * dialog title
	 * valid only for dialog layer
	 */
	title? : string | null | false;

	/**
	 * dialog sub-title
	 */
	subTitle? : string;

	/**
	 * show close button or not.
	 * valid only for dialog layer
	 */
	close? : boolean;

	/**
	 * show close button text
	 */
	closeText? : string;

	/**
	 * text of "confirm" button.
	 * valid for alert or confirm layer
	 */
	confirmText? : string | null | false;

	/**
	 * text of "cancel" button
	 * valid only for confirm layer
	 */
	cancelText? : string | null | false;

	/**
	 * defined a animate by a class selector
	 * valid for all type layer.
	 *
	 * existing options:
	 * scale, top, bottom, left, right, zoom,
	 * rotate, rotatex, rotatey, scalex, scaley
	 */
	animate? : 'scale' | 'top' | 'bottom' | 'left' | 'right' | 'zoom' | 'rotate' | 'rotatex' | 'rotatey' | 'scalex' | 'scaley' | 'loading' | null | false;

	/**
	 * modal Animation time
	 */
	animateTime? : number;

	/**
	 * modal style width
	 */
	width? : string | number | null | false;

	/**
	 * modal style height
	 */
	height? : string | number | null | false;

	/**
	 * modal position
	 */
	position? : string;

	/**
	 * Time automatic closing layer
	 */
	autoClose? : number | null | false;

	/**
	 * Open the keyboard listener event
	 * default: true
	 */
	onEsc? : boolean;

	/**
	 * Click on the background layer to close the layer
	 * default: false
	 */
	onBackdrop? : boolean;

	beforeCallback? : any; // 打开前执行回调函数
	afterCallback? : any;  // 打开后执行回调函数
	closeCallback? : any;  // 关闭后执行回调函数
	cancelCallback? : any; // 取消后执行回调函数
	confirmCallback? : any; // 确认后执行回调函数
}