import {parseQuery} from "../src/parseQuery"

describe('parseQuery tests', () => {

    it('should parse simple parameters', () => {
        const parsed = parseQuery('yee=boi')

        expect(parsed).toEqual({
            yee: 'boi',
        })
    })

    it('should parse multiple parameters', () => {
        const parsed = parseQuery('one=two&three=four')

        expect(parsed).toEqual({
            one: 'two',
            three: 'four',
        })
    })

    it('should disregard question mark in front of query', () => {
        const parsed = parseQuery('?yee=boi')

        expect(parsed).toEqual({
            yee: 'boi',
        })
    })

    it('should parse parameters without values as empty string', () => {
        const parsed = parseQuery('yee&boi')

        expect(parsed).toEqual({
            yee: '',
            boi: '',
        })
    })

    it('should URL decode values', () => {
        const parsed = parseQuery('yee=%2Byee')

        expect(parsed).toEqual({
            yee: '+yee',
        })
    })

})
