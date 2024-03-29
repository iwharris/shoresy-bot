import _ from 'lodash';
import * as chirps from './chirps';

const shoresySpellings = ['shoresy', 'shorsey'];

// Convenience functions for matching
const mentionsAny = (ctx: CommentContext, terms: string[]): boolean => terms.some((t) => ctx.body.includes(t));
const mentions = (ctx: CommentContext, term: string): boolean => mentionsAny(ctx, [term]);
const mentionsAll = (ctx: CommentContext, terms: string[]): boolean => terms.every((t) => ctx.body.includes(t));
const mentionsShoresy = (ctx: CommentContext): boolean => mentionsAny(ctx, shoresySpellings);
const threadHasSecondCommenter = (ctx: CommentContext): boolean => !!ctx.name2;
const previousBotCommentMentions = (ctx: CommentContext, term: string) => ctx.lastBotCommentText && ctx.lastBotCommentText.includes(term) || false;
const chirpsShoresy = (ctx: CommentContext) => mentionsShoresy(ctx) || mentionsAll(ctx, ['fuck', 'you']);

export interface IMatchers<Context = any> {
    getMatch(context: Context): IMatcher | undefined;
}

export interface IMatcher<Context = any> {
    isMatch(context: Context): boolean;
    getChirp(context: Context): string;
}

export interface CommentContext {
    /** comment author ID */
    authorId: string;
    /** comment author name */
    authorName: string;
    /** filtered and lowercased comment body */
    body: string;
    commentChainUsernames: string[];
    name1: string;
    name2?: string;
    /** If the parent comment is replying to one of my chirps, this stores it in lowercase */
    lastBotCommentText?: string;
}

export type MatchFunc<Context> = (context: Context) => boolean;

export class Matchers implements IMatchers<CommentContext> {
    private matchers: IMatcher[];

    constructor() {

        // matchers are evaluated in order until a match is found
        // matchers go from specific to general
        this.matchers = [
            // chain comment (teamwork)
            new CommentMatcher((ctx) => mentions(ctx, 'teamwork'), chirps.teamwork1),
            new CommentMatcher((ctx) => previousBotCommentMentions(ctx, 'took her down after at best western') && chirpsShoresy(ctx), chirps.teamwork2),

            // chain comment (slices)
            new CommentMatcher((ctx) => previousBotCommentMentions(ctx, 'mozza burger out of your mouth') && chirpsShoresy(ctx), chirps.slices2),

            // chain comment (wonderland)
            new CommentMatcher((ctx) => previousBotCommentMentions(ctx, 'trying to give me a tug on top gun') && chirpsShoresy(ctx) && threadHasSecondCommenter(ctx), chirps.wonderland2),

            // chain comment (camera)
            new CommentMatcher((ctx) => previousBotCommentMentions(ctx, 'smile for the camera') && chirpsShoresy(ctx), chirps.camera2),

            new CommentMatcher((ctx) => mentions(ctx, 'northwest territories'), chirps.northwestTerritories),
            new CommentMatcher((ctx) => mentions(ctx, 'gretz'), chirps.gretz),
            new CommentMatcher(
                (ctx) => mentionsAny(ctx, ['mister', 'mr']) && mentionsAny(ctx, ['hockey']),
                chirps.howe
            ),
            new CommentMatcher((ctx) => (mentionsAll(ctx, ['what', 'gonna', 'happen'])) || (mentionsAny(ctx, ['happen']) && mentionsShoresy(ctx)), chirps.happen),
            new CommentMatcher((ctx) => mentions(ctx, 'coming') && mentionsShoresy(ctx), chirps.coming),
            new CommentMatcher((ctx) => mentions(ctx, 'line') && mentionsShoresy(ctx), chirps.lines),
            new CommentMatcher((ctx) => mentions(ctx, 'ref') && mentionsShoresy(ctx), chirps.ref),
            new CommentMatcher(
                (ctx) => mentionsAll(ctx, ['fuck', 'you']) && mentionsShoresy(ctx) && threadHasSecondCommenter(ctx),
                [...chirps.chirps, ...chirps.chirps1, ...chirps.chirps2]
            ),
            new CommentMatcher((ctx) => mentionsAll(ctx, ['fuck', 'you']) && mentionsShoresy(ctx), [
                ...chirps.chirps,
                ...chirps.chirps1,
            ]),
            new CommentMatcher((ctx) => mentionsShoresy(ctx), [...chirps.chirps, ...chirps.chirps1]),
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
