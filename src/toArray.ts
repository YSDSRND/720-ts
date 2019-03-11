export function toArray<T>(items: ArrayLike<T>): ReadonlyArray<T> {
    return Array.prototype.slice.call(items)
}
