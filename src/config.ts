import dotenv from 'dotenv';
import winston = require('winston');

dotenv.config();

export default {
    client: {
        userAgent: `node:${process.env.npm_package_name}:v${process.env.npm_package_version}`,
        clientId: process.env.REDDIT_AUTH_CLIENT_ID,
        clientSecret: process.env.REDDIT_AUTH_CLIENT_SECRET,
        username: process.env.REDDIT_AUTH_USERNAME,
        password: process.env.REDDIT_AUTH_PASSWORD,
    },
    watcher: {
        subreddits: ['UnexpectedLetterkenny', 'Letterkenny'],
        // subreddits: ['test'],
        interval: 1 * 60 * 1000, // ms
    },
    chirps: {
        dryRun: process.env.NODE_ENV !== 'production',
        redditorBlacklist: [
            'shoresy___bot', // self
            'remindmebot',
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
};
