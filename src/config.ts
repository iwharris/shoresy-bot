import dotenv from 'dotenv';

dotenv.config();

export default {
    client: {
        userAgent: 'shorsey-bot',
        clientId: process.env.REDDIT_AUTH_CLIENT_ID,
        clientSecret: process.env.REDDIT_AUTH_CLIENT_SECRET,
        username: process.env.REDDIT_AUTH_USERNAME,
        password: process.env.REDDIT_AUTH_PASSWORD,
    },
    watcher: {
        subreddits: ['UnexpectedLetterkenny', 'Letterkenny'],
        // subreddits: ['test'],
        interval: 5 * 60 * 1000, // ms
    },
    chirps: {
        dryRun: false,
        redditorBlacklist: [
            'shoresy___bot', // self
            'remindmebot',
        ].map((b) => b.toLowerCase()),
    },
};
