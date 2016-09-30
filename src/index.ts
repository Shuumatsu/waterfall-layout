import { Subject } from 'rxjs/Subject';

// import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/switchMap';
// import 'rxjs/add/operator/toPromise';

function flat(...args: Object[]) {
    let extended = {};
    args.forEach(v => {
        for (let key in v) {
            if (typeof v[key] === 'object' && !Array.isArray(v[key])) {
                Object.assign(extended, flat(v[key]));
                continue;
            }

            extended[key] = v[key];
        }
    });

    return extended;
}

function debounce(fn: Function, delay: number, immediate?: boolean) {
    let timeout;

    return function () {
        let context = this, args = arguments;
        let later = () => {
            timeout = null;
            if (!immediate) {
                fn.apply(context, args);
            }
        }
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, delay);
        if (callNow) {
            fn.apply(context, args);
        }
    }
}

class Option {
    breakPoints: number[];
    gap: number | string;
}

const defaultConfig = {
    breakPoints: [480, 720, 960, 1080],
    gap: '1em'
}


// cache breakPoints:number[] gap:string itemWidth:string style:HTMLElement
export function Waterfall(container: HTMLElement) {
    this.container = container;
    if (!this.container.style.position || this.container.style.position === 'static') {
        this.container.style.position = 'relative';
    }

    let option = JSON.parse(container.getAttribute('data-option'));
    option.breakPoints = option.breakPoints || option.breakPoints.sort();
    if (typeof option.gap === 'number' && option.gap !== 0) {
        option.gap += 'px';
    }
    this.cache = flat(defaultConfig, option);

    this.styleElements();

    this.elements = <HTMLElement[]>Array.from(this.container.querySelectorAll('.waterfall-item'));

    this.numChangeSubject = new Subject<number>();
    this.maxHeightSubject = new Subject<number>();
    this.newElementsSubject = new Subject<HTMLElement[]>();
    this.resizeSubject = new Subject<number>();

    this.numChangeSubject.distinctUntilChanged().subscribe(
        num => {
            this.setElementsWidth(num);
            this._positionElementsFactory(num);
            this.positionElements(this.elements);
        }
    );

    this.maxHeightSubject.debounceTime(300).distinctUntilChanged().subscribe(
        maxHeight => {
            this.container.style.height = maxHeight + 'px';
        }
    );

    this.newElementsSubject.subscribe(
        newElements => {
            this.appendNewElements(newElements);
            this.elements = this.elements.concat(newElements);
            this.positionElements(newElements);
        }
    );

    this.resizeSubject.distinctUntilChanged().subscribe(
        clientWidth => {
            this.calcColNum(clientWidth);
        }
    );

    function resizeHandler() {
        this.resizeSubject.next(document.body.clientWidth);
    }
    window.addEventListener('resize', debounce(resizeHandler.bind(this), 300));
    this.resizeSubject.next(<number>document.body.clientWidth);
}

// Waterfall.prototype.hideElements = function (elements: HTMLElement[]) {
//     elements.forEach(el => {
//         el.style.transition = '';
//         el.style.opacity = '0';
//     });
// }

// Waterfall.prototype.showElements = function (elements: HTMLElement[]) {
//     elements.forEach(el => {
//         el.style.transition = 'opacity 0.225s 0.125s';
//         el.style.opacity = '1';
//     });
// }

Waterfall.prototype._positionElementsFactory = function (num: number) {
    let cols: HTMLElement[][] = new Array(num);
    for (let i = 0; i < cols.length; i++) {
        cols[i] = [];
    }
    let tops: number[] = new Array(num);
    for (let i = 0; i < tops.length; i++) {
        tops[i] = 0;
    }

    Waterfall.prototype.positionElements = (elements: HTMLElement[]) => {
        elements.forEach(v => {
            let i: number = tops.indexOf(Math.min.apply(null, tops));

            v.style.left = `calc((${this.cache.elementWidth} + ${this.cache.gap}) * ${i})`;
            v.style.top = tops[i] + 'px';
            v.style.opacity = '1';
            cols[i].push(v);
            tops[i] += parseFloat(window.getComputedStyle(v).getPropertyValue('height')) + parseFloat(window.getComputedStyle(v).getPropertyValue('margin-bottom'));

            this.maxHeightSubject.next(<number>Math.max.apply(null, tops));
        });
    }
};

Waterfall.prototype.calcColNum = function (clientWidth: number) {
    let num = this.cache.breakPoints.length;

    this.cache.breakPoints.find((v, i) => {
        if (clientWidth < v) {
            num = i + 1;
            return true;
        }
    });

    this.numChangeSubject.next(num);
};

Waterfall.prototype.setElementsWidth = function (num: number) {
    this.cache.elementWidth = `calc((100% - ${num - 1} * ${this.cache.gap}) / ${num})`;

    this.cache.style.innerHTML += `
    .waterfall-item {
        width: ${this.cache.elementWidth};
    }`
};

Waterfall.prototype.styleElements = function () {
    let style = document.createElement('style');
    style.id = 'waterfall-item-style';
    style.innerHTML = `.waterfall-item {
        position: absolute;
        transition: opacity 0.225s 0.225s;
    }`;

    this.cache.style = style;
    this.container.insertBefore(style, this.container.firstChild);
};

Waterfall.prototype.addElements = function (elements: HTMLElement | HTMLElement[]) {
    if (!Array.isArray(elements)) {
        elements = [elements];
    }

    this.newElementsSubject.next(elements);
}

Waterfall.prototype.appendNewElements = function (elements: HTMLElement[]) {
    let fragment = document.createDocumentFragment();

    elements.forEach(element => {
        element.style.opacity = '0';
        element.classList.add('waterfall-item');
        fragment.appendChild(element);
    });

    this.container.appendChild(fragment);
}
