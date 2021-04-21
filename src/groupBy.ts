import {Func1, StringLike, ReadonlyMap, Map} from "./types";

export function groupBy<T>(data: ReadonlyArray<T>, getKey: Func1<T, StringLike>): ReadonlyMap<ReadonlyArray<T>> {
    const map: Map<Array<T>> = {}

    for (const el of data) {
        const key = getKey(el).toString()
        if (!map.hasOwnProperty(key)) {
            map[key] = []
        }
        map[key]?.push(el)
    }

    return map
}
