import {flip} from "../src/flip";

describe('flip tests', function () {
    it('should flip correctly', function () {
        const m = {
            a: 'c',
            b: 'd',
        }
        expect(flip(m)).toEqual({
            c: 'a',
            d: 'b',
        })
    })
})
