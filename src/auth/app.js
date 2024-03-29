import chalk from 'chalk';
import express from 'express';
import session from 'express-session';
import passport from 'passport';

import discordRouter from './routers/discord.js';
import spotifyRouter from './routers/spotify.js';
export default async function loadRouters(client) {
    const app = express();
    app.use(express.json());

    app.use(session({ secret: 'dupa', resave: false, saveUninitialized: false }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, res, next) => {
        req.client = client;
        next();
    });

    app.use('/discord', discordRouter);
    app.use('/spotify', spotifyRouter);

    const port = '5000';
    app.listen(port, () => {
        console.log(
            `${chalk.red(chalk.bold('[ROUTERS]'))} ${chalk.blue('Listenning on port ')} ${chalk.greenBright(
                chalk.bold(port)
            )}`
        );
    });
}
