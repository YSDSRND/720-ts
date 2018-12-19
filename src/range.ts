export function range(start: number, end: number, step: number = 1): ReadonlyArray<number> {
    // the result set is of known size so we can gain
    // some performance by pre-allocating the array.
    const result = new Array<number>(
        Math.floor((end-start)/step)
    )

    for (let i = start, j = 0; i < end; i += step, ++j) {
        result[j] = i
    }

    return result
}
