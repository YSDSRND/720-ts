import {classNames} from "../src/classNames";

describe('classNames tests', () => {
    it('should include keys with truthy values', () => {
        expect(classNames({ a: true, b: '1', c: 1 })).toBe('a b c')
    })

    it('should disregard keys with falsy values', () => {
        expect(classNames({ a: true, b: false, c: '' })).toBe('a')
    })
})
