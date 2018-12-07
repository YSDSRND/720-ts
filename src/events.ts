import {Map, VariadicFunc} from './types'

type ArgumentMap = Map<any[]>

type HandlerMap<T extends ArgumentMap> = {
    [K in keyof T]?: Array<VariadicFunc<T[K], void>>
}

export class EventEmitter<T extends ArgumentMap> {

    private listeners: HandlerMap<T> = {}

    public subscribe<K extends keyof T>(event: K, fn: VariadicFunc<T[K], void>): void {
        if (!this.listeners.hasOwnProperty(event)) {
            this.listeners[event] = []
        }

        this.listeners[event]!.push(fn)
    }

    public unsubscribe<K extends keyof T>(event: K, fn: VariadicFunc<T[K], void>): void {
        const fns = this.listeners[event]! || []
        let idx: number

        while ((idx = fns.indexOf(fn)) !== -1) {
            fns.splice(idx, 1)
        }
    }

    public trigger<K extends keyof T>(event: K, ...args: T[K]): void {
        const fns = this.listeners[event]! || []

        for (const fn of fns) {
            // currently we can't generically express the
            // length of the argument array in ArgumentMap
            // so we need this ugly cast for the time being.
            (fn as Function).apply(undefined, args)
        }
    }

}
