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
    },
};
