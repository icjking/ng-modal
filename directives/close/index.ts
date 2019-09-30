import { NgModule } from '@angular/core';
import { ModalCloseDirective } from './modal-close.directive';

@NgModule({
	declarations : [
		ModalCloseDirective
	],
	exports : [
		ModalCloseDirective
	]
})
export class CloseModule {}