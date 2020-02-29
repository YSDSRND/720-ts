import {throttle} from "../src/throttle";

describe('throttle tests', () => {

    jest.setTimeout(10000)

    let calls: number = 0

    beforeEach(() => {
        calls = 0
    })

    const fn = throttle(() => {
        return ++calls
    }, 500)

    it('should call function once if called repeatedly', (done) => {
        fn()
        fn()
        fn()

        setTimeout(() => {
            expect(calls).toBe(1)
            done()
        }, 600)
    })

    // this test highlights the difference between debounce & throttle.
    // a debounced function determines its timeout from the last function
    // call while a throttled function uses the first.
    it('should call the function when the first timeout expires', (done) => {
        fn()
        fn()
        fn()

        setTimeout(() => {
            fn()
        }, 300)

        setTimeout(() => {
            expect(calls).toBe(1)
            done()
        }, 600)
    })

    it('should call the function multiple times if the threshold is passed', (done) => {
        fn()
        fn() // this call will be ignored

        setTimeout(() => {
            fn() // this will be executed after 1100ms
        }, 600)

        setTimeout(() => {
            expect(calls).toBe(2)
            done()
        }, 1500)
    })

})
