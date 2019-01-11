export function set(item: any, path: string, value: any): void {
    const parts = path
        .replace(/^\[/, '') // remove leading bracket
        .replace(/\]$/, '') // remove ending bracket
        .replace(/\]?\[/g, '.') // replace brackets with dots
        .split('.')

    let slice = item
    // we want to use the last part of the path
    // to put the value into place, so let's keep
    // one item in the parts array.
    while (parts.length > 1) {
        const part = parts.shift()!
        if (!Object.prototype.hasOwnProperty.call(slice, part)) {
            slice[part] = {}
        }
        slice = slice[part]
    }
    slice[parts[0]] = value
}
