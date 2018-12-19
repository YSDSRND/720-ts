import {parseQuery} from "../src/parseQuery"

describe('parseQuery tests', function () {

    it('should parse simple parameters', function () {
        const parsed = parseQuery('yee=boi')

        expect(parsed).toEqual({
            yee: 'boi',
        })
    })

    it('should parse multiple parameters', function () {
        const parsed = parseQuery('one=two&three=four')

        expect(parsed).toEqual({
            one: 'two',
            three: 'four',
        })
    })

    it('should disregard question mark in front of query', function () {
        const parsed = parseQuery('?yee=boi')

        expect(parsed).toEqual({
            yee: 'boi',
        })
    })

    it('should parse parameters without values as empty string', function () {
        const parsed = parseQuery('yee&boi')

        expect(parsed).toEqual({
            yee: '',
            boi: '',
        })
    })

    it('should URL decode values', function () {
        const parsed = parseQuery('yee=%2Byee')

        expect(parsed).toEqual({
            yee: '+yee',
        })
    })

})
