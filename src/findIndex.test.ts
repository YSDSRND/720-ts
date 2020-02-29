import {findIndex} from "../src/findIndex";

describe('findIndex tests', () => {

    const data: ReadonlyArray<number> = [1, 2, 3, 4, 5]

    it('should return index of item', () => {
        const idx = findIndex(data, val => val == 2)
        expect(idx).toBe(1)
    })

    it('should return undefined when not found', () => {
        const idx = findIndex(data, val => val > 10)
        expect(idx).toBeUndefined()
    })

})
