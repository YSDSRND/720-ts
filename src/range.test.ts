import {range} from "../src/range";

describe('range tests', () => {

    it('should generate simple range', () => {
        expect(range(0, 5)).toEqual([0, 1, 2, 3, 4])
    })

    it('should generate range with larger step', () => {
        expect(range(0, 15, 2)).toEqual([0, 2, 4, 6, 8, 10, 12, 14])
    })

})
