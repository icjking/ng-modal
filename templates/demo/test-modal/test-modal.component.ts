import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../modal.service';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
	selector: 'test-modal',
	templateUrl: './test-modal.component.html',
	styleUrls: ['./test-modal.component.less']
})
export class TestModalComponent implements OnInit {

	constructor (private modal: ModalService) { }

	ngOnInit () {
	}

	dialog () {
		this.modal.dialog({
			template: DialogComponent
		});
	}

	alert () {
		this.modal.alert({
			template: '文本提示'
		});
	}

	confirm () {
		this.modal.confirm({
			template: '文本提示'
		});
	}

	loading () {
		let tip = this.modal.loading();
		setTimeout(() => {tip.onCancel();}, 2000);

		// or
		// this.modal.loading({ autoClose: 2000 });
	}

	actions () {
		this.modal.actions({});
	}

}
