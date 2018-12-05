import {Func1, StringLike, ReadonlyMap, Map} from "./types";

export function groupBy<T>(data: ArrayLike<T>, getKey: Func1<T, StringLike>): ReadonlyMap<ReadonlyArray<T>> {
    const map: Map<Array<T>> = {}

    for (let i = 0; i < data.length; i++) {
        const el = data[i]
        const key = getKey(el).toString()
        if (!map.hasOwnProperty(key)) {
            map[key] = []
        }
        map[key].push(el)
    }

    return map
}
