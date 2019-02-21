import {padLeft} from "./pad";
import {Map, Func1, ReadonlyMap} from "./types";
import {flip} from "./flip";

export const enum DateComponent {
    Year, Month, Date, Hour, Minute, Second, Milliseconds,
}

export interface DateFormatterInterface {
    format(date: YSDSDate | Date, format: string): string
}

export interface DateFormatConverterInterface {
    convert(from: string): string
}

const getterMap = {
    [DateComponent.Year]: Date.prototype.getFullYear,
    [DateComponent.Month]: function (this: Date) {
        return this.getMonth() + 1
    },
    [DateComponent.Date]: Date.prototype.getDate,
    [DateComponent.Hour]: Date.prototype.getHours,
    [DateComponent.Minute]: Date.prototype.getMinutes,
    [DateComponent.Second]: Date.prototype.getSeconds,
    [DateComponent.Milliseconds]: Date.prototype.getMilliseconds,
}

const setterMap = {
    [DateComponent.Year]: Date.prototype.setFullYear,
    [DateComponent.Month]: function (this: Date, value: number) {
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
    [DateComponent.Milliseconds]: Date.prototype.setMilliseconds,
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

    public get milliseconds(): number {
        return this.getComponent(DateComponent.Milliseconds)
    }

    constructor(
        year: number,
        month: number,
        date: number,
        hour: number = 0,
        minute: number = 0,
        second: number = 0,
        milliseconds: number = 0
    ) {
        this.backend = new Date(year, month - 1, date, hour, minute, second, milliseconds)
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
        return getterMap[component].call(this.toDate())
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

    protected replacements: Map<Func1<YSDSDate, string | number>>
    protected regexp: RegExp

    constructor(replacements: Map<Func1<YSDSDate, string | number>>) {
        this.replacements = replacements
        this.regexp = new RegExp(Object.keys(this.replacements).join('|'), 'g')
    }

    public format(date: YSDSDate | Date, format: string): string {
        if (date instanceof Date) {
            date = YSDSDate.fromDate(date)
        }
        return format.replace(this.regexp, match => {
            return this.replacements[match](date as YSDSDate).toString()
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
        const keys = Object.keys(this.replacements).sort((a, b) => {
            const lenA = a.length
            const lenB = b.length
            if (lenA === lenB) {
                return 0
            }
            return lenA > lenB ? -1 : 1
        })

        this.regexp = new RegExp(keys.join('|'), 'g')
    }

    public convert(from: string): string {
        return from.replace(this.regexp, match => this.replacements[match])
    }

    public reversed(): DateFormatConverterInterface {
        return new ReplacementConverter(
            flip(this.replacements)
        )
    }

}

// http://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
export const unicodeFormatter = new ReplacementFormatter({
    yyyy: date => date.year,
    yy: date => date.year.toString().slice(-2),
    MM: date => padLeft(date.month.toString(), 2, '0'),
    dd: date => padLeft(date.date.toString(), 2, '0'),
    HH: date => padLeft(date.hour.toString(), 2, '0'),
    mm: date => padLeft(date.minute.toString(), 2, '0'),
    ss: date => padLeft(date.second.toString(), 2, '0'),
    d: date => date.date,
    M: date => date.month,
    xx: date => {
        const offset = date.toDate().getTimezoneOffset()
        const sign = offset <= 0 ? '+' : '-'
        const hours = Math.floor(Math.abs(offset) / 60)
        const minutes = Math.abs(offset) % 60
        return sign +
            padLeft(hours.toString(), 2, '0') +
            padLeft(minutes.toString(), 2, '0')
    },
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
