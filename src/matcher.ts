import _ from 'lodash';
import * as chirps from './chirps';

const shorseySpellings = ['shoresy', 'shorsey'];

export interface IMatchers<Context = any> {
    getMatch(context: Context): IMatcher | undefined;
}

export interface IMatcher<Context = any> {
    isMatch(context: Context): boolean;
    getChirp(context: Context): string;
}

export interface CommentContext {
    authorId: string; // comment author ID
    authorName: string; // comment author name
    body: string; // filtered and lowercased comment body
    commentChainUsernames: string[];
    name1: string;
    name2: string;
}

export type MatchFunc<Context> = (context: Context) => boolean;

export class Matchers implements IMatchers<CommentContext> {
    private matchers: IMatcher[];

    constructor() {
        const mentionsAny = (ctx: CommentContext, terms: string[]): boolean => terms.some((t) => ctx.body.includes(t));
        const mentionsAll = (ctx: CommentContext, terms: string[]): boolean =>
            terms.every((t) => ctx.body.includes(t));
        const mentionsShorsey = (ctx: CommentContext): boolean => mentionsAny(ctx, shorseySpellings);

        // matchers go from specific to general
        this.matchers = [
            new CommentMatcher((ctx) => mentionsAny(ctx, ['gretz']), chirps.gretz),
            new CommentMatcher((ctx) => mentionsAny(ctx, ['mister', 'mr']) && mentionsAny(ctx, ['hockey']), chirps.howe),
            new CommentMatcher((ctx) => mentionsAny(ctx, ['happen']) && mentionsShorsey(ctx), chirps.happen),
            new CommentMatcher((ctx) => mentionsAny(ctx, ['coming']) && mentionsShorsey(ctx), chirps.coming),
            new CommentMatcher((ctx) => mentionsAny(ctx, ['line']) && mentionsShorsey(ctx), chirps.lines),
            new CommentMatcher((ctx) => mentionsAny(ctx, ['ref']) && mentionsShorsey(ctx), chirps.ref),
            new CommentMatcher((ctx) => mentionsAll(ctx, ['fuck', 'you']) && mentionsShorsey(ctx), [...chirps.chirps, ...chirps.chirps1]),
            new CommentMatcher((ctx) => mentionsShorsey(ctx), [...chirps.chirps, ...chirps.chirps1]),
        ];
    }

    getMatch(context: CommentContext): IMatcher | undefined {
        return this.matchers.find((m) => m.isMatch(context));
    }
}

export class CommentMatcher implements IMatcher<CommentContext> {
    private matchFunc: MatchFunc<CommentContext>;
    private chirps: _.TemplateExecutor[];

    constructor(matchFunc: MatchFunc<CommentContext>, chirps: string[]) {
        this.matchFunc = matchFunc;
        this.chirps = chirps.map((c) => _.template(c));
    }

    isMatch(context: CommentContext): boolean {
        return !!this.matchFunc(context);
    }

    getChirp(context: CommentContext): string {
        const chirp = _.sample(this.chirps);

        if (!chirp) {
            throw new Error("Chirps are empty bud, it's fuckin' amateur hour in here!");
        }

        return chirp(context);
    }
}
