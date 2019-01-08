import {toArray} from "../src/toArray";

describe('toArray tests', function () {

    it('should convert to array', function () {
        const data = {
            0: 'yee',
            1: 'boi',
            length: 2
        }

        const arr = toArray(data)

        expect(Array.isArray(arr)).toBe(true)
        expect(arr.length).toBe(2)
    })

    it('should iterate until length is reached', function () {
        const data = {
            0: 'yee',
            1: 'boi',
            2: 'other_boi',
            length: 1
        }

        const arr = toArray(data)

        expect(arr.length).toBe(1)
    })

})
