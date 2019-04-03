import { ReadonlyMap, Map } from "./types";
import { toArray } from "./toArray";

type FormElement =
    HTMLInputElement |
    HTMLSelectElement |
    HTMLTextAreaElement

type FormValue = string | number | boolean
type ValueGetter = (element: FormElement) => FormValue

export const defaultValueGetter: ValueGetter = element => {
    if (element.type === 'checkbox') {
        return (element as HTMLInputElement).checked
    }
    return element.value
}

// match names like
// name=hello    <-- string
// name=hello[]  <-- array
// name=hello[0] <-- array
const namePattern = /([^\[\]]+)(?:\[([^\[\]]*)\])?$/

interface WriteArrayLike<T> {
    length: number
    [key: number]: T
}

export function formToObject(container: Element, getValue: ValueGetter = defaultValueGetter): ReadonlyMap<FormValue | ReadonlyArray<FormValue> | ReadonlyMap<FormValue>> {
    const children = container.querySelectorAll<FormElement>('[name]')

    return toArray(children).reduce((carry, child) => {
        const matches = namePattern.exec(child.name)

        if (matches) {
            const name = matches[1]
            const value = getValue(child)

            // is our name a nested array or object-like value?
            if (typeof matches[2] !== 'undefined') {
                const keyName = matches[2]

                if (!carry.hasOwnProperty(name)) {
                    carry[name] = !keyName || /^\d+$/.test(keyName) ? [] : {}
                }

                // if keyName is falsy we're setting an array-like property without
                // an explicit key. this is common when just pushing stuff into an array.
                //
                //   name=my_values[]
                //
                if (!keyName) {
                    (carry[name] as Array<FormValue>).push(value)
                } else {
                    (carry[name] as WriteArrayLike<FormValue>)[keyName as any] = value
                }
            } else {
                carry[name] = value
            }
        }

        return carry
    }, {} as Map<FormValue | ReadonlyArray<FormValue> | ReadonlyMap<FormValue>>)
}
