import _ from 'lodash';
import Snoowrap from 'snoowrap';
import config from './config';
import { Matchers, IMatcherContext } from './chirps';
import * as util from './util';
import logger from './logger';
import sentry from './sentry';

const { app, client, watcher, chirps } = config;

const reddit = new Snoowrap(client);

const subreddits = watcher.subreddits;

async function main() {
    const myName = await reddit.getMe().name;
    logger.info(`My Reddit username is ${myName}, ya titfucker!`);
    while (true) {
        try {
            const promises = subreddits.map(async (subredditName) => {
                const subreddit = reddit.getSubreddit(subredditName);
                const comments = await subreddit.getNewComments();
                logger.debug(`Fetched ${comments.length} comments from /r/${subredditName}.`);
                const matchers = new Matchers();
                comments
                    .filter((c) => !util.isBlacklistedRedditor(c.author.name, chirps.redditorBlacklist))
                    .forEach(async (c) => {
                        const authorName = `/u/${c.author.name}`
                        const context: IMatcherContext = {
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
logger.info(`Running bot with user-agent "${client.userAgent}"`);
sentry.init();
main();
