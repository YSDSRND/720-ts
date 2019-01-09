export function unique<T>(items: ArrayLike<T>): ReadonlyArray<T> {
    const out: Array<T> = []
    for (let i = 0; i < items.length; ++i) {
        const item = items[i]
        if (out.indexOf(item) === -1) {
            out.push(item)
        }
    }
    return out
}
