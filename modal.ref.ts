export class ModalRef {

	instance : any;

	get data () {
		return this.instance.config.data;
	}

	onClose () {
		this.instance.close();
	}

	onCancel () {
		this.instance.cancel();
	}

	onConfirm (data? : any) {
		this.instance.confirm(data);
	}

	onCheck (data? : any) {
		this.instance.check(data);
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
	 */
	closeCallback (callBack : () => Promise<boolean> | boolean) : void {
		this.instance.onClose = callBack;
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
	 */
	confirmCallback (callback : (data? : any) => Promise<boolean> | boolean) : void {
		this.instance.onConfirm = callback;
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
	 */
	cancelCallback (cancelCallback : () => Promise<boolean> | boolean) : void {
		this.instance.onCancel = cancelCallback;
	}

	/**
	 * checkCallback called on 'keydown'. for alert layer or confirm layer
	 * e.g.
	 * ```typescript
	 * lyRef.checkCallback(()=>{
	 * 	...do something...
	 * 	return true; // close window
	 * });
	 * ```
	 */
	checkCallback (callback : (data? : any) => Promise<boolean> | boolean) : void {
		this.instance.onCheck = callback;
	}

	/**
	 * remove all modal layer
	 */
	remove (modalId? : string) : void {
		const children : any = document.body.children;
		for (const modal of children) {
			if (modal && modal.tagName === 'APP-MODAL') {
				if (modalId) {
					if (modal.id === modalId) {
						document.body.removeChild(modal);
						break;
					}
				} else {
					document.body.removeChild(modal);
				}
			}
		}
	}
}