import {get} from "../src/get";

describe('get tests', () => {

    const item = {
        yee: {
            boi: 1,
        },
    }

    it('should fetch the item without dots in the path', () => {
        expect(get<object>(item, 'yee')).toEqual({
            boi: 1,
        })
    })

    it('should fetch the item with dots in the path', () => {
        expect(get<number>(item, 'yee.boi')).toBe(1)
    })

    it('should return undefined when path does not exist', () => {
        expect(get(item, 'other_boi')).toBeUndefined()
    })

    it('should work with bracket path', () => {
        expect(get<number>(item, 'yee[boi]')).toBe(1)
    })

    it('should work with deep bracket path', () => {
        const item = [[['yee']]]
        expect(get<string>(item, '0[0][0]')).toBe('yee')
    })

    it('should work when path starts with bracket', () => {
        const item = [[['yee']]]
        expect(get<string>(item, '[0][0][0]')).toBe('yee')
    })

    it('should return falsy values', () => {
        const item = {
            yee: false,
        }
        expect(get<boolean>(item, 'yee')).toBe(false)
    })

})
