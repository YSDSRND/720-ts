import { formToObject } from "../src/formToObject";
import { createElement } from "../src/createElement"
import { range } from "../src/range";

describe('formToObject tests', function () {
    let container: Element

    beforeEach(function () {
        container = createElement('form', {}, [
            createElement<HTMLInputElement>('input', {
                name: 'a',
                value: 'OK',
            }),
            createElement<HTMLInputElement>('input', {
                name: 'b',
                type: 'checkbox',
                checked: true,
                value: '',
            }),
            ...range(0, 3).map(i => {
                return createElement<HTMLInputElement>('input', {
                    name: 'c[]',
                    value: i.toString(),
                })
            }),
            createElement<HTMLTextAreaElement>('textarea', {
                name: 'd',
                value: 'some_text',
            }),
        ])
    })

    it('should serialize correctly', function () {
        const ser = formToObject(container)

        expect(ser).toEqual({
            a: 'OK',
            b: true,
            c: ['0', '1', '2'],
            d: 'some_text',
        })
    })

    it('should use valueGetter', function () {
        const ser = formToObject(container, elem => {
            return elem.value + '_YEE'
        })
        expect(ser).toEqual({
            a: 'OK_YEE',
            b: '_YEE',
            c: [
                '0_YEE',
                '1_YEE',
                '2_YEE',
            ],
            d: 'some_text_YEE',
        })
    })
})