export function createElement<K extends keyof HTMLElementTagNameMap>(
    type: K,
    props: Partial<HTMLElementTagNameMap[K]> = {},
    children: ReadonlyArray<string | Node> = []): HTMLElementTagNameMap[K] {
    const element = document.createElement(type)

    for (const child of children) {
        const node = typeof child === 'string'
            ? document.createTextNode(child)
            : child
        element.appendChild(node)
    }

    for (const key in props) {
        if (!Object.prototype.hasOwnProperty.call(props, key)) {
            continue
        }
        element[key] = props[key]!
    }

    return element
}
