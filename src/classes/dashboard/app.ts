import express from 'express'
import session from "express-session"
import passport from "passport"
import type { SkyndalexClient } from 'classes/Client'
import { DiscordOauth } from './api/auth/discord'

declare global {
    namespace Express {
        interface Request {
            client?: SkyndalexClient
        }
    }
}

export class ExpressApp {
    constructor(private readonly client: SkyndalexClient) {
        this.client = client
    }
    init() {
        const app = express()
        app.use(express.json())

        app.use(session({ secret: "test", resave: false, saveUninitialized: false }))
        app.use(passport.initialize())
        app.use(passport.session())

        app.use((req, res, next) => {
            req.client = this.client
            next()
        })
    
        const discordOauth = new DiscordOauth(this.client)
        discordOauth.get().then(router => {
            app.use(router)
            app.listen(3000, () => {
                console.log("Listening on port 3000")
            })
        }).catch(err => {
            console.error("Failed to initialize Discord OAuth:", err)
        })
    }
}