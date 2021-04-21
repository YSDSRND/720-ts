import {entries} from '../src/entries'

describe('entries tests', () => {
    it('should extract entries', () => {
        const x = {
            a: 1,
            b: 2,
            c: 3,
        }

        expect(entries(x)).toEqual([
            {
                key: 'a',
                value: 1,
            },
            {
                key: 'b',
                value: 2,
            },
            {
                key: 'c',
                value: 3,
            },
        ])
    })

    it('should apply parseInt to integer-like keys', () => {
        const names = {
            0: 'X',
            1: 'Y',
        }
        const e = entries(names)

        expect(e[0]?.key).toBe(0)
        expect(e[1]?.key).toBe(1)
    })
})
