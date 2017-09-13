import { Component, ViewEncapsulation } from '@angular/core';
import { ModalRef } from '../../../modal.component';

@Component({
	selector: '.dialog',
	templateUrl: './dialog.component.html',
	styleUrls: ['./dialog.component.less'],
	encapsulation: ViewEncapsulation.None
})
export class DialogComponent {

	data = 'angular2 layer';

	constructor (private modalRef: ModalRef) {}

	setTitle () {this.modalRef.setTitle('Angular2 Layer Title');}

	close () {this.modalRef.onCancel();}

	showCloseBtn () {this.modalRef.showCloseBtn(true);};

	showData () {alert(this.data);};

	submit () {this.modalRef.onConfirm();}

}
