import {set} from "../src/set";

describe('set tests', () => {

    it('should set with shallow path', () => {
        const item: any = {
            yee: undefined,
        }
        set(item, 'yee', 1)
        expect(item.yee).toBe(1)
    })

    it('should set with deep path', () => {
        const item: any = {
            yee: {
                boi: undefined,
            },
        }
        set(item, 'yee.boi', 1)
        expect(item.yee.boi).toBe(1)
    })

    it('should create objects for paths that do not exist', () => {
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

    it('should work with bracket path', () => {
        const item = {}
        set(item, 'yee[boi]', 1)
        expect(item).toEqual({
            yee: {
                boi: 1,
            },
        })
    })

})
