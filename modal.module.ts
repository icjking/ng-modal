import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ModalComponent } from './modal.component';
import { ModalService } from './modal.service';
import { CloseModule } from './directives/close';
import { AttributesModule } from './directives/attributes';
import { ModalRef } from './modal.ref';

@NgModule({
	imports : [CommonModule, CloseModule, AttributesModule],
	declarations : [ModalComponent],
	exports : [CloseModule],
	entryComponents : [ModalComponent]
})
export class ModalModule {
	static forRoot () : ModuleWithProviders {
		return {
			ngModule : ModalModule,
			providers : [ModalService, ModalRef]
		};
	}
}