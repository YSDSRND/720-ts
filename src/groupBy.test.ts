import {groupBy} from "../src/groupBy";

describe('groupBy tests', () => {

    const data = [1, 2, 3, 4, 5]

    it('should group data correctly', () => {
        const result = groupBy(data, item => item < 3 ? 'a' : 'b')

        expect(result).toEqual({
            a: [1, 2],
            b: [3, 4, 5],
        })
    })

})
