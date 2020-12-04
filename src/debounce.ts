import {VariadicFunc} from "./types";

export function debounce<T extends any[]>(func: VariadicFunc<T, unknown>, wait: number): VariadicFunc<T, void> {
    let currentContext: unknown
    let currentArguments: T
    let timeout: number | undefined

    function later(): void {
        timeout = undefined
        func.apply(currentContext, currentArguments)
    }

    return function (this: unknown, ...args: T): void {
        currentContext = this
        currentArguments = args

        window.clearTimeout(timeout)
        timeout = window.setTimeout(later, wait)
    }
}
