import {TaskQueue} from "../src/task"
import {Promise} from "../src/promise";

function wait(ms: number): PromiseLike<number> {
    const ts = Date.now()
    return new Promise(resolve => {
        window.setTimeout(() => {
            resolve(Date.now() - ts)
        }, ms)
    })
}

describe('TaskQueue tests', () => {
    it('should execute tasks single threaded at concurrency 1', (done) => {
        const didExecute = [false, false]
        const queue = new TaskQueue(1)

        queue.execute(() => {
            didExecute[0] = true
            return wait(100)
        })

        queue.execute(() => {
            didExecute[1] = true
            return wait(100)
        })

        expect(didExecute).toEqual([true, false])

        window.setTimeout(() => {
            expect(didExecute).toEqual([true, true])
            done()
        }, 150)
    })

    it('should execute tasks simultaneously at concurrency 2', (done) => {
        const didExecute = [false, false]
        const queue = new TaskQueue(2)

        queue.execute(() => {
            didExecute[0] = true
            return wait(100)
        })

        queue.execute(() => {
            didExecute[1] = true
            return wait(100)
        })

        expect(didExecute).toEqual([true, true])

        done()
    })

    it('should keep executing if a task fails', (done) => {
        const didExecute = [false, false]
        const queue = new TaskQueue(1)

        queue.execute(() => {
            didExecute[0] = true
            return Promise.reject(undefined)
        })

        queue.execute(() => {
            didExecute[1] = true
            return Promise.reject(undefined)
        })

        window.setTimeout(() => {
            expect(didExecute).toEqual([true, true])
            done()
        }, 10)
    })
})
