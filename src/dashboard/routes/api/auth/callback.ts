import { Router, Request, Response } from "express";
import { DiscordOauthResponse } from "#types";
const router = Router();

router.get(
    "/",
    //@ts-expect-error
    async (req: Request, res: Response) => {
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
                    `${req.client.user.id}:${process.env.CLIENT_SECRET}`,
                )}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const token = (await response.json()) as DiscordOauthResponse;
        req.session.token = token.access_token;

        const cookies = req.cookies;
        if (!cookies.token) {
            res.cookie("token", token.access_token, {
                maxAge: token.expires_in * 1000,
                httpOnly: false,
            });
        }

        res.redirect("http://localhost:5173/api/guilds");
        return;
    },
);

export default router;