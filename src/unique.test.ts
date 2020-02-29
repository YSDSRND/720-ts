import {unique} from "../src/unique";

describe('unique tests', () => {

    it('should remove duplicate primitives', () => {
        expect(unique([1, 1, 2])).toEqual([1, 2])
    })

    it('should remove duplicate references types', () => {
        const item = {yee: 1}
        expect(unique([item, item])).toEqual([item])
    })

    it('should keep duplicate reference types when references are not equal', () => {
        expect(unique([{yee: 1}, {yee: 1}])).toEqual([{yee: 1}, {yee: 1}])
    })

})
