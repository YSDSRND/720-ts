export function getPartsOfPath(path: string): ReadonlyArray<string> {
    return path
        .replace(/^\[/, '') // remove leading bracket
        .replace(/\]$/, '') // remove trailing bracket
        .replace(/\]?\[/g, '.') // replace brackets with dots
        .split('.')
}

export function get<T>(item: unknown, path: string): T | undefined {
    const parts = getPartsOfPath(path)
    let slice = item as T

    for (let i = 0; i < parts.length; ++i) {
        const part = parts[i]

        if (!Object.prototype.hasOwnProperty.call(slice, part)) {
            return undefined
        }
        slice = (slice as any)[part]
    }

    return slice
}
