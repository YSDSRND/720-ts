import {Promise} from "../src/promise";
import {Func1} from "../src/types";

describe('promise tests', () => {
    let originalRejectionHandler: Func1<any, void>
    let unhandledRejection: any

    beforeAll(() => {
        originalRejectionHandler = Promise.defaultUnhandledRejectionHandler
        Promise.defaultUnhandledRejectionHandler = (value) => {
            unhandledRejection = value
        }
    })

    afterAll(() => {
        Promise.defaultUnhandledRejectionHandler = originalRejectionHandler
    })

    beforeEach(() => {
        unhandledRejection = undefined
    })

    it('should resolve correctly', (done) => {
        const p = new Promise<number>((resolve, reject) => {
            resolve(1)
        })

        p.then(result => {
            expect(result).toBe(1)
            done()
        })
    })

    it('should reject on errors', (done) => {
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

    it('Promise.all should wait for all promises to resolve', (done) => {
        const a = new Promise<number>((resolve, reject) => {
            setTimeout(() => {
                resolve(100)
            }, 100)
        })
        const b = new Promise<string>((resolve, reject) => {
            setTimeout(() => {
                resolve('yee')
            }, 200)
        })

        Promise.all([a, b]).then(results => {
            expect(results).toEqual([100, 'yee'])
            done()
        })
    })

    it('Promise.resolve should work correctly with scalars', (done) => {
        Promise.resolve(1).then(res => {
            expect(res).toBe(1)
            done()
        })
    })

    it('Promise.resolve should work correctly with promise like structures', (done) => {
        Promise.resolve(Promise.resolve(1)).then(res => {
            expect(res).toBe(1)
            done()
        })
    })

    it('should inform on uncaught rejections', (done) => {
        Promise.reject('boi')
        setTimeout(() => {
            expect(unhandledRejection).toBe('boi')
            done()
        }, 100)
    })

    it('should propagate unhandled rejections when handler is not supplied', (done) => {
        Promise.reject('boi').then(() => {})
        setTimeout(() => {
            expect(unhandledRejection).toBe('boi')
            done()
        }, 100)
    })

    it('should detect unhandled rejections in resolve handler', (done) => {
        Promise.resolve('ok').then(() => {
            return Promise.reject('SOME_ERROR')
        })

        // we need this piece of code to be executed after the
        // promise has been rejected so we can check for the
        // error. because the rejection itself is asynchronous
        // we must schedule this handler with a slight timeout.
        setTimeout(() => {
            expect(unhandledRejection).toBe('SOME_ERROR')
            done()
        }, 100)
    })

    it('should detect unhandled rejections in reject handler', (done) => {
        Promise.reject('fail').then(undefined, () => {
            return Promise.reject('SOME_FAT_REJECT_ERROR')
        })

        // we need this piece of code to be executed after the
        // promise has been rejected so we can check for the
        // error. because the rejection itself is asynchronous
        // we must schedule this handler with a slight timeout.
        setTimeout(() => {
            expect(unhandledRejection).toBe('SOME_FAT_REJECT_ERROR')
            done()
        }, 100)
    })

    it('should not propagate unhandled rejections if handler is supplied', (done) => {
        Promise.reject('some-error').then(undefined, (err) => {})

        setTimeout(() => {
            expect(unhandledRejection).toBeUndefined()
            done()
        }, 100)
    })

    it('should detect unhandled thrown errors', (done) => {
        Promise.resolve('ok').then(res => {
            throw new Error('YEE')
        })

        setTimeout(() => {
            expect(unhandledRejection.message).toBe('YEE')
            done()
        }, 100)
    })

})
