export function toArray<T>(items: ArrayLike<T>): ReadonlyArray<T> {
    const arrayed = new Array(items.length)
    for (let i = 0; i < items.length; i++) {
        arrayed[i] = items[i]
    }
    return arrayed
}
