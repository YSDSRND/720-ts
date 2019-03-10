export function objectContains(object: object, needle: string): boolean {
    needle = needle.toLowerCase()

    const stack: Array<object> = [object]
    let part: object | undefined

    while (typeof (part = stack.shift()) !== 'undefined') {
        for (const key of Object.keys(part)) {
            const value = (part as any)[key]

            if (value === null) {
                continue
            }

            switch (typeof value) {
                case 'undefined':
                case 'function':
                    continue
                case 'object':
                    stack.push(value)
                    continue
            }

            if (value.toString().toLowerCase().indexOf(needle) !== -1) {
                return true
            }
        }
    }

    return false
}
