import {VariadicFunc} from "./types";

export function debounce<T extends any[]>(func: VariadicFunc<T, any>, wait: number): VariadicFunc<T, void> {
    let timeout: number | undefined
    return function (this: any, ...args: T) {
        const context = this

        function later() {
            timeout = undefined
            func.apply(context, args)
        }

        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}
