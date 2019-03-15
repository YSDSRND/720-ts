import {debounce} from "../src/debounce";

describe('debounce tests', () => {

    let calls: number = 0

    beforeEach(() => {
        calls = 0
    })

    const fn = debounce(() => {
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

    it('should wait until the trailing edge to call the function', (done) => {
        fn()

        setTimeout(() => {
            fn()
        }, 50)

        setTimeout(() => {
            expect(calls).toBe(0)
        }, 120)

        setTimeout(() => {
            expect(calls).toBe(1)
            done()
        }, 200)
    })

    it('should call function multiple time if threshold is passed', (done) => {
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
