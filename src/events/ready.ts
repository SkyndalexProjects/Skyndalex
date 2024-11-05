import type { SkyndalexClient } from "#classes";
import express from "express";
import type { Request, Response } from "express";

export async function ready(client: SkyndalexClient) {
	const app = express();

	// @ts-ignore
	app.get("/api/auth/callback", async (req: Request, res: Response) => {
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
					`${client.user.id}:${process.env.CLIENT_SECRET}`,
				)}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		const token = await response.json();
        console.log("token", token)
	});
	app.listen(3000);
}
