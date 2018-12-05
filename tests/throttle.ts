import {throttle} from "../src/throttle";

describe('throttle tests', function () {

    let calls: number = 0

    beforeEach(function () {
        calls = 0
    })

    const fn = throttle(function () {
        return ++calls
    }, 100)

    it('should call function once if called repeatedly', function (done) {
        fn()
        fn()
        fn()

        setTimeout(function () {
            expect(calls).toBe(1)
            done()
        }, 120)
    })

    // this test highlights the difference between debounce & throttle.
    // a debounced function determines its timeout from the last function
    // call while a throttled function uses the first.
    it('should call the function when the first timeout expires', function (done) {
        fn()
        fn()
        fn()

        setTimeout(function () {
            fn()
        }, 80)

        setTimeout(function () {
            expect(calls).toBe(1)
            done()
        }, 120)
    })

    it('should call the function multiple times if the threshold is passed', function (done) {
        fn()
        fn() // this call will be ignored

        setTimeout(function () {
            fn() // this will be executed after 220ms
        }, 120)

        setTimeout(function () {
            expect(calls).toBe(2)
            done()
        }, 300)
    })

})
