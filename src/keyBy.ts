import {Func1, StringLike, Map, ReadonlyMap} from "./types";

export function keyBy<T>(data: ArrayLike<T>, getKey: Func1<T, StringLike>): ReadonlyMap<T> {
    const map: Map<T> = {}

    for (let i = 0; i < data.length; i++) {
        const el = data[i]
        const key = getKey(el).toString()
        map[key] = el
    }

    return map
}
