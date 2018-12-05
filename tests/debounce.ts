import {debounce} from "../src/debounce";

describe('debounce tests', function () {

    let calls: number = 0

    beforeEach(function () {
        calls = 0
    })

    const fn = debounce(function () {
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

    it('should wait until the trailing edge to call the function', function (done) {
        fn()

        setTimeout(function () {
            fn()
        }, 50)

        setTimeout(function () {
            expect(calls).toBe(0)
        }, 120)

        setTimeout(function () {
            expect(calls).toBe(1)
            done()
        }, 200)
    })

    it('should call function multiple time if threshold is passed', function (done) {
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
