import { NgModule } from '@angular/core';
import { ModalAttributesDirective } from './modal-attributes.directive';

@NgModule({
	declarations : [
		ModalAttributesDirective
	],
	exports : [
		ModalAttributesDirective
	]
})
export class AttributesModule {}