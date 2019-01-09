import {get} from "../src/get";

describe('get tests', function () {

    const item = {
        yee: {
            boi: 1,
        },
    }

    it('should fetch the item without dots in the path', function () {
        expect(get<object>(item, 'yee')).toEqual({
            boi: 1,
        })
    })

    it('should fetch the item with dots in the path', function () {
        expect(get<number>(item, 'yee.boi')).toBe(1)
    })

    it('should return undefined when path does not exist', function () {
        expect(get(item, 'other_boi')).toBeUndefined()
    });

})
