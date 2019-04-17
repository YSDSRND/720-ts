import {assign} from "./assign";

interface Options {
    decimalSeparator: string
    thousandsSeparator: string
}

interface FormattingSpecifier {
    required: boolean
    integerIndex?: number
    decimalIndex?: number
    literalValue?: string
}

interface Format {
    containsThousandsSeparator: boolean
    decimalDigits: number
    specifiers: ReadonlyArray<FormattingSpecifier>
}

const enum FormattingCharacter {
    OptionalDigit = '#',
    RequiredDigit = '0',
    ThousandsSeparator = ',',
    DecimalSeparator = '.',
    LiteralDelimiter = '"',
}

function parseFormat(format: string, options: Options): Format {
    const out = {
        containsThousandsSeparator: /,/.test(format),

        // count the number of decimals specifiers in the format.
        decimalDigits: (format
            .split('.')[1] || '')
            .replace(/[^0#]/g, '')
            .length,

        specifiers: [] as Array<FormattingSpecifier>,
    }

    let buffer = ''
    let isReadingLiteral = false
    let isReadingDecimal = out.decimalDigits > 0
    let isReadingInteger = !isReadingDecimal
    let decimalIndex = 0
    let integerIndex = 0

    for (let i = format.length - 1; i >= 0; --i) {
        const chr = format[i]

        if (isReadingLiteral && chr !== FormattingCharacter.LiteralDelimiter) {
            // we're reading back-to-front so let's prepend
            // the character to keep the buffer correct.
            buffer = chr + buffer
            continue
        }

        switch (chr) {
            case FormattingCharacter.OptionalDigit:
            case FormattingCharacter.RequiredDigit:
                out.specifiers.push({
                    required: chr === FormattingCharacter.RequiredDigit,
                    integerIndex: isReadingInteger ? integerIndex++ : undefined,
                    decimalIndex: isReadingDecimal ? decimalIndex++ : undefined,
                })
                break
            case FormattingCharacter.ThousandsSeparator:
                out.containsThousandsSeparator = true
                break
            case FormattingCharacter.DecimalSeparator:
                // we're assuming that the decimal format
                // actually occurs at the end of the format
                // string. if that's not the case this will
                // probably break.
                isReadingDecimal = false
                isReadingInteger = true
                out.specifiers.push({
                    required: true,
                    literalValue: options.decimalSeparator,
                })
                break
            case FormattingCharacter.LiteralDelimiter:
                isReadingLiteral = !isReadingLiteral

                if (!isReadingLiteral) {
                    out.specifiers.push({
                        required: true,
                        literalValue: buffer,
                    })
                    buffer = ''
                }
                break
        }
    }

    return out
}

// a class for excel-style number formatting.
export class NumberFormatter {
    protected readonly options: Options
    protected readonly parsedFormat: Format

    constructor(format: string, options?: Partial<Options>) {
        this.options = assign<Options>({}, {
            // sane defaults that apply for the US.
            decimalSeparator: '.',
            thousandsSeparator: ',',
        }, options || {})
        this.parsedFormat = parseFormat(format, this.options)
    }

    public format(value: number): string {
        // we intentionally remove the decimal separator since
        // it will be inserted by the formatting pattern later.
        // we also remove leading zeros so the number formatting
        // sequence can control the padding.
        const digits = value
            .toFixed(this.parsedFormat.decimalDigits)
            .replace(/[^\d]/g, '')
            .replace(/^0+/g, '')
            .split('')
            .reverse()

        const specifiers = this.parsedFormat.specifiers

        // find out how many digits, minimum, that we must output
        // to adhere to the format. we cannot output fewer digits
        // than the actual number we're formatting but we
        // must also output padding if that is specified in the
        // format.
        const minimumDigitsToWrite = Math.max(digits.length, specifiers.reduce((carry, item) => {
            if (typeof item.integerIndex !== 'undefined' ||
                typeof item.decimalIndex !== 'undefined' ) {
                return carry + 1
            }
            return carry
        }, 0))

        // find the last available integer formatting specifier.
        // this is important because the integer index controls
        // when we output a thousands separator. if we need to
        // output more digits than our format specifies we will
        // use this value as a starting point.
        const lastNumericSpecifier = (() => {
            const numeric = specifiers.filter(item => {
                return typeof item.integerIndex !== 'undefined'
            })
            return numeric[numeric.length - 1]
        })()

        let out = ''
        let digitIndex = 0

        for (let i = 0; i < specifiers.length; ++i) {
            const fmt = specifiers[i]

            if (typeof fmt.literalValue !== 'undefined') {
                out = fmt.literalValue + out
                continue
            }

            let integerIndex = fmt === lastNumericSpecifier ?
                lastNumericSpecifier.integerIndex :
                fmt.integerIndex

            const writeUntilIndex = fmt === lastNumericSpecifier ?
                minimumDigitsToWrite :
                digitIndex + 1

            // this inner loop will only execute more than once
            // if we need to output more than a single digit
            // for the current format specifier. that case occurs
            // when we're formatting a large number with a smaller
            // format specifier.
            for (let j = digitIndex; j < writeUntilIndex; ++j) {
                // note the null coalesce here. sometimes the formatting
                // sequence is longer than the number which means that
                // we should zero-pad on the left.
                const digit = digits[j] || '0'

                // include the digit if it is explicitly marked as required
                // or if we have a digit specified for this position.
                const shouldIncludeDigit = fmt.required
                    || typeof digits[j] !== 'undefined'

                // if the next digit is included and its integer index
                // is evenly divisible by 3 we need to insert a thousands
                // separator before.
                if (shouldIncludeDigit && typeof integerIndex !== 'undefined' && integerIndex > 0 && integerIndex % 3 === 0) {
                    out = this.options.thousandsSeparator + out
                }

                if (shouldIncludeDigit) {
                    out = digit + out
                }

                digitIndex++

                if (integerIndex) {
                    integerIndex++
                }
            }
        }

        return out
    }
}
