export function filterText(comment: string, replacers: [string, string][] = []): string {
    return replacers.reduce((str, [a, b]) => str.replace(a, b), comment.trim().toLowerCase());
}

export function isBlacklistedRedditor(name: string, blacklist: string[]): boolean {
    return blacklist.includes(name.toLowerCase());
}