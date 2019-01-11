import {set} from "../src/set";

describe('set tests', function () {

    it('should set with shallow path', function () {
        const item: any = {
            yee: undefined,
        }
        set(item, 'yee', 1)
        expect(item.yee).toBe(1)
    })

    it('should set with deep path', function () {
        const item: any = {
            yee: {
                boi: undefined,
            }
        }
        set(item, 'yee.boi', 1)
        expect(item.yee.boi).toBe(1)
    })

    it('should create objects for paths that do not exist', function () {
        const item = {}
        set(item, 'yee.boi.cool', 1)
        expect(item).toEqual({
            yee: {
                boi: {
                    cool: 1,
                },
            },
        })
    })

    it('should work with bracket path', function () {
        const item = {}
        set(item, 'yee[boi]', 1)
        expect(item).toEqual({
            yee: {
                boi: 1,
            },
        })
    })

})
