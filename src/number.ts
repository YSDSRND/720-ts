import {assign} from "./assign";
import {find} from "./find";

interface Options {
    decimalSeparator: string
    thousandsSeparator: string
}

interface FormattingSpecifier {
    isRequired?: boolean
    isLastNumericSpecifier?: boolean
    integerIndex?: number
    fractionIndex?: number
    literalValue?: string
}

interface Format {
    groupDigits: number
    scale: number
    fractionDigits: number
    specifiers: ReadonlyArray<FormattingSpecifier>
}

const enum FormattingCharacter {
    OptionalDigit = '#',
    RequiredDigit = '0',
    ThousandsSeparator = ',',
    DecimalSeparator = '.',
    LiteralDelimiter = '"',
    Percentage = '%',
    Space = ' ',
}

function parseFormat(format: string, options: Options): Format {
    const out = {
        groupDigits: 0,
        scale: 1,

        // count the number of fraction specifiers in the format.
        fractionDigits: (format.split(FormattingCharacter.DecimalSeparator)[1] || '')
            .replace(/[^0#]/g, '')
            .length,

        specifiers: [] as Array<FormattingSpecifier>,
    }

    let buffer = ''
    let isReadingLiteral = false
    let isReadingFraction = out.fractionDigits > 0
    let fractionIndex = 0
    let integerIndex = 0
    let shouldCountGroupDigits = out.fractionDigits === 0
    let groupDigits = 0

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
                    isRequired: chr === FormattingCharacter.RequiredDigit,
                    integerIndex: isReadingFraction ? undefined : integerIndex++,
                    fractionIndex: isReadingFraction ? fractionIndex++ : undefined,
                })

                if (shouldCountGroupDigits) {
                    groupDigits++
                }
                break
            case FormattingCharacter.ThousandsSeparator:
                out.groupDigits = groupDigits

                // when we hit the thousands separator
                // we know how many digits should be
                // grouped together. stop counting here.
                shouldCountGroupDigits = false
                break
            case FormattingCharacter.Percentage:
                out.scale = 100
                out.specifiers.unshift({
                    literalValue: '%',
                })
                break
            case FormattingCharacter.DecimalSeparator:
                // we're assuming that the fraction format
                // actually occurs at the end of the format
                // string. if that's not the case this will
                // probably break.
                isReadingFraction = false
                out.specifiers.push({
                    literalValue: options.decimalSeparator,
                })

                // start counting the number of digits that
                // should be grouped together.
                shouldCountGroupDigits = true
                break
            case FormattingCharacter.LiteralDelimiter:
                isReadingLiteral = !isReadingLiteral

                if (!isReadingLiteral) {
                    out.specifiers.push({
                        literalValue: buffer,
                    })
                    buffer = ''
                }
                break
            case FormattingCharacter.Space:
                out.specifiers.push({
                    literalValue: ' ',
                })
                break
        }
    }

    const last = out.specifiers.filter(item => {
        return typeof item.integerIndex !== 'undefined'
            || typeof item.fractionIndex !== 'undefined'
    })

    if (last.length) {
        last[last.length - 1].isLastNumericSpecifier = true
    }

    return out
}

function round(value: number, fractionDigits: number): number {
    const scale = Math.pow(10, fractionDigits)
    return Math.round(value * scale) / scale
}

// a class for excel-style number formatting.
export class NumberFormatter {
    protected readonly options: Options
    protected readonly parsedFormat: Format

    constructor(format: string, options?: Partial<Options>) {
        this.options = assign({}, {
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
        const digits = round(value * this.parsedFormat.scale, this.parsedFormat.fractionDigits)
            .toFixed(this.parsedFormat.fractionDigits)
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
            if (typeof item.integerIndex !== 'undefined'
                || typeof item.fractionIndex !== 'undefined') {
                return carry + 1
            }
            return carry
        }, 0))

        // find the last available integer formatting specifier.
        // this is important because the integer index controls
        // when we output a thousands separator. if we need to
        // output more digits than our format specifies we will
        // use this value as a starting point.
        const lastNumericSpecifier = find(specifiers, spec => spec.isLastNumericSpecifier || false)

        let out = ''
        let digitIndex = 0

        for (let i = 0; i < specifiers.length; ++i) {
            const fmt = specifiers[i]

            if (typeof fmt.literalValue !== 'undefined') {
                out = fmt.literalValue + out
                continue
            }

            let integerIndex = fmt === lastNumericSpecifier
                ? lastNumericSpecifier.integerIndex
                : fmt.integerIndex

            const writeUntilIndex = fmt === lastNumericSpecifier
                ? minimumDigitsToWrite
                : digitIndex + 1

            // this inner loop will only execute more than once
            // if we need to output more than a single digit
            // for the current format specifier. that case occurs
            // when we're formatting a large number with a smaller
            // format specifier.
            for (; digitIndex < writeUntilIndex; ++digitIndex) {
                // note the null coalesce here. sometimes the formatting
                // sequence is longer than the number which means that
                // we should zero-pad on the left.
                const digit = digits[digitIndex] || '0'

                // include the digit if it is explicitly marked as isRequired
                // or if we have a digit specified for this position.
                const shouldWriteDigit = fmt.isRequired || typeof digits[digitIndex] !== 'undefined'
                const shouldWriteSeparator = shouldWriteDigit
                    && this.parsedFormat.groupDigits > 0
                    && typeof integerIndex !== 'undefined'
                    && integerIndex > 0
                    && integerIndex % this.parsedFormat.groupDigits === 0

                // if the next digit is included and its integer index
                // is evenly divisible by 3 we need to insert a thousands
                // separator before.
                if (shouldWriteSeparator) {
                    out = this.options.thousandsSeparator + out
                }

                if (shouldWriteDigit) {
                    out = digit + out
                }

                if (typeof integerIndex !== 'undefined') {
                    integerIndex++
                }
            }
        }

        return out
    }
}
