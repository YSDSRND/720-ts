import {keyBy} from "../src/keyBy";

describe('keyBy tests', () => {

    const data = [1, 2, 3, 4, 5]

    it('should key by correctly', () => {
        const result = keyBy(data, item => item)

        expect(result).toEqual({
            1: 1,
            2: 2,
            3: 3,
            4: 4,
            5: 5,
        })
    })

    it('should overwrite duplicate keys', () => {
        const result = keyBy(data, item => item < 3 ? 'a' : 'b')
        expect(result).toEqual({
            a: 2,
            b: 5,
        })
    })

})
