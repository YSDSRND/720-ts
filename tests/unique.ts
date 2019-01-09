import {unique} from "../src/unique";

describe('unique tests', function () {

    it('should remove duplicate primitives', function () {
        expect(unique([1, 1, 2])).toEqual([1, 2])
    })

    it('should remove duplicate references types', function () {
        const item = {yee: 1}
        expect(unique([item, item])).toEqual([item])
    })

    it('should keep duplicate reference types when references are not equal', function () {
        expect(unique([{yee: 1}, {yee: 1}])).toEqual([{yee: 1}, {yee: 1}])
    })

})
