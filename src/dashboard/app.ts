import { SkyndalexClient } from "#classes";
import cookieParser from "cookie-parser";
import express from "express";
import session from "express-session";
import passport from "passport";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import path from "path";

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
		token: string;
	}
}
const app = express();

export async function InitServer(client: SkyndalexClient) {
	app.use(cookieParser());
	app.use(express.json());
	app.use(
		session({
			secret: "test",
			resave: false,
			saveUninitialized: false,
			cookie: { httpOnly: false, secure: false },
		}),
	);
	app.use(passport.initialize());
	app.use(passport.session());

	app.use((req, res, next) => {
		req.client = client;
		next();
	});
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	``;
	const getRoutes = await loadRoutes(path.join(__dirname, "routes"), "/");
	console.log("getRoutes", getRoutes);
	app.listen(3000, () => {
		console.log("[Server] :: Listening on port 3000");
	});

	return app;
}
async function loadRoutes(
	dir: string,
	basePath: string = "",
): Promise<string[]> {
	const files = fs.readdirSync(dir);
	const routes: string[] = [];

	for (const file of files) {
		const fullPath = path.join(dir, file);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			const subRoutes = await loadRoutes(fullPath, `${basePath}${file}/`);
			routes.push(...subRoutes);
		} else if (file.endsWith(".js") || file.endsWith(".ts")) {
			const cleanRoute = file.split(".")[0];
			const routePath =
				cleanRoute === "index" ? basePath : `${basePath}${cleanRoute}`;
			const route = (await import(fullPath)).default;
			app.use(routePath, route);
			routes.push(routePath);
		}
	}

	return routes;
}
