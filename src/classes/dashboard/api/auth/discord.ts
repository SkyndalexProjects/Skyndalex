import type { SkyndalexClient } from "#classes";
import { DiscordOauthResponse } from "#types";
import express from "express";
import type { Request, Response } from "express";
import type { Session } from "express-session";

export class DiscordOauth {
    constructor(private readonly client: SkyndalexClient) {
        this.client = client;
    }
    async get() {
        const router = express.Router();
    
        // @ts-ignore
        router.get("/api/auth/callback", async (req: Request, res: Response) => {
            if (!req.query.code) return res.send("No code provided");
    
            const params = new URLSearchParams();
    
            params.set("grant_type", "authorization_code");
            params.set("code", req.query.code as string);
            params.set("redirect_uri", "http://localhost:3000/api/auth/callback");
    
            const response = await fetch("https://discord.com/api/oauth2/token", {
                method: "POST",
                body: params.toString(),
                headers: {
                    authorization: `Basic ${btoa(
                        `${this.client.user.id}:${process.env.CLIENT_SECRET}`,
                    )}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
    
            const token = await response.json() as DiscordOauthResponse;

            const cookies = req.cookies;
            if (!cookies.token) {
                res.cookie("token", token.access_token, {
                    maxAge: token.expires_in,
                    httpOnly: false,
                });
            }

            res.send("Auth success");
        });

        router.get("/", (req, res) => {
            console.log("session", req.session)
            if (!req.session?.user) return res.redirect(process.env.OAUTH_URL)
        })
        return router;
    }
}