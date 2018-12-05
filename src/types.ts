export type Map<T> = { [key: string]: T }
export type VariadicFunc<T extends any[], R> = (...args: T) => R
export type Func<R> = VariadicFunc<[], R>
export type Func1<T1, R> = VariadicFunc<[T1], R>
export type Func2<T1, T2, R> = VariadicFunc<[T1, T2], R>
export type Func3<T1, T2, T3, R> = VariadicFunc<[T1, T2, T3], R>
