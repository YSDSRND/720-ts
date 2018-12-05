import {Func1} from "./types";
import {findIndex} from "./findIndex";

export function find<T>(data: ArrayLike<T>, predicate: Func1<T, boolean>): T | undefined {
    const idx = findIndex(data, predicate)

    if (typeof idx === 'undefined') {
        return undefined
    }

    return data[idx]
}
