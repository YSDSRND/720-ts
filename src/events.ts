import {Map, VariadicFunc} from './types'

type EventArgumentMap = Map<any[]>
type EventHandlerMap<TArgumentMap extends EventArgumentMap> = {
    [K in keyof TArgumentMap]?: Array<VariadicFunc<TArgumentMap[K], void>>
}

export class EventEmitter<TArgumentMap extends EventArgumentMap> {

    private listeners: EventHandlerMap<TArgumentMap> = {}

    public subscribe<TEvent extends keyof TArgumentMap>(event: TEvent, fn: VariadicFunc<TArgumentMap[TEvent], void>): void {
        if (!this.listeners.hasOwnProperty(event)) {
            this.listeners[event] = []
        }

        this.listeners[event]!.push(fn)
    }

    public unsubscribe<TEvent extends keyof TArgumentMap>(event: TEvent, fn: VariadicFunc<TArgumentMap[TEvent], void>): void {
        const fns = this.listeners[event]! || []
        let idx = -1

        while ((idx = fns.indexOf(fn)) !== -1) {
            fns.splice(idx, 1)
        }
    }

    public trigger<TEvent extends keyof TArgumentMap>(event: TEvent, ...args: TArgumentMap[TEvent]): void {
        const fns = this.listeners[event]! || []

        for (const fn of fns) {
            // currently we can't generically express the
            // length of the argument array in EventArgumentMap
            // so we need this ugly cast for the time being.
            (fn as Function).apply(undefined, args)
        }
    }

}
