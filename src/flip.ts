import {Map, ReadonlyMap, StringLike} from "./types";

export function flip<T extends StringLike>(obj: ReadonlyMap<T>): ReadonlyMap<string> {
    const result: Map<string> = {}
    Object.keys(obj).forEach(key => {
        const value = obj[key].toString()
        result[value] = key
    })
    return result
}
