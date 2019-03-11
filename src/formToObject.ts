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
const namePattern = /([^\[\]]+)(\[\d*\])?$/

export function formToObject(container: Element, getValue: ValueGetter = defaultValueGetter): ReadonlyMap<FormValue | ReadonlyArray<FormValue>> {
    const children = container.querySelectorAll<FormElement>('[name]')

    return toArray(children).reduce((carry, child) => {
        const matches = namePattern.exec(child.name)

        if (matches) {
            const name = matches[1]
            const value = getValue(child)

            // is our name an array?
            if (matches[2]) {
                carry[name] = carry[name] || [];
                (carry[name] as Array<FormValue>).push(value)
            } else {
                carry[name] = value
            }
        }

        return carry
    }, {} as Map<FormValue | ReadonlyArray<FormValue>>)
}
