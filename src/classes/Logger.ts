import pc from "picocolors"

export class Logger {
    error(message: string) {
        console.error(`${pc.red(pc.bold("[ERROR]"))} ${message}`)
    }
    log(message: string) {
        console.log(`${pc.blue(pc.bold("[LOG]"))} ${message}`)
    }
}