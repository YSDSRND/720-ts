import {objectContains} from "../src/objectContains";

describe('objectContains tests', function () {
    it('should work on top level values', function () {
        expect(objectContains({ yee: 'boi' }, 'boi')).toBe(true)
    })

    it('should return false when not found', function () {
        expect(objectContains({ yee: 'my dude' }, 'boi')).toBe(false)
    })

    it('should work on nested object', function () {
        expect(objectContains({ yee: { yee: 'boi' }}, 'boi')).toBe(true)
    })

    it('should ignore casing', function () {
        expect(objectContains({ yee: 'BOI'}, 'boi')).toBe(true)
    })

    it('should not fail on null', function () {
        expect(objectContains({ yee: null }, 'boi')).toBe(false)
    })

    it('should not fail on undefined', function () {
        expect(objectContains({ yee: undefined }, 'boi')).toBe(false)
    })

    it('should not blindly call toString() on everything', function () {
        expect(objectContains({ yee: function () {} }, 'function')).toBe(false)
    })

    it('should work on numbers', function () {
        expect(objectContains({ yee: 1 }, '1')).toBe(true)
    })

    it('should work on booleans', function () {
        expect(objectContains({ yee: true }, 'true')).toBe(true)
    })
})
