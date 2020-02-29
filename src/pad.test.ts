import {padLeft} from "../src/pad";

describe('pad tests', () => {
    it('should pad correctly with shorter string', () => {
        expect(padLeft('yee', 6, '.')).toBe('...yee')
    })

    it('should do nothing with longer string', () => {
        expect(padLeft('yee', 2, '.')).toBe('yee')
    })
})
