import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req, res) => {
	if (!req.session?.token) return res.redirect(process.env.OAUTH_URL);
});

export default router;
