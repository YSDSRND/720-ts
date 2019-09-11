import {VariadicFunc} from "./types";

export function throttle<T extends any[]>(func: VariadicFunc<T, unknown>, wait: number): VariadicFunc<T, void> {
    let timeout: number | undefined
    return function (this: unknown, ...args: T) {
        const context = this

        function later() {
            timeout = undefined
            func.apply(context, args)
        }

        if (typeof timeout === 'undefined') {
            timeout = window.setTimeout(later, wait)
        }
    }
}
