// to improve the type safety of "assign()" we can
// make use of the generic tuples introduced in TS3.0.
// extracting a union type of all tuple members is
// fairly straightforward. however, an intersection
// of all members is more difficult... so here is some
// magic from the interwebs.
//
// https://stackoverflow.com/a/50375286
type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

type Result<T, U> = T & UnionToIntersection<U[keyof U]>

export function assign<T, U extends any[]>(target: T, ...sources: U): Result<T, U> {
    const t = target as Result<T, U>

    for (const source of sources) {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                t[key as keyof T] = source[key]
            }
        }
    }

    return t
}
