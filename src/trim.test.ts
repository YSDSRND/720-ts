import {trim} from "../src/trim";

describe('trim tests', () => {
    const dataSets: ReadonlyArray<[string, string, string]> = [
        ['yeeC', 'C', 'yee'],
        ['CyeeC', 'C', 'yee'],
        ['CCCyeeCCCCCC', 'C', 'yee'],
        ['ABCaCBA', 'ABC', 'a'],

        // various special regexp characters
        ['yee[]', '[]', 'yee'],
        ['[][]yee[[[', '[]', 'yee'],
        ['[][]AAA[]yee[[', '[]', 'AAA[]yee'],
        ['\\yee\\', '\\', 'yee'],
        ['+yee+', '+', 'yee'],
        ['//yee//', '/', 'yee'],
    ]

    for (let i = 0; i < dataSets.length; ++i) {
        const set = dataSets[i]
        it('should trim correctly ' + i, () => {
            expect(trim(set[0], set[1])).toBe(set[2])
        })
    }
})
