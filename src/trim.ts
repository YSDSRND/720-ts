export function trim(value: string, characters: string): string {
    // escape special regexp characters so
    // we can replace those too.
    const escaped = characters.replace(/[\\+*?[\]$(){}=!<>|:\-#]/g, '\\$&')

    return value
        // remove leading characters
        .replace(new RegExp('^[' + escaped + ']+', 'g'), '')
        // remove trailing characters
        .replace(new RegExp('[' + escaped + ']+$', 'g'), '')
}
