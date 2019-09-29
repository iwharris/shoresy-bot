import dotenv from 'dotenv';
import winston from 'winston';
import Snoowrap from 'snoowrap';

dotenv.config();

const gitHash = process.env.npm_package_gitHead;
const environment = process.env.NODE_ENV || 'development';
const packageName = process.env.npm_package_name;
const packageVersion = process.env.npm_package_version;
const environmentVersion = `${packageVersion}${environment === 'development' ? '-dev' : ''}`;

const clientConnectionOptions: Snoowrap.SnoowrapOptions = {
    userAgent: `node:${packageName}:v${environmentVersion} (by /u/${process.env.REDDIT_AUTH_USERNAME})`,
    clientId: process.env.REDDIT_AUTH_CLIENT_ID,
    clientSecret: process.env.REDDIT_AUTH_CLIENT_SECRET,
    username: process.env.REDDIT_AUTH_USERNAME,
    password: process.env.REDDIT_AUTH_PASSWORD,
};

const clientConfigOptions: Snoowrap.ConfigOptions = {
    requestDelay: 0,
    continueAfterRatelimitError: true,
};

export default {
    app: {
        gitHash,
        version: packageVersion,
        name: packageName,
        environment,
    },
    clientConnectionOptions,
    clientConfigOptions,
    watcher: {
        subreddits: ['UnexpectedLetterkenny', 'Letterkenny'],
        interval: 1 * 60 * 1000, // ms
    },
    chirps: {
        dryRun: process.env.NODE_ENV !== 'production',
        redditorBlacklist: [
            'remindmebot',
            // Bot's own name will be appended to this list
        ].map((b) => b.toLowerCase()),
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.json(),
        transports: [
            new winston.transports.File({ filename: 'error.log', level: 'error' }),
            new winston.transports.File({ filename: 'shoresy.log' }),
        ],
    },
    sentry: {
        dsn: process.env.SENTRY_DSN,
        release: environmentVersion,
    },
};
