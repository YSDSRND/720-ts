export function get<T>(item: any, path: string): T | undefined {
    const parts = path.split('.')
    let slice = item
    let part
    while ((part = parts.shift()) !== undefined) {
        slice = slice[part]
        if (!slice) {
            return undefined
        }
    }
    return slice
}
