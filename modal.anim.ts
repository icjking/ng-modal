/**
 * modal css 类库
 */
const initValue = (opacity : number, value : string, origin? : string) => {
	return `
            opacity: ${ opacity };
            -webkit-transform: ${ value };
            -ms-transform: ${ value };
            -moz-transform: ${ value };
            transform: ${ value };
            ${ origin ? `-webkit-transform-origin: ${ origin };` : '' }
            ${ origin ? `-ms-transform-origin: ${ origin };` : '' }
            ${ origin ? `-moz-transform-origin: ${ origin };` : '' }
            ${ origin ? `transform-origin: ${ origin };` : '' }
        `;
};

const animate_zoom : any = [
	// initValue(0, 'scale(1.2)'), // 值大于1时，动画会出现滚动条闪现情况!!!
	initValue(0, 'scale(0.8)'),
	initValue(1, 'scale(1)')
];

const animate_top : any = [
	initValue(0, 'translate(0px, -100px)'),
	initValue(1, 'translate(0px, 0px)')
];

const animate_left : any = [
	initValue(0, 'translate(-100px, 0px)'),
	initValue(1, 'translate(0px, 0px)')
];

const animate_right : any = [
	initValue(0, 'translate(100px, 0px)'),
	initValue(1, 'translate(0px, 0px)')
];

const animate_bottom : any = [
	initValue(0, 'translate(0px, 20px)'),
	initValue(1, 'translate(0px, 0px)')
];

const animate_scale : any = [
	initValue(0, 'scale(0.8)'),
	initValue(1, 'scale(1)')
];

const animate_scaley : any = [
	initValue(0, 'scaley(0)', 'center'),
	initValue(1, 'scaley(1.5)', 'center')
];

const animate_scalex : any = [
	initValue(0, 'scalex(0)', 'center'),
	initValue(1, 'scalex(1.5)', 'center')
];

const animate_rotate : any = [
	initValue(0, 'rotate(-30deg)'),
	initValue(1, 'rotate(0deg)')
];

const animate_rotatex : any = [
	initValue(0, 'rotatex(-90deg)', 'center'),
	initValue(1, 'rotatex(0deg)', 'center')
];

const animate_rotatey : any = [
	initValue(0, 'rotatey(-90deg)', 'center'),
	initValue(1, 'rotatey(0deg)', 'center')
];

export const modalAnimates = {
	animate_zoom,
	animate_top,
	animate_left,
	animate_right,
	animate_bottom,
	animate_scale,
	animate_scaley,
	animate_scalex,
	animate_rotate,
	animate_rotatex,
	animate_rotatey
};