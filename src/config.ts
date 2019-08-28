import dotenv from 'dotenv';

dotenv.config();

const packageName = process.env.npm_package_name || 'N/A';

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
        dryRun: false,
        redditorBlacklist: [
            'shoresy___bot', // self
            'remindmebot',
        ].map((b) => b.toLowerCase()),
    },
};
