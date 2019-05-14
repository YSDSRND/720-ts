import {Map} from "./types";

export function classNames(names: Map<unknown>): string {
    return Object.keys(names)
        .filter(key => !!names[key])
        .join(' ')
}
