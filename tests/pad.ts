import {padLeft} from "../src/pad";

describe('pad tests', function () {
    it('should pad correctly with shorter string', function () {
        expect(padLeft('yee', 6, '.')).toBe('...yee')
    })

    it('should do nothing with longer string', function () {
        expect(padLeft('yee', 2, '.')).toBe('yee')
    })
})
