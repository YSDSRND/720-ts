export function createElement<K extends keyof HTMLElementTagNameMap>(
    type: K,
    props: Partial<HTMLElementTagNameMap[K]> = {},
    children: ReadonlyArray<string | Node> = []): HTMLElementTagNameMap[K] {
    const element = document.createElement(type) as HTMLElementTagNameMap[K]

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
