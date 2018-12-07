export function assign<TResult>(target: any, ...sources: Array<Partial<TResult>>): TResult {
    for (const source of sources) {
        for (const key of Object.getOwnPropertyNames(source)) {
            target[key] = (source as any)[key]
        }
    }
    return target as TResult
}
