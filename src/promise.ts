import {Func, Func1} from "./types";

type Handler<T, U> = Func1<T, U | PromiseLike<U>>
type Initializer<T> = {
    (fulfill: Func1<T, void>, reject: Func1<any, void>): void
}
type ThenFunction<T> = {
    (onFulfill: Handler<T, void>, onReject: Handler<any, void>): void
}

const enum State {
    Pending,
    Fulfilled,
    Rejected,
}

function nextTick(func: Func<void>) {
    setTimeout(func, 0)
}

export function isPromiseLike(maybePromise: any): maybePromise is PromiseLike<any> {
    return typeof maybePromise !== 'undefined' && typeof maybePromise.then === 'function'
}

// minimal A+ compliant promise implementation.
// loosely based on https://github.com/William17/taxi.
export class Promise<T> implements PromiseLike<T> {

    protected onFulfills: Array<Handler<T, any>>
    protected onRejects: Array<Handler<any, any>>
    protected state: State
    protected value: any

    constructor(init?: Initializer<T>) {
        this.onFulfills = []
        this.onRejects = []
        this.state = State.Pending

        if (init) {
            const fulfill = this.settle.bind(this, State.Fulfilled)
            const reject = this.settle.bind(this, State.Rejected)
            init(fulfill, reject)
        }
    }

    protected settle(state: State, value: any): void {
        if (this.state != State.Pending) {
            return
        }
        this.state = state
        this.value = value

        nextTick(() => {
            const handlers = state == State.Fulfilled ?
                this.onFulfills :
                this.onRejects

            for (const fn of handlers) {
                fn(value)
            }

            this.onFulfills = []
            this.onRejects = []
        })
    }

    protected fulfill(value: T): void {
        this.settle(State.Fulfilled, value)
    }

    protected reject(value: any): void {
        this.settle(State.Rejected, value)
    }

    protected addDoneHandler(onFulfill: Handler<T, any>, onReject: Handler<any, any>): void {
        if (this.state == State.Pending) {
            this.onFulfills.push(onFulfill)
            this.onRejects.push(onReject)
            return
        }

        nextTick(() => {
            if (this.state == State.Fulfilled) {
                onFulfill(this.value)
                return
            }
            onReject(this.value)
        })
    }

    protected createDoneHandler<U>(other: Promise<U>, handler: any, method: 'fulfill' | 'reject') {
        return function (result: any) {
            if (typeof handler === 'function') {
                try {
                    // 2.2.7.1
                    // If either onFulfilled or onRejected returns a value x,
                    // run the Promise Resolution Procedure [[Resolve]](promise2, x).
                    Promise.executeResolutionProcedure(other, handler(result))
                }
                catch (e) {
                    // 2.2.7.2
                    // If either onFulfilled or onRejected throws an exception e,
                    // promise2 must be rejected with e as the reason.
                    other.reject(e)
                }

                return
            }
            // 2.2.1.1
            // If onFulfilled is not a function, it must be ignored.
            // 2.2.1.2
            // If onRejected is not a function, it must be ignored.
            // 2.2.7.3
            // If onFulfilled is not a function and promise1 is fulfilled,
            // promise2 must be fulfilled with the same value as promise1.
            // 2.2.7.4
            // If onRejected is not a function and promise1 is rejected,
            // promise2 must be rejected with the same reason as promise1.
            other[method](result)
        }
    }

    public then<U, UErr>(onFulfill?: Handler<T, U>, onReject?: Handler<any, UErr>): PromiseLike<U | UErr> {
        // 2.2.7
        // then must return a promise
        const promise = new Promise<T | U | UErr>()

        // 2.2.2
        // If onFulfilled is a function:
        // 2.2.2.1
        // it must be called after promise is fulfilled,
        // with promise’s value as its first argument.
        // 2.2.3
        // If onRejected is a function,
        // 2.2.3.1
        // it must be called after promise is rejected,
        // with promise’s reason as its first argument.
        this.addDoneHandler(
            this.createDoneHandler(promise, onFulfill, 'fulfill'),
            this.createDoneHandler(promise, onReject, 'reject')
        )

        return promise
    }

    // 2.3
    // The Promise Resolution Procedure
    // [[Resolve]](promise, x)
    protected static executeResolutionProcedure<T>(promise: Promise<T>, value: any) {
        // 2.3.1
        // If promise and x refer to the same object,
        // reject promise with a TypeError as the reason.
        if (promise === value) {
            promise.reject(new TypeError('The promise and its value refer to the same object'))
        }

        const type = typeof value

        // 2.3.3
        // if x is an object or function
        if (value && (type === 'function' || type === 'object')) {
            // 2.3.3.3
            // If both resolvePromise and rejectPromise are called,
            // or multiple calls to the same argument are made,
            // the first call takes precedence,
            // and any further calls are ignored.
            let called = false

            try {
                // 2.3.3.1
                // Let then be x.then.
                let then: ThenFunction<T> = value.then

                if (typeof then === 'function') {
                    // 2.3.3.3
                    // If then is a function,
                    // call it with x as this,
                    // first argument resolvePromise,
                    // and second argument rejectPromise,
                    then.call(value, function (y: T) {
                        // 2.3.3.3.1
                        // If/when resolvePromise is called with a value y,
                        // run [[Resolve]](promise, y).
                        if (!called) {
                            called = true
                            Promise.executeResolutionProcedure(promise, y)
                        }
                    }, function (reason: any) {
                        // 2.3.3.3.2
                        // If/when rejectPromise is called with a reason r,
                        // reject promise with r.
                        if (!called) {
                            called = true
                            promise.reject(reason)
                        }
                    })

                    return
                }

                // 2.3.3.4
                // If then is not a function,
                // fulfill promise with x.
                promise.fulfill(value)
            } catch (e) {
                // 2.3.3.2
                // If retrieving the property x.then results in a thrown exception e,
                // reject promise with e as the reason.
                if (!called) {
                    called = true
                    promise.reject(e)
                }
            }

            return
        }

        // 2.3.4
        // If x is not an object or function,
        // fulfill promise with x.
        promise.fulfill(value)
    }

    public static resolve<T>(maybePromise: T | PromiseLike<T>): PromiseLike<T> {
        if (isPromiseLike(maybePromise)) {
            return maybePromise
        }
        return new Promise((resolve, reject) => {
            resolve(maybePromise)
        })
    }

    public static reject<T>(reason: any): PromiseLike<T> {
        return new Promise((resolve, reject) => {
            reject(reason)
        })
    }

    public static all<T1, T2>(
        promises: [PromiseLike<T1>, PromiseLike<T2>]
    ): PromiseLike<[T1, T2]>;

    public static all<T1, T2, T3>(
        promises: [PromiseLike<T1>, PromiseLike<T2>, PromiseLike<T3>]
    ): PromiseLike<[T1, T2, T3]>;

    public static all<T1, T2, T3, T4>(
        promises: [PromiseLike<T1>, PromiseLike<T2>, PromiseLike<T3>, PromiseLike<T4>]
    ): PromiseLike<[T1, T2, T3, T4]>;

    public static all<T1, T2, T3, T4, T5>(
        promises: [PromiseLike<T1>, PromiseLike<T2>, PromiseLike<T3>, PromiseLike<T4>, PromiseLike<T5>]
    ): PromiseLike<[T1, T2, T3, T4, T5]>;

    public static all<T1, T2, T3, T4, T5, T6>(
        promises: [PromiseLike<T1>, PromiseLike<T2>, PromiseLike<T3>, PromiseLike<T4>, PromiseLike<T5>, PromiseLike<T6>]
    ): PromiseLike<[T1, T2, T3, T4, T5, T6]>;

    public static all<T1, T2, T3, T4, T5, T6, T7>(
        promises: [PromiseLike<T1>, PromiseLike<T2>, PromiseLike<T3>, PromiseLike<T4>, PromiseLike<T5>, PromiseLike<T6>, PromiseLike<T7>]
    ): PromiseLike<[T1, T2, T3, T4, T5, T6, T7]>;

    public static all<T>(promises: ReadonlyArray<PromiseLike<T>>): PromiseLike<ReadonlyArray<T>>;

    public static all(promises: ReadonlyArray<PromiseLike<any>>): PromiseLike<ReadonlyArray<any>> {
        return new Promise((resolve, reject) => {
            const results: Array<any> = []
            let ok = 0

            for (let i = 0; i < promises.length; ++i) {
                results.push(undefined)
                promises[i].then(res => {
                    results[i] = res
                    if (++ok === promises.length) {
                        resolve(results)
                    }
                }, reason => {
                    reject(reason)
                })
            }
        })
    }

}
