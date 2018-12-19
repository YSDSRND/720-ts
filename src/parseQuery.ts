import {Map} from "./types";

export function parseQuery(value: string): Map<string | undefined> {
    const out: Map<string | undefined> = {}
    const regex = /([^&?=]+)(?:=([^&?=]+))?/g
    let matches: RegExpMatchArray | null

    while ((matches = regex.exec(value)) !== null) {
        out[matches[1]] = decodeURIComponent(matches[2] || '')
    }

    return out
}
