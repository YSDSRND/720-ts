import {throttle} from "../src/throttle";

describe('throttle tests', () => {

    let calls: number = 0

    beforeEach(() => {
        calls = 0
    })

    const fn = throttle(() => {
        return ++calls
    }, 100)

    it('should call function once if called repeatedly', (done) => {
        fn()
        fn()
        fn()

        setTimeout(() => {
            expect(calls).toBe(1)
            done()
        }, 120)
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
        }, 80)

        setTimeout(() => {
            expect(calls).toBe(1)
            done()
        }, 120)
    })

    it('should call the function multiple times if the threshold is passed', (done) => {
        fn()
        fn() // this call will be ignored

        setTimeout(() => {
            fn() // this will be executed after 220ms
        }, 120)

        setTimeout(() => {
            expect(calls).toBe(2)
            done()
        }, 300)
    })

})
