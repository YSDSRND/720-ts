export function get<T>(item: any, path: string): T | undefined {
    const parts = path
        .replace(/^\[/, '') // remove leading bracket
        .replace(/\]$/, '') // remove ending bracket
        .replace(/\]?\[/g, '.') // replace brackets with dots
        .split('.')

    let slice = item
    let part
    while ((part = parts.shift()) !== undefined) {
        if (!Object.prototype.hasOwnProperty.call(slice, part)) {
            return undefined
        }
        slice = slice[part]
    }
    return slice
}
