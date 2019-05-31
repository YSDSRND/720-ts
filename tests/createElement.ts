import { createElement } from "../src/createElement";

describe('createElement tests', () => {
    it('should create element of type', () => {
        const el = createElement('div')
        expect(el.nodeName).toBe('DIV')
    })

    it('should set properties', () => {
        const el = createElement('div', {
            className: 'yee',
        })
        expect(el.className).toBe('yee')
    })

    it('should add child nodes', () => {
        const el = createElement('div', {}, [
            createElement('span'),
        ])
        expect(el.childNodes.length).toBe(1)
        expect(el.childNodes[0].nodeName).toBe('SPAN')
    })

    it('should add child text nodes', () => {
        const el = createElement('div', {}, [
            'Wowee',
        ])
        expect(el.childNodes.length).toBe(1)
        expect(el.childNodes[0].nodeName).toBe('#text')
        expect(el.innerText).toBe('Wowee')
    })

    it('should append children before setting props', () => {
        const el = createElement('select', { value: 'three' }, [
            createElement('option', { value: 'one' }, ['one']),
            createElement('option', { value: 'two' }, ['two']),
            createElement('option', { value: 'three' }, ['three']),
        ])

        expect(el.selectedIndex).toBe(2)
    })
})
