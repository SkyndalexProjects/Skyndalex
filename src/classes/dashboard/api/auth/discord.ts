import express from "express";
import { Request, Response } from "express";
import type { SkyndalexClient } from "#classes";
import type { DiscordOauthResponse } from "#types";
import type { Guild } from "discord.js";

export class DiscordOauth {
    constructor(private readonly client: SkyndalexClient) {
        this.client = client;
    }

    async get() {
        const router = express.Router();

        router.get("/api/auth/callback", async (req: Request, res: Response) => {
            if (!req.query.code) {
                return res.send("No code provided");
            }

            const params = new URLSearchParams();
            params.set("grant_type", "authorization_code");
            params.set("code", req.query.code as string);
            params.set("redirect_uri", "http://localhost:3000/api/auth/callback");

            const response = await fetch("https://discord.com/api/oauth2/token", {
                method: "POST",
                body: params.toString(),
                headers: {
                    authorization: `Basic ${btoa(
                        `${this.client.user.id}:${process.env.CLIENT_SECRET}`
                    )}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const token = await response.json() as DiscordOauthResponse;

            console.log("Token received:", token);

            const cookies = req.cookies;
            if (!cookies.token) {
                res.cookie("token", token.refresh_token, {
                    maxAge: token.expires_in * 1000,
                    httpOnly: false,
                });
                console.log("Token set in cookie:", token.refresh_token);
            }
            
            console.log("Session user set:", req.session.user);

            res.redirect("http://localhost:5173");
            return;
        });

        router.get("/api/user/guilds", async (req: Request, res: Response) => {
            console.log("req.session", req.session);
            const response = await fetch("https://discord.com/api/users/@me/guilds", {
                headers: {
                    authorization: `Bearer ${req.cookies.token}`,
                },
            });

            const guilds = await response.json() as Guild[];
            res.send(guilds);
            return;
        });

        router.get("/api/user", async (req: Request, res: Response) => {
            const response = await fetch("https://discord.com/api/users/@me", {
                headers: {
                    authorization: `Bearer ${req.cookies.token}`,
                },
            });

            const user = await response.json();
            console.log("user", user);
            res.send(user);
            return;
        });

        router.get("/", (req, res) => {
            if (!req.session?.user) return res.redirect(process.env.OAUTH_URL);
        });

        return router;
    }
}