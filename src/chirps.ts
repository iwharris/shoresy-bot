import _ from 'lodash';

const shorseySpellings = ['shoresy', 'shorsey'];

export interface IMatchers {
    getMatch(context: IMatcherContext): IMatcher | undefined;
}

export interface IMatcher {
    isMatch(context: IMatcherContext): boolean;
    getChirp(context: IMatcherContext): string;
}

export interface IMatcherContext {
    authorId: string; // comment author ID
    authorName: string; // comment author name
    body: string; // filtered and lowercased comment body
    commentChainUsernames: string[];
    name1: string;
    name2: string;
}

export type MatchFunc = (context: IMatcherContext) => boolean;

export class Matchers implements IMatchers {
    private matchers: IMatcher[];

    constructor() {
        const mentionsAny = (ctx: IMatcherContext, terms: string[]): boolean => terms.some((t) => ctx.body.includes(t));
        const mentionsAll = (ctx: IMatcherContext, terms: string[]): boolean =>
            terms.every((t) => ctx.body.includes(t));
        const mentionsShorsey = (ctx: IMatcherContext): boolean => mentionsAny(ctx, shorseySpellings);

        // matchers go from specific to general
        this.matchers = [
            new Matcher((ctx) => mentionsAny(ctx, ['gretz']), gretz),
            new Matcher((ctx) => mentionsAny(ctx, ['mister', 'mr']) && mentionsAny(ctx, ['hockey']), howe),
            new Matcher((ctx) => mentionsAny(ctx, ['happen']) && mentionsShorsey(ctx), happen),
            new Matcher((ctx) => mentionsAny(ctx, ['coming']) && mentionsShorsey(ctx), coming),
            new Matcher((ctx) => mentionsAny(ctx, ['line']) && mentionsShorsey(ctx), lines),
            new Matcher((ctx) => mentionsAny(ctx, ['ref']) && mentionsShorsey(ctx), ref),
            new Matcher((ctx) => mentionsAll(ctx, ['fuck', 'you']) && mentionsShorsey(ctx), [...chirps, ...chirps1]),
            new Matcher((ctx) => mentionsShorsey(ctx), [...chirps, ...chirps1]),
        ];
    }

    getMatch(context: IMatcherContext): IMatcher | undefined {
        return this.matchers.find((m) => m.isMatch(context));
    }
}

export class Matcher implements IMatcher {
    private matchFunc: MatchFunc;
    private chirps: _.TemplateExecutor[];

    constructor(matchFunc: MatchFunc, chirps: string[]) {
        this.matchFunc = matchFunc;
        this.chirps = chirps.map((c) => _.template(c));
    }

    isMatch(context: IMatcherContext): boolean {
        return !!this.matchFunc(context);
    }

    getChirp(context: IMatcherContext): string {
        const chirp = _.sample(this.chirps);

        if (!chirp) {
            throw new Error("Chirps are empty bud, it's fuckin' amateur hour in here!");
        }

        return chirp(context);
    }
}

// shoresy
const chirps = [
    "Your life's so fuckin' pathetic I ran a charity 15K to raise awareness for it!",
    'Give yer balls a tug!',
    'Give yer balls a tug, titfucker!',
    'Ya titfucker!',
    'Titfucker!',
    'Fight me, see what happens!',
    'Tell your mom to top up the cell phone she bought me so I can FaceTime her late night!',
    "Fuck your whole fuckin' life!",
    "Let's get some fuckin' gyozas!",
    "Your mom loves buttplay like I like Häagen-Dazs, let's get some fuckin' ice cream!",
    'Fuck your entire fucking life ya piece of shit!',
    'Make yourselves useful, grab me a bag of dill picklers!',
    'Fuck you all, your lives are so sad, I get a charity tax break just for hanging out with ya! Nice sweep, no sweep, give yer balls a tug!',
    'The fuck you looking at, ya titfucker? Give yer balls a tug!',
];

// fuck, you, shoresy
const chirps1 = [
    "Fuck you, <%= name1 %>, go scoop my shirt off your mom's bedroom floor! She gives my nipples butterfly kisses!",
    "Fuck you, <%= name1 %>, your breath is an existential crisis! It made me question my whole fuckin' life!",
    'Fuck you, <%= name1 %>, I made your mum so wet that Trudeau deployed a 24-hour infantry unit to stack sandbags around my bed!',
    "Fuck you, <%= name1 %>, your mum liked one of my Instagram posts from 2 years ago in Puerto Vallarta! Tell her I'll put my swim trunks on for her any time she likes!",
    "Fuck you, <%= name1 %>, tell your mum I drained the bank account she set up for me. Top it up so I can get some fuckin' KFC!",
    "Fuck you, <%= name1 %>, your mom ugly cried because she left the lens cap on the camcorder last night! It's fuckin' amateur hour over there!",
    'Fuck you, <%= name1 %>, your mum shot cum straight across the room and killed my Siamese fighting fish! Threw off the pH levels in my aquarium, you piece of shit!',
    'Fuck you, <%= name1 %>, I made your mom cum so hard, they made a Canadian Heritage Minute out of it and Don McKellar played my dick!',
    "Fuck you, <%= name1 %>, you shoulda heard your mom last night, she sounded like a window closing on a Tonkinese cat's tail; she sounded like: AAAAAA^AAAAAAA^AAAAAAA!",
    'Fuck you, <%= name1 %>, you shoulda heard your mom last night, she sounded like my great-aunt when I pull a surprise visit; she sounded like: OOOOOO^OOOOOOO^OOOOOOH!',
    "Fuck you, <%= name1 %>, your mum groped me two Halloweens ago, shut the fuck up or I'll take it to Twitter!",
    'Fuck you, <%= name1 %>, fight me, see what happens!',
    'Fuck you, <%= name1 %>, tell your mom to give me a time out! Last time I tried that, she threatened to take a header on me into an empty pool at the Quality Suites!',
    "Fuck you, <%= name1 %>, tell your mom to leave me alone, she's been laying in my fuckin' water bed since Labour Day!",
];

const chirps2 = [
    "Fuck you, <%= name1 %>, your mom keeps trying to slip a finger in my bum but I keep telling her I only let <%= name2 %>'s mom do that, ya fuckin' loser!",
    "Hey <%= name1 %>, I made an oopsie, can you ask your mom to pick up <%= name2 %>'s mom on the way over to my place? I double-booked them by mistake, you fuckin' loser!",
    "Fuck you, <%= name1 %>, your mom sneaky gushed so hard, she fucked me off the water bed last night! Don't tell her I was thinking about <%= name2 %>'s mum the entire time!",
];

// ref, shoresy
const ref = [
    "Fuck you, <%= name1 %>, take a look at me! I'm not even a ref, I'm a fucking linesman, but you can refereef on my nuts any time ya piece of shit!",
];

// gretzky
const gretz = ["Gretz holds or shares 61 records in the show, ya piece of shit! Don't nickel and dime the great one!"];

// mr, mister, hockey
const howe = ["Suck my Mr. Cockey, you fuckin' loser!"];

// happen, shoresy
const happen = [
    'Three things: I hit you, you hit the pavement, ambulance hits sixty!',
    "Three things: I hit you, you hit the pavement, I jerk off on your driver's side door handle again!",
    'Three things: I hit you, you hit the pavement, I fuck your mom again!',
];

// coming, shoresy
const coming = [
    "Heard the same thing from your mom last night, bud, seven times and that's not even my record ya fuckin' loser!",
];

// line, shoresy
const lines = [
    "Hey, you want to talk about lines ya fuckin' loser? I woke up to your mom ripping dick dingers off my foreskin! Tell her to keep her hands off my scoops!",
];
