import _ from 'lodash';
import Snoowrap from 'snoowrap';
import config from './config';
import { Matchers, CommentContext } from './matcher';
import * as util from './util';
import logger from './logger';
import sentry from './sentry';

const { app, clientConfigOptions, clientConnectionOptions, watcher, chirps } = config;

const reddit = new Snoowrap(clientConnectionOptions);
reddit.config(clientConfigOptions);

const subreddits = watcher.subreddits;

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
                    // sort in ascending order (newest first)
                    .sort(util.getPropertyComparator('created_utc', true))
                    // don't consider comments with an older timestamp than the last-seen comment (eliminates unnecessary requests)
                    .filter((comment) => comment.created_utc > latestCommentTimestamp[subredditName]);

                // On the next fetch, discard comments older than the newest one from this fetch
                if (comments.length > 0) latestCommentTimestamp[subredditName] = comments[0].created_utc;

                logger.debug(`Fetched ${comments.length} comments from /r/${subredditName}.`);
                const matchers = new Matchers();
                comments
                    .filter((c) => !util.isBlacklistedRedditor(c.author.name, blacklist))
                    .forEach(async (c) => {
                        const authorName = util.linkName(c.author.name);
                        const context: CommentContext = {
                            authorId: c.author.id,
                            authorName,
                            body: util.filterText(c.body, [['\n', '']]),
                            commentChainUsernames: [authorName],
                            name1: authorName,
                            name2: c.parent_id,
                        };
                        const match = matchers.getMatch(context);
                        if (match) {
                            c.replies = await c.replies.fetchAll();
                            if (c.replies.find((r) => r.author.name === myName)) {
                                logger.debug(`I already chirped ${authorName} before, ya titfucker!`);
                            } else {
                                const chirp = match.getChirp(context);
                                logger.info(`Chirping ${authorName} on /r/${subredditName}: ${chirp}`);
                                if (!chirps.dryRun) {
                                    c.reply(chirp);
                                }
                            }
                        }
                    });
            });

            promises.push(new Promise((resolve) => setTimeout(resolve, watcher.interval)));
            await Promise.all(promises)
            .catch((e) => {
                logger.warn(`Got an error, ya titfucker! ${e.message}`);
                sentry.capture(e);
            });
        } catch (e) {
            logger.error(`It's fuckin' amateur hour in here! ${e.message}`);
            sentry.capture(e);
        }
    }
}

logger.info(`${app.name}@${app.version}-${app.environment} [${app.gitHash}]`);
logger.info(`Running bot with user-agent "${clientConnectionOptions.userAgent}"`);
sentry.init();
main();
