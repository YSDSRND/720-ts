import {assign} from "../src/assign"

describe('assign tests', function () {

    it('should assign to first parameter', function () {
        const out = {}
        const result = assign(out, {yee: 'boi'})

        expect(out).toBe(result)
    })

    it('should copy from second parameter', function () {
        const result = assign<any>({a: 'b'}, {c: 'd'})
        expect(result).toEqual({
            a: 'b',
            c: 'd',
        })
    })

    it('later parameters should override earlier', function () {
        const result = assign<any>({a: 1}, {a: 2}, {a: 3})
        expect(result).toEqual({
            a: 3
        })
    })

})