import { Directive, HostListener } from '@angular/core';
import { ModalRef } from '../../modal.ref';

@Directive({ selector : '[m-close]' })
export class ModalCloseDirective {

	constructor (private modalRef : ModalRef) {}

	@HostListener('click', ['$event'])
	onHostClick () {
		if (this.modalRef && this.modalRef.onCancel) {
			this.modalRef.onCancel();
		}
		if (this.modalRef && this.modalRef.onClose) {
			this.modalRef.onClose();
		}
	}
}