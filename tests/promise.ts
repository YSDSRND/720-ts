import {Promise} from "../src/promise";

describe('promise tests', function () {

    it('should resolve correctly', function (done) {
        const p = new Promise<number>((resolve, reject) => {
            resolve(1)
        })

        p.then(result => {
            expect(result).toBe(1)
            done()
        })
    })

    it('should reject on errors', function (done) {
        const p = new Promise<number>((resolve, reject) => {
            resolve(1)
        })

        p.then(result => {
            throw new Error('yee')
        }).then(undefined, (err: Error) => {
            expect(err.message).toBe('yee')
            done()
        })
    })

    it('when should wait for all promises to resolve', function (done) {
        const a = new Promise<number>((resolve, reject) => {
            setTimeout(function () {
                resolve(100)
            }, 100)
        })
        const b = new Promise<string>((resolve, reject) => {
            setTimeout(function () {
                resolve('yee')
            }, 200)
        })

        Promise.all([a, b]).then(results => {
            expect(results).toEqual([100, 'yee'])
            done()
        })
    })

})
