import chalk from "chalk";
const time = new Date().toUTCString();
export class Logger {
	warn(msg) {
		console.log(
			chalk.yellow(
				`[${chalk.bold(
					chalk.underline(`${new Date().toUTCString()}]`),
				)} [${chalk.bold("WARN")}] ${msg}`,
			),
		);
	}
	success(msg) {
		console.log(
			`[${chalk.whiteBright(chalk.underline(time))}] ${chalk.greenBright(
				"[SUCCESS]",
			)} ${chalk.greenBright(chalk.bold(msg))}`,
		);
	}
	error(msg) {
		console.error(
			`[${chalk.whiteBright(chalk.underline(time))}] ${chalk.redBright(
				"[ERROR]",
			)} ${chalk.redBright(chalk.bold(msg))}`,
		);
	}
	log(msg) {
		console.log(
			`[${chalk.whiteBright(chalk.underline(time))}] ${chalk.blueBright(
				"[LOG]",
			)} ${chalk.blueBright(chalk.bold(msg))}`,
		);
	}
}
