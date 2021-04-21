export function unique<T>(items: ReadonlyArray<T>): ReadonlyArray<T> {
    const out: Array<T> = []
    for (const item of items) {
        if (out.indexOf(item) === -1) {
            out.push(item)
        }
    }
    return out
}
