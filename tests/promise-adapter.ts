import {Promise} from "../src/promise";

export const resolved = Promise.fulfilled
export const rejected = Promise.rejected
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
