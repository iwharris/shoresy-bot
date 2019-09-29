export function filterText(comment: string, replacers: [string, string][] = []): string {
    return replacers.reduce((str, [a, b]) => str.replace(a, b), comment.trim().toLowerCase());
}

export function isBlacklistedRedditor(name: string, blacklist: string[]): boolean {
    return blacklist.includes(name.toLowerCase());
}

export function linkName(name: string): string {
    return `/u/${name}`;
}

export type ComparatorFunction<T=any> = (a: T, b: T) => number;

export function getPropertyComparator(property: string, reverse: boolean = false): ComparatorFunction {
    return (a, b) => (reverse ? -1 : 1) * (Number(a[property]) - Number(b[property]));
}