import {Func1, StringLike, Map, ReadonlyMap} from "./types";

export function keyBy<T>(data: ReadonlyArray<T>, getKey: Func1<T, StringLike>): ReadonlyMap<T> {
    const map: Map<T> = {}

    for (const el of data) {
        const key = getKey(el).toString()
        map[key] = el
    }

    return map
}
