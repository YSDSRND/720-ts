import {NumberFormatter} from "../src/number";

describe('NumberFormatter tests', () => {
    const cases: ReadonlyArray<[string, number, string]> = [
        ['#,##0.00', 0, '0.00'],
        ['#,##0.00', 1.50, '1.50'],
        ['#,###.00', 0.50, '.50'],
        ['#,##0.00', 1.55, '1.55'],
        ['#,##0.##', 1.05, '1.05'],
        ['#,##0.0000', 1.5, '1.5000'],

        ['#,##0.00', 1.555, '1.56'],

        ['#,##0.00', 1000.55, '1,000.55'],
        ['##,#0.00', 1000.55, '10,00.55'],
        ['###0.0', 1000.55, '1000.6'],
        ['#,##0.00', 1e6, '1,000,000.00'],
        ['##,#0.00', 1e6, '1,00,00,00.00'],
        ['"$"#,##0.00', 1e6, '$1,000,000.00'],
        ['"$"#,##0.00"$"', 1e6, '$1,000,000.00$'],

        ['#,##0"$"', 1, '1$'],
        ['#,##0"$"', 1000, '1,000$'],
        ['"$"#,##0"$"', 1000, '$1,000$'],
        ['0,000.00', 1, '0,001.00'],

        ['0.00%', 0.553, '55.30%'],
        ['0%', 0.553, '55%'],

        ['0 0 0 0', 123, '0 1 2 3'],

        ['#', 123.50, '124'],
        ['#,##0', +Infinity, '0'],
        ['#,##0', -Infinity, '0'],
        ['#,##0', Infinity, '0'],
        ['#,##0', NaN, '0'],
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
