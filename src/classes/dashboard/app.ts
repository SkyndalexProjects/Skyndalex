import express from 'express';
import session from "express-session";
import passport from "passport";
import type { SkyndalexClient } from 'classes/Client';
import { DiscordOauth } from './api/auth/discord';
import cookieParser from 'cookie-parser';

declare global {
    namespace Express {
        interface Request {
            client?: SkyndalexClient;
        }
    }
}

declare module "express-session" {
    interface Session {
        user?: { accessToken: string };
    }
}

export class ExpressApp {
    constructor(private readonly client: SkyndalexClient) {
        this.client = client;
    }

    init() {
        const app = express();
        app.use(cookieParser());
        app.use(express.json());
        app.use(session({ secret: "test", resave: false, saveUninitialized: false }));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use((req, res, next) => {
            req.client = this.client;
            next();
        });

        const discordOauth = new DiscordOauth(this.client);
        discordOauth.get().then(router => {
            app.use(router);
            app.listen(3000, () => {
                console.log("Server is running on port 3000");
            });
        });

        return app;
    }
}
export default ExpressApp;