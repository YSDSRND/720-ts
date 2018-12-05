import {Func1} from "./types";

export function findIndex<T>(data: ArrayLike<T>, predicate: Func1<T, boolean>): number | undefined {
    for (let i = 0; i < data.length; i++) {
        if (predicate(data[i])) {
            return i
        }
    }
    return undefined
}
