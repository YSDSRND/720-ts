import {assign} from "../src/assign"

describe('assign tests', () => {

    it('should assign to first parameter', () => {
        const out = {}
        const result = assign(out, {yee: 'boi'})

        expect(out).toBe(result)
    })

    it('should copy from second parameter', () => {
        const result = assign({a: 'b'}, {c: 'd'})
        expect(result).toEqual({
            a: 'b',
            c: 'd',
        })
    })

    it('later parameters should override earlier', () => {
        const result = assign({a: 1}, {a: 2}, {a: 3})
        expect(result).toEqual({
            a: 3,
        })
    })

})
