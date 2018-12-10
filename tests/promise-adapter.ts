import {Promise} from "../src/promise";

export const resolved = Promise.resolve
export const rejected = Promise.reject
export function deferred() {
    let a, b
    let promise = new Promise((resolve, reject) => {
        a = resolve
        b = reject
    })

    return {
        promise: promise,
        resolve: a,
        reject: b,
    }
}
