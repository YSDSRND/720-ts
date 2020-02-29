type Entry<K, V> = {
    key: K
    value: V
}

// javascript objects can have numeric values but
// they are always cast to strings at runtime. if
// we want to preserve type compatibility we must
// detect this and parse the integers manually.
const isNumberLike = /^\d+$/

export function entries<T extends object>(value: T): ReadonlyArray<Entry<keyof T, T[keyof T]>> {
    return Object.keys(value).map(key => {
        const parsedKey = (isNumberLike.test(key) ? parseInt(key) : key) as keyof T

        return {
            key: parsedKey,
            value: value[parsedKey],
        }
    })
}
