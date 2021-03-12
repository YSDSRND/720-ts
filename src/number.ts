export type NumberFormatterOptions = {
    decimalCount: number
    decimalSeparator: string
    thousandsSeparator: string
}

const US_THOUSANDS_SEPARATOR = ','
const US_THOUSANDS_SEPARATOR_PATTERN = /,(\d{3})/g

const US_DECIMAL_SEPARATOR = '.'
const US_DECIMAL_SEPARATOR_PATTERN = /\.(\d+)$/g

export class NumberFormatter {
    public readonly options: NumberFormatterOptions
    public readonly backend: Intl.NumberFormat

    constructor(options?: Partial<NumberFormatterOptions>) {
        this.options = {
            // sane defaults that apply for the US.
            decimalCount: 2,
            decimalSeparator: US_DECIMAL_SEPARATOR,
            thousandsSeparator: US_THOUSANDS_SEPARATOR,
            ...options,
        }

        this.backend = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: this.options.decimalCount,
            minimumFractionDigits: this.options.decimalCount,
            style: 'decimal',
            useGrouping: true,
        })
    }

    public format(value: number): string {
        if (isNaN(value)) {
            value = 0
        }
        return this.backend.format(value)
            .replace(US_THOUSANDS_SEPARATOR_PATTERN, `${this.options.thousandsSeparator}$1`)
            .replace(US_DECIMAL_SEPARATOR_PATTERN, `${this.options.decimalSeparator}$1`)
    }
}

export class PercentFormatter {
    protected readonly backend: NumberFormatter

    constructor(options?: Partial<NumberFormatterOptions>) {
        this.backend = new NumberFormatter(options)
    }

    public format(value: number): string {
        return this.backend.format(value * 100) + '%'
    }
}
