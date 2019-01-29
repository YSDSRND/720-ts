import {getPartsOfPath} from "./get";

export function set(item: any, path: string, value: any): void {
    const parts = getPartsOfPath(path)
    let slice = item

    // we want to use the last part of the path
    // to put the value into place, so let's keep
    // one item in the parts array.
    const endIndex = parts.length - 1

    for (let i = 0; i < endIndex; ++i) {
        const part = parts[i]

        if (!Object.prototype.hasOwnProperty.call(slice, part)) {
            slice[part] = {}
        }

        slice = slice[part]
    }

    slice[parts[endIndex]] = value
}
