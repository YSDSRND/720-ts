import {Promise} from "../src/promise";

export const resolved = function(value: any) {
    return new Promise((resolve, reject) => {
        resolve(value)
    })
}
export const rejected = function(value: any) {
    return new Promise((resolve, reject) => {
        reject(value)
    })
}
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
