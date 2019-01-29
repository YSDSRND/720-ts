import {Func1, Func2, StringLike} from "./types"
import {toArray} from "./toArray";

export function orderByWithComparator<T>(items: ArrayLike<T>, comparator: Func2<T, T, number>): ReadonlyArray<T> {
    const arrayed = toArray(items).slice()
    arrayed.sort(comparator)
    return arrayed
}

export function orderBy<T>(items: ArrayLike<T>, getComparable?: Func1<T, StringLike>, direction?: 'asc' | 'desc'): ReadonlyArray<T> {
    const collator = new Intl.Collator('en', {
        usage: 'sort',
        sensitivity: 'variant',
        caseFirst: 'upper',
        numeric: true,
    })
    const directionMultiplier = !direction || direction === 'asc' ? 1 : -1
    const getStringLike = getComparable || function(item: T) {
        return item.toString()
    }
    return orderByWithComparator(items, function(a, b) {
        return directionMultiplier * collator.compare(
            getStringLike(a).toString(),
            getStringLike(b).toString()
        )
    })
}
