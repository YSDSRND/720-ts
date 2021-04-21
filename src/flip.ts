import {Map, ReadonlyMap, StringLike} from "./types";

export function flip<T extends StringLike>(obj: ReadonlyMap<T>): ReadonlyMap<string> {
    const result: Map<string> = {}
    Object.entries(obj).forEach(e => {
        const [key, value] = e
        result[value.toString()] = key
    })
    return result
}
