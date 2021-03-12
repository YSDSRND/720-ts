import {NumberFormatter, NumberFormatterOptions, PercentFormatter} from "../src/number";

describe('NumberFormatter tests', () => {
    const cases: ReadonlyArray<[Partial<NumberFormatterOptions>, number, string]> = [
        [{}, 0, '0.00'],
        [{}, 1.50, '1.50'],
        [{}, 1.55, '1.55'],
        [{decimalCount: 4}, 1.5, '1.5000'],
        [{}, 1.555, '1.56'],
        [{}, 1000.55, '1,000.55'],
        [{decimalCount: 1, thousandsSeparator: ''}, 1000.55, '1000.6'],
        [{}, 1e6, '1,000,000.00'],
        [{}, 1, '1.00'],
        [{decimalCount: 0}, 123.50, '124'],
        [{}, -500.5, '-500.50'],
    ]

    cases.forEach((item, idx) => {
        it(`should format correctly ${idx}`, () => {
            const fmt = new NumberFormatter(item[0])
            expect(fmt.format(item[1])).toBe(item[2])
        })
    })

    it('should use supplied separators', () => {
        const fmt = new NumberFormatter({
            decimalSeparator: ',',
            thousandsSeparator: ' ',
        })

        expect(fmt.format(1e6)).toBe('1 000 000,00')
    })
})

describe('PercentFormatter tests', () => {
    it('should multiply by 100', () => {
        const fmt = new PercentFormatter()
        expect(fmt.format(0.556)).toBe('55.60%')
    })

    it('should round stuff', () => {
        const fmt = new PercentFormatter({ decimalCount: 0 })
        expect(fmt.format(0.556)).toBe('56%')
    })
})
