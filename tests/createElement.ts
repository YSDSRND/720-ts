import { createElement } from "../src/createElement";

describe('createElement tests', function () {
    it('should create element of type', function () {
        const el = createElement('div')
        expect(el.nodeName).toBe('DIV')
    })

    it('should set properties', function () {
        const el = createElement('div', {
            className: 'yee',
        })
        expect(el.className).toBe('yee')
    })

    it('should set data properties', function () {
        const el = createElement('div', {
            'data-a': 'Hello World'
        } as any)
        expect(el.dataset['a']).toBe('Hello World')
    })

    it('should add child nodes', function () {
        const el = createElement('div', {}, [
            createElement('span'),
        ])
        expect(el.childNodes.length).toBe(1)
        expect(el.childNodes[0].nodeName).toBe('SPAN')
    })

    it('should add child text nodes', function () {
        const el = createElement('div', {}, [
            'Wowee',
        ])
        expect(el.childNodes.length).toBe(1)
        expect(el.childNodes[0].nodeName).toBe('#text')
        expect(el.innerText).toBe('Wowee')
    })
})
