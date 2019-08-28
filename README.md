> This repository contains a great deal of colourful language and is therefore **VERY NSFW**. You have been warned!

# shoresy-bot

Shoresy is a [beloved](https://youtu.be/LHf1I6rlyDk) character on [Letterkenny](<https://en.wikipedia.org/wiki/Letterkenny_(TV_series)>), an important biographical television show that celebrates rural Canadian culture.

`shoresy-bot` is a Reddit bot that automatically [chirps](https://www.urbandictionary.com/define.php?term=chirp) Redditors who post comments with certain key words. The bot replies to such comments using a system of matchers to select a random Shoresy quote that is appropriate for the context.

## Installation

```bash
git clone git@github.com:iwharris/shoresy-bot.git shoresy-bot

cd shoresy-bot

npm install
```

## Configuration

You must provide credentials to the bot.

```bash
cp .env.example .env
```

Copy and paste your client ID, client secret, Reddit username, and Reddit password into the fields.

Alternately, you may manually set the credential env variables from `.env` prior to running the bot.

## Running

Run the bot in dev mode:

```bash
npm run dev
```

or, build Typescript and run in a more production-like setting:

```bash
npm run build
npm run start:production
```

## Testing

Shoresy wouldn't write tests if he was a software developer.

## Contributions

Fork the repository and open a pull request. PRs will only be accepted if you write them in character and chirp Shoresy in the description.

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
