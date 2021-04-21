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

    for (const part of parts) {
        if (!Object.prototype.hasOwnProperty.call(slice, part)) {
            return undefined
        }
        slice = (slice as any)[part]
    }

    return slice
}
