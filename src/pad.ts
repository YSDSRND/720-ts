import {range} from "./range";

export function padLeft(input: string, paddedLength: number, character: string): string {
    const resultLength = Math.max(input.length, paddedLength)
    const toPadWith = range(0, resultLength)
        .map(num => character)
        .join('')
    return (toPadWith + input).slice(-resultLength)
}
