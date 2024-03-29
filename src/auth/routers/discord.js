import express from 'express';
const discordRouter = express.Router();
discordRouter.get('/callback', async (req, res) => {
    let code = req.query.code;

    const params = new URLSearchParams();
    params.set('grant_type', 'authorization_code');
    params.set('code', code);
    params.set('redirect_uri', process.env.DISCORD_REDIRECT_URI);

    const response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: params.toString(),
        headers: {
            authorization: `Basic ${btoa(`${process.env.CLIENT_ID}:${process.env.DISCORD_CLIENT_SECRET}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const json = await response.json();
    console.log('dcJson', json);

    const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `Bearer ${json.access_token}`
        }
    });
    const userData = await userResponse.json();
    req.session.user = { ...userData };

    res.redirect('http://localhost:5000/spotify/login');
});
discordRouter.get('/login', async (req, res) => {
    res.redirect(
        'https://discord.com/api/oauth2/authorize?client_id=1037067718769254453&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fdiscord%2Fcallback&scope=identify'
    );
});

export default discordRouter;
