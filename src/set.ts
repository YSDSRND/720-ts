import {getPartsOfPath} from "./get";

export function set(item: unknown, path: string, value: unknown): void {
    const parts = getPartsOfPath(path)
    let slice = item

    // we want to use the last part of the path
    // to put the value into place, so let's keep
    // one item in the parts array.
    const endIndex = parts.length - 1

    for (let i = 0; i < endIndex; ++i) {
        const part = parts[i]

        if (typeof part === 'undefined') {
            return
        }

        if (!Object.prototype.hasOwnProperty.call(slice, part)) {
            (slice as any)[part] = {}
        }

        slice = (slice as any)[part]
    }

    const lastPart = parts[endIndex];

    if (lastPart) {
        (slice as any)[lastPart] = value
    }
}
