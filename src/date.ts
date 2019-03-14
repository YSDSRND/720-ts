import {padLeft} from "./pad";
import {Func2, Map, ReadonlyMap, StringLike} from "./types";
import {orderByWithComparator} from "./orderBy";

export const enum DateComponent {
    Year, Month, Date, Hour, Minute, Second, Millisecond,
}

export interface DateFormatterInterface {
    format(date: YSDSDate | Date, format: string): string
}

export interface DateFormatConverterInterface {
    convert(from: string): string
}

export interface DateParserInterface {
    parse(value: string, format: string): YSDSDate | undefined
}

function orderDescendingByLength(items: ArrayLike<string>): ReadonlyArray<string> {
    return orderByWithComparator(items, (a, b) => {
        const lenA = a.length
        const lenB = b.length
        if (lenA === lenB) {
            return 0
        }
        return lenA > lenB ? -1 : 1
    })
}

const getterMap = {
    [DateComponent.Year]: Date.prototype.getFullYear,
    [DateComponent.Month]: function(this: Date) {
        return this.getMonth() + 1
    },
    [DateComponent.Date]: Date.prototype.getDate,
    [DateComponent.Hour]: Date.prototype.getHours,
    [DateComponent.Minute]: Date.prototype.getMinutes,
    [DateComponent.Second]: Date.prototype.getSeconds,
    [DateComponent.Millisecond]: Date.prototype.getMilliseconds,
}

const setterMap = {
    [DateComponent.Year]: Date.prototype.setFullYear,
    [DateComponent.Month]: function(this: Date, value: number) {
        const prevDate = this.getDate()
        this.setMonth(value - 1)

        // the month component has overflowed into the date.
        // loop backwards until we get to the previous month
        // to fix the issue.
        if (prevDate != this.getDate()) {
            const month = this.getMonth()
            while (month == this.getMonth()) {
                this.setDate(this.getDate() - 1)
            }
        }
    },
    [DateComponent.Date]: Date.prototype.setDate,
    [DateComponent.Hour]: Date.prototype.setHours,
    [DateComponent.Minute]: Date.prototype.setMinutes,
    [DateComponent.Second]: Date.prototype.setSeconds,
    [DateComponent.Millisecond]: Date.prototype.setMilliseconds,
}

export class YSDSDate {

    protected readonly backend: Date

    public get year(): number {
        return this.getComponent(DateComponent.Year)
    }

    public get month(): number {
        return this.getComponent(DateComponent.Month)
    }

    public get date(): number {
        return this.getComponent(DateComponent.Date)
    }

    public get hour(): number {
        return this.getComponent(DateComponent.Hour)
    }

    public get minute(): number {
        return this.getComponent(DateComponent.Minute)
    }

    public get second(): number {
        return this.getComponent(DateComponent.Second)
    }

    public get millisecond(): number {
        return this.getComponent(DateComponent.Millisecond)
    }

    public get timezoneOffset(): number {
        return this.backend.getTimezoneOffset()
    }

    constructor(
        year: number,
        month: number,
        date: number,
        hour: number = 0,
        minute: number = 0,
        second: number = 0,
        millisecond: number = 0
    ) {
        this.backend = new Date(year, month - 1, date, hour, minute, second, millisecond)
    }

    public static fromDate(date: Date): YSDSDate {
        return new YSDSDate(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        )
    }

    public static now(): YSDSDate {
        return YSDSDate.fromDate(new Date())
    }

    public static parse(value: string, format?: string): YSDSDate | undefined {
        if (typeof format === 'undefined' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
            // it seems webkit cannot natively parse dates of
            // format "yyyy-MM-dd HH:mm:ss". however, if we
            // replace the space between dd and HH with a T
            // the string is accepted.
            if (value.length > 10) {
                const chars = value.split('')
                chars[10] = 'T'
                value = chars.join('')
            }

            // javascript behaves very inconsistently when parsing
            // dates of yyyy-MM-dd format. it appears the parse stage
            // defaults to UTC timezone, which is weird since all other
            // methods of Date.prototype returns values in the local
            // timezone. if your local timezone is behind UTC you can end
            // up in weird scenarios like this:
            //
            //     new Date('2019-03-14').getDate() => 13
            //
            // to fix this we'll append 00:00:00 plus the local
            // timezone to force the implementation to actually create
            // a correct date for us.
            if (value.length === 10) {
                const now = YSDSDate.now()
                value += now.format('T00:00:00xxx')
            }

            const dt = new Date(value)

            if (isNaN(dt.getTime())) {
                return undefined
            }

            return YSDSDate.fromDate(dt)
        }

        return unicodeParser.parse(value, format || 'yyyy-MM-dd HH:mm:ss')
    }

    public toDate(): Date {
        return new Date(this.backend.getTime())
    }

    public withComponent(component: DateComponent, value: number): YSDSDate {
        const dt = this.toDate()
        const fn = setterMap[component] as (this: Date, value: number) => void
        fn.call(dt, value)
        return YSDSDate.fromDate(dt)
    }

    public getComponent(component: DateComponent): number {
        return getterMap[component].call(this.backend)
    }

    public add(component: DateComponent, value: number): YSDSDate {
        return this.withComponent(component, this.getComponent(component) + value)
    }

    public format(format: string): string {
        return unicodeFormatter.format(this, format)
    }
}

// an implementation of DateFormatterInterface that formats
// using a map of patterns.
export class ReplacementFormatter implements DateFormatterInterface {

    protected replacements: ReadonlyMap<Func2<YSDSDate, DateFormatterInterface, StringLike>>
    protected regexp: RegExp

    constructor(replacements: ReadonlyMap<Func2<YSDSDate, DateFormatterInterface, StringLike>>) {
        this.replacements = replacements
        this.regexp = new RegExp(
            orderDescendingByLength(Object.keys(this.replacements)).join('|'), 'g'
        )
    }

    public format(date: YSDSDate | Date, format: string): string {
        if (date instanceof Date) {
            date = YSDSDate.fromDate(date)
        }
        return format.replace(this.regexp, match => {
            return this.replacements[match](date as YSDSDate, this).toString()
        })
    }
}

// an implementation of DateFormatConverterInterface that
// simply converts using a map of pattern replacements.
export class ReplacementConverter implements DateFormatConverterInterface {

    private readonly replacements: ReadonlyMap<string>
    private readonly regexp: RegExp

    constructor(replacements: ReadonlyMap<string>) {
        this.replacements = replacements

        // extract the strings to be replaced and sort them
        // according to length so the longest strings are
        // replaced first. if we don't do this we might end up
        // with weird cases where 'yy' with replacements { y: '1', yy: '2' }
        // gets converted into '11', where it should be '2'.
        this.regexp = new RegExp(
            orderDescendingByLength(Object.keys(replacements)).join('|'), 'g'
        )
    }

    public convert(from: string): string {
        return from.replace(this.regexp, match => {
            return this.replacements[match]
        })
    }
}

export class PatternParser implements DateParserInterface {

    protected readonly patterns: ReadonlyMap<[string, DateComponent]>
    protected readonly cache: Map<[RegExp, ReadonlyArray<DateComponent>]> = {}

    constructor(patterns: ReadonlyMap<[string, DateComponent]>) {
        this.patterns = patterns
    }

    protected buildMatchingSequence(format: string): [RegExp, ReadonlyArray<DateComponent>] {
        if (!this.cache.hasOwnProperty(format)) {
            // build a regex containing all formatting descriptors
            const formatRegex = orderDescendingByLength(Object.keys(this.patterns)).join('|')

            // using the formatting descriptors we construct a new
            // regex with the actual date matching patterns. we also
            // save the matching date component so we can keep track
            // of which part of the date to change with the match.
            const components: Array<DateComponent> = []
            const dateRegex = format.replace(new RegExp(formatRegex, 'g'), match => {
                const p = this.patterns[match]
                components.push(p[1])
                return `(${p[0]})`
            })
            this.cache[format] = [new RegExp(dateRegex), components]
        }
        return this.cache[format]
    }

    public parse(value: string, format: string): YSDSDate | undefined {
        const seq = this.buildMatchingSequence(format)
        const matches = seq[0].exec(value)

        if (matches === null) {
            return undefined
        }

        const dt = new Date()

        for (let i = 1; i < matches.length; i++) {
            const component = seq[1][i - 1]
            const fn = setterMap[component] as (this: Date, value: number) => void
            fn.call(dt, parseInt(matches[i]))
        }

        return YSDSDate.fromDate(dt)
    }
}

export const unicodeParser = new PatternParser({
    yyyy: ['\\d{4}', DateComponent.Year],
    MM: ['\\d{2}', DateComponent.Month],
    dd: ['\\d{2}', DateComponent.Date],
    HH: ['\\d{2}', DateComponent.Hour],
    mm: ['\\d{2}', DateComponent.Minute],
    ss: ['\\d{2}', DateComponent.Second],
})

const twelveHourClockHours = [
    12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
]

// http://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
export const unicodeFormatter = new ReplacementFormatter({
    yyyy: date => date.year,
    yy: date => date.year.toString().slice(-2),
    MM: date => padLeft(date.month.toString(), 2, '0'),
    dd: date => padLeft(date.date.toString(), 2, '0'),
    HH: date => padLeft(date.hour.toString(), 2, '0'),
    hh: date => padLeft(twelveHourClockHours[date.hour].toString(), 2, '0'),
    h: date => twelveHourClockHours[date.hour],
    mm: date => padLeft(date.minute.toString(), 2, '0'),
    ss: date => padLeft(date.second.toString(), 2, '0'),
    d: date => date.date,
    M: date => date.month,
    xxx: date => {
        const offset = date.timezoneOffset
        const sign = offset <= 0 ? '+' : '-'
        const hours = Math.floor(Math.abs(offset) / 60)
        const minutes = Math.abs(offset) % 60
        return sign +
            padLeft(hours.toString(), 2, '0') +
            ':' +
            padLeft(minutes.toString(), 2, '0')
    },
    xx: (date, fmt) => {
        return fmt.format(date, 'xxx').replace(':', '')
    },
    a: date => date.hour < 12 ? 'am' : 'pm',
})

export const phpFormatter: DateFormatterInterface = {
    format(date, format) {
        format = phpToUnicodeConverter.convert(format)
        return unicodeFormatter.format(date, format)
    },
}

// http://php.net/manual/en/function.date.php
// bootstrap format extracted from "bootstrap-datepicker.js"
export const phpToBootstrapConverter = new ReplacementConverter({
    Y: 'yyyy',
    m: 'mm',
    d: 'dd',
    j: 'd',
    n: 'm',
})

// http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_Patterns
export const phpToUnicodeConverter = new ReplacementConverter({
    Y: 'yyyy',
    m: 'MM',
    d: 'dd',
    H: 'HH',
    i: 'mm',
    s: 'ss',
    j: 'd',
    n: 'M',
    A: 'a',
    g: 'h',
})

// http://php.net/manual/en/function.date.php
// https://momentjs.com/docs/#/displaying/
export const phpToMomentConverter = new ReplacementConverter({
    Y: 'YYYY',
    m: 'MM',
    d: 'DD',
    H: 'HH',
    i: 'mm',
    s: 'ss',
    j: 'D',
    n: 'M',
    A: 'A',
    g: 'h',
})
