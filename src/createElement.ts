export function createElement<T extends HTMLElement>(
    type: string,
    props: Partial<T> = {},
    children: ReadonlyArray<string | Node> = []): T {
    const element = document.createElement(type) as T

    for (const key in props) {
        const value = props[key]

        // we're setting a data property.
        if (key.indexOf('data-') === 0) {
            element.dataset[key.substr(5)] = value.toString()
        } else {
            element[key] = value!
        }
    }

    children.forEach(child => {
        child = typeof child === 'string' ? document.createTextNode(child) : child
        element.appendChild(child)
    })

    return element
}
