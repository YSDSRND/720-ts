import {VariadicFunc} from "./types";

export function throttle<T extends any[]>(func: VariadicFunc<T, any>, wait: number): VariadicFunc<T, void> {
    let timeout: number | undefined
    return function (this: any, ...args: T) {
        const context = this

        function later() {
            timeout = undefined
            func.apply(context, args)
        }

        if (typeof timeout === 'undefined') {
            timeout = setTimeout(later, wait)
        }
    }
}
