import {flip} from "../src/flip";

describe('flip tests', () => {
    it('should flip correctly', () => {
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
