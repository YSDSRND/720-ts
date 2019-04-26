import {VariadicFunc, Func1} from "./types";
import {Promise} from "./promise";

export function debounce<T extends any[], U>(func: VariadicFunc<T, U | PromiseLike<U>>, wait: number): VariadicFunc<T, PromiseLike<U>> {
    let timeout: number | undefined
    let resolveFns: Array<Func1<U, void>> = []

    return function (this: any, ...args: T) {
        const context = this

        function later() {
            timeout = undefined
            const result = func.apply(context, args)
            Promise.resolve(result).then(res => {
                resolveFns.forEach(fn => fn(res))
                resolveFns = []
            })
        }

        clearTimeout(timeout)
        timeout = setTimeout(later, wait)

        return new Promise(resolve => {
            resolveFns.push(resolve)
        })
    }
}
