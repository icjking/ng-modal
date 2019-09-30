import { Directive, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ModalRef } from '../../modal.ref';

@Directive({ selector : '[m-attributes]' })
export class ModalAttributesDirective {

	constructor (private router : Router, private modalRef : ModalRef, private ele : ElementRef) {}

	@HostListener('click', ['$event']) onClick (event) {
		const attributes = event.target.attributes;
		if (attributes && attributes.length) {
			for (const attr of attributes) {
				if (attr) {
					if (attr.name === '[routerlink]' || attr.name === 'routerlink') {
						this.router.navigateByUrl(attr.value.replace(/[\[,\],',"]/g, ''));
					}
					if (attr.name === '(click)' && attr.value.trim() === 'close()') {
						this.modalRef.onCancel();
					}
					if (attr.name === '(click)' && attr.value.includes('confirm(')) {
						let _attr = attr.value.trim();
						if (_attr.includes('=')) _attr = _attr.split['='][1];
						const id = /\((.*?)\)/.exec(_attr)[1].replace(/'/g, '');
						let value : string = id;
						if (!/^[0-9]*$/.test(id)) {
							const dom : any = this.ele.nativeElement.querySelector(`#${ id }`);
							if (dom && dom.tagName.toLocaleLowerCase() === 'input') {
								value = dom.value;
							}
						}
						this.modalRef.onConfirm({ value, parentEle : this.ele });
					}
				}
			}
		}
	}

	@HostListener('keyup') onKeyup () {
		this.modalRef.onCheck({ parentEle : this.ele });
	}
}