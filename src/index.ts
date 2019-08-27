import Snoowrap from 'snoowrap';
import config from './config';
import { filterText } from './util';

const { client, watcher } = config;

const reddit = new Snoowrap(client);

const subreddits = watcher.subreddits;

async function getMyId(): Promise<String> {
    const id = await reddit.getMe().id;
    console.log(`my id is ${id}`);
    return id;
}

async function main() {
    await getMyId();
    // const newMessages = await reddit.getUnreadMessages();
    const subreddit = reddit.getSubreddit('unexpectedletterkenny');
    const comments = await subreddit.getNewComments();

    comments.forEach((c) => {
        console.log(filterText(c.body));
    });

    // console.log('new messages', newMessages);
}

main();

// const subreddit = reddit.getUnreadMessages({ })
