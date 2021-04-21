import {Map, ReadonlyMap} from "./types";

export function parseQuery(value: string): ReadonlyMap<string | undefined> {
    const out: Map<string | undefined> = {}
    const regex = /([^&?=]+)(?:=([^&?=]+))?/g
    let matches: RegExpMatchArray | null

    while ((matches = regex.exec(value)) !== null && matches[1]) {
        out[matches[1]] = decodeURIComponent(matches[2] || '')
    }

    return out
}
