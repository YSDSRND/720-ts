import {orderBy} from "../src/orderBy"

describe('orderBy tests', () => {

    it('should sort numerically', () => {
        const sorted = orderBy(['20', '1', '3'])
        expect(sorted).toEqual(['1', '3', '20'])
    })

    it('should sort strings correctly', () => {
        const sorted = orderBy(['c', 'C', 'A', 'a'])
        expect(sorted).toEqual([
            'A', 'a', 'C', 'c',
        ])
    })

    // this is locale dependant and since we're defaulting
    // to locale: "en" we can't be sure this always will work
    // as intended.
    it('should sort accents somewhat correctly', () => {
        const sorted = orderBy(['ö', 'ä', 'á'])
        expect(sorted).toEqual(['á', 'ä', 'ö'])
    })

    it('should sort array of objects', () => {
        const sorted = orderBy([
            { yee: 2 },
            { yee: 4 },
            { yee: 1 },
        ], item => item.yee)
        expect(sorted).toEqual([
            { yee: 1 },
            { yee: 2 },
            { yee: 4 },
        ])
    })

    it('should sort descending', () => {
        const sorted = orderBy([1, 2, 3, 4, 5], undefined, 'desc')
        expect(sorted).toEqual([5, 4, 3, 2, 1])
    })

})
