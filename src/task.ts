import {Promise} from "./promise"
import {Func, Func1} from "./types";

type Task<T> = Func<PromiseLike<T>>
type TaskEntry<T> = {
    task: Task<T>
    resolve: (result: T) => void
    reject: (err: unknown) => void
}

export class TaskQueue<T> {
    private readonly concurrency: number
    private readonly queue: Array<TaskEntry<T>>
    private pending: number

    constructor(concurrency: number) {
        this.concurrency = concurrency
        this.queue = []
        this.pending = 0
        this.next = this.next.bind(this)
    }

    protected createThenHandler<U>(promise: PromiseLike<T>, fn: Func1<U, void>): Func1<U, void> {
        return (value: U) => {
            this.pending -= 1
            fn(value)
        }
    }

    protected next(): void {
        // if we have reached our maximum concurrency
        // we can safely return here. when any task
        // completes it will attempt to execute the
        // next task from the top of the queue.
        if (this.pending >= this.concurrency) {
            return
        }

        const entry = this.queue.shift()

        if (typeof entry === 'undefined') {
            return
        }

        this.pending += 1

        const promise = entry.task()

        promise.then(
            this.createThenHandler(promise, entry.resolve),
            this.createThenHandler(promise, entry.reject)
        )
    }

    public execute(task: Task<T>): PromiseLike<T> {
        const promise = new Promise<T>((resolve, reject) => {
            this.queue.push({task, resolve, reject})
        })

        // the promise will be either resolved or
        // rejected when this task has been executed.
        // in either case we must attempt to execute
        // the next task in the queue.
        promise.then(this.next, this.next)

        // if there are no previous tasks executing
        // we must jump-start the procedure manually.
        // this is a no-op if we're already at max
        // concurrency.
        this.next()

        return promise
    }
}
