import {NumberFormatter} from "../src/number";

describe('NumberFormatter tests', () => {
    const cases: ReadonlyArray<[string, number, string]> = [
        ['#,##0.00', 1.50, '1.50'],
        ['#,###.00', 0.50, '.50'],
        ['#,##0.00', 1.55, '1.55'],
        ['#,##0.##', 1.05, '1.05'],
        ['#,##0.0000', 1.5, '1.5000'],

        // TODO: this might be an error, should we round the value to 1.56?
        ['#,##0.00', 1.555, '1.55'],

        ['#,##0.00', 1000.55, '1,000.55'],
        ['#,##0.00', 1e6, '1,000,000.00'],
        ['"$"#,##0.00', 1e6, '$1,000,000.00'],
        ['"$"#,##0.00"$"', 1e6, '$1,000,000.00$'],

        ['#,##0"$"', 1, '1$'],
        ['#,##0"$"', 1000, '1,000$'],
        ['"$"#,##0"$"', 1000, '$1,000$'],
        ['0,000.00', 1, '0,001.00'],
    ]

    cases.forEach((item, idx) => {
        it(`should format correctly ${idx}`, () => {
            const fmt = new NumberFormatter(item[0], {
                decimalSeparator: '.',
                thousandsSeparator: ',',
            })

            expect(fmt.format(item[1])).toBe(item[2])
        })
    })

    it('should use supplied separators', () => {
        const fmt = new NumberFormatter('#,###.00', {
            decimalSeparator: ',',
            thousandsSeparator: ' ',
        })

        expect(fmt.format(1e6)).toBe('1 000 000,00')
    })
})
