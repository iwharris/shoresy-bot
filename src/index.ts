import _ from 'lodash';
import Snoowrap from 'snoowrap';
import config from './config';
import { Matchers, CommentContext } from './matcher';
import * as util from './util';
import logger from './logger';
import sentry from './sentry';
import { TypePrefix } from './types';

const { app, clientConfigOptions, clientConnectionOptions, watcher, chirps } = config;

const reddit = new Snoowrap(clientConnectionOptions);
reddit.config(clientConfigOptions);

const subreddits = watcher.subreddits;

async function fetchParentComments(commentId: string, maxDepth: number = Infinity): Promise<Snoowrap.Comment[]> {
    maxDepth -= 1;
    // @ts-ignore
    const comment: Snoowrap.Comment = await reddit.getComment(commentId).fetch();
    return !(maxDepth  && comment.parent_id && comment.parent_id.startsWith(TypePrefix.COMMENT))
        ? [comment]
        : [comment, ...(await fetchParentComments(comment.parent_id, maxDepth))];
}

function getLastShoresyCommentText(myName: string, comments: Snoowrap.Comment[]): string | undefined {
    const secondComment = comments[1];

    if (secondComment&& secondComment.author.name.toLowerCase() === 'Shoresy___Bot'.toLowerCase()) {
        return util.filterText(secondComment.body, [['\n', '']]);
    }
}

async function main() {
    const myName = await reddit.getMe().then((me) => me.name);
    const blacklist = [...chirps.redditorBlacklist, myName.toLowerCase()];
    logger.info(`My Reddit username is ${myName}, ya titfucker!`);
    const latestCommentTimestamp = subreddits
        .map((name) => [name, 0])
        .reduce((acc, [name, lastComment]) => {
            acc[name] = lastComment;
            return acc;
        }, {});
    while (true) {
        try {
            const promises = subreddits.map(async (subredditName) => {
                const rawComments: Snoowrap.Listing<Snoowrap.Comment> = await reddit.getNewComments(subredditName);
                const comments: Snoowrap.Comment[] = rawComments
                    // sort by timestamp, descending (newest first)
                    .sort(util.getPropertySortComparator('created_utc', true))
                    // don't consider comments with an older timestamp than the last-seen comment (eliminates unnecessary requests)
                    .filter((comment) => comment.created_utc > latestCommentTimestamp[subredditName]);

                // On the next fetch, discard comments older than the newest one from this fetch
                if (comments.length > 0) latestCommentTimestamp[subredditName] = comments[0].created_utc;

                logger.debug(`Fetched ${comments.length} comments from /r/${subredditName}.`);
                const matchers = new Matchers();
                comments
                    .filter((c) => !util.isBlacklistedRedditor(c.author.name, blacklist))
                    .forEach(async (c) => {
                        
                        const authorLowercaseName = c.author.name.toLowerCase();
                        const body = util.filterText(c.body, [['\n', '']]);
                        const authorLinkName = util.linkName(c.author.name);
                        const responseLogger = logger.child({ dryRun: chirps.dryRun });
                        const commentChainBlacklist = [...blacklist, authorLowercaseName]; // Don't consider parent comments from this comment's author
                        const parentComments = await fetchParentComments(c.parent_id, 3);
                        const commentChainIterable = parentComments
                            .filter((c) => !util.isBlacklistedRedditor(c.author.name, commentChainBlacklist))
                            .map((c) => c.author.name)
                            .reduce(util.uniqueValueReducer, new Set<string>())
                            .values();
                        const commentChainUsernames = Array.from(commentChainIterable);
                        const name2 = _.sample(commentChainUsernames);
                        const lastBotCommentText = getLastShoresyCommentText(myName, parentComments);

                        const context: CommentContext = {
                            authorId: c.author.id,
                            authorName: authorLinkName,
                            body,
                            commentChainUsernames, // usernames from parent comments
                            name1: authorLinkName,
                            name2: name2 ? util.linkName(name2) : undefined,
                            lastBotCommentText,
                        };
                        const match = matchers.getMatch(context);
                        if (match) {
                            c.replies = await c.replies.fetchAll();
                            // responseLogger.debug(`Redditors in the comment chain: ${commentChainUsernames.join(', ')}`);
                            if (c.replies.find((r) => r.author.name === myName)) {
                                responseLogger.debug(`I already chirped ${authorLinkName} before, ya titfucker!`);
                            } else {
                                const chirp = match.getChirp(context);
                                responseLogger.debug(`Responding to ${authorLinkName} who posted: "${body}"`);
                                responseLogger.info(`Chirping ${authorLinkName} on /r/${subredditName}: ${chirp}`);
                                if (!chirps.dryRun) {
                                    await c.upvote().then(() => {});
                                    c.reply(chirp);
                                }
                            }
                        }
                    });
            });

            promises.push(new Promise((resolve) => setTimeout(resolve, watcher.interval)));
            await Promise.all(promises).catch((e) => {
                logger.warn(`Got an error, ya titfucker! ${e.message}`);
                logger.warn(e);
                sentry.capture(e);
            });
        } catch (e) {
            logger.error(`It's fuckin' amateur hour in here! ${e.message}`);
            logger.error(e);
            sentry.capture(e);
        }
    }
}

logger.info(`${app.name}@${app.version}-${app.environment} [${app.gitHash}]`);
logger.info(`Running bot with user-agent "${clientConnectionOptions.userAgent}"`);
sentry.init();
main();
