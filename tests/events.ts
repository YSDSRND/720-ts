import {EventEmitter} from "../src/events";

describe('EventEmitter tests', function () {

    let emitter: EventEmitter<{ 'myEvent': [string, number] }>

    beforeEach(function () {
        emitter = new EventEmitter()
    })

    it('should trigger event handlers with arguments', function () {
        emitter.subscribe('myEvent', (a, b) => {
            expect(a).toBe('yee')
            expect(b).toBe(1)
        })

        emitter.trigger('myEvent', 'yee', 1)
    })

    it('should trigger event handlers in attached order', function () {
        const out: Array<number> = []
        emitter.subscribe('myEvent', (a, b) => {
            out.push(1)
        })
        emitter.subscribe('myEvent', (a, b) => {
            out.push(2)
        })
        emitter.trigger('myEvent', 'yee', 1)

        expect(out).toEqual([1, 2])
    })

    it('should unsubscribe correctly', function () {
        let result = 0
        const fn = (a: string, b: number) => {
            ++result
        }
        emitter.subscribe('myEvent', fn)
        emitter.subscribe('myEvent', fn)
        emitter.subscribe('myEvent', fn)
        emitter.unsubscribe('myEvent', fn)
        emitter.trigger('myEvent', 'yee', 1)

        expect(result).toBe(0)
    })

    it('should allow unsub inside event handler', function () {
        let a = false
        let b = false

        const fn = function () {
            a = true
            emitter.unsubscribe('myEvent', fn)
        }

        emitter.subscribe('myEvent', fn)
        emitter.subscribe('myEvent', function () {
            b = true
        })

        emitter.trigger('myEvent', 'yee', 1)

        expect(a).toBe(true)
        expect(b).toBe(true)
    })

})
