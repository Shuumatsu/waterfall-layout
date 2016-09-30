import { Waterfall } from '../src/index';

let container: any = document.querySelector('.waterfall');
let wataterfall = new Waterfall(<HTMLElement>container);

let button = document.querySelector('button');

function constructElements() {
    let elements: HTMLElement[] = [];
    for (let i = 0; i < 10; i++) {
        let el = document.createElement('div');
        el.style.height = Math.random() * 200 + 'px';
        elements.push(el);
    }

    return elements;
}

button.addEventListener('click', () => {
    wataterfall.addElements(constructElements());
});