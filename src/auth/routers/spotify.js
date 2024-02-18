import express from "express";
import querystring from "querystring";
const spotifyRouter = express.Router();

spotifyRouter.get("/callback", async (req, res) => {
  let code = req.query.code;
  let state = req.query.state;

  if (state === null) {
    res.redirect(
      "/auth/error" +
        querystring.stringify({
          error: "state_mismatch",
        }),
    );
  } else {
    const formData = querystring.stringify({
      code: code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const tokenData = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET,
          ).toString("base64"),
      },
      body: formData,
      json: true,
    });
    const json = await tokenData.json();

    res.redirect("/spotify/auth/success");

    console.log("discordData", req.session);
    spotifyRouter.get("/auth/success", async function (req, res) {
      res.json({
        success: true,
        data: json,
        discordData: req.session,
      });

      console.log("discord", req.session);
      console.log("spotify", json);
      const client = req.client;

      await client.prisma.spotify.upsert({
        where: {
          uid: req.session.user.id,
        },
        create: {
          uid: req.session.user.id,
          accessToken: json.access_token,
        },
        update: {
          accessToken: json.access_token,
        },
      });
    });
  }
});

spotifyRouter.get("/login", function (req, res) {
  let scope = "playlist-read-private user-read-playback-position";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        client_id: process.env.SPOTIFY_CLIENT_ID,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        response_type: "code",
        scope: scope,
      }),
  );
});

export default spotifyRouter;
