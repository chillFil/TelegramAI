import { Telegraf } from "telegraf"
import * as commands from "./commands"
import * as utils from "./utils"
import * as ai from "./ai"
import * as price from "./price"

// Environment variables
import { config } from "dotenv"
config({ 
    path: "./.env" 
})

const {
    BOT_TOKEN,
    ALLOWED_USERS,
    ADMIN_IDS
} = process.env
if (!BOT_TOKEN) {
    throw new Error("BOT_TOKEN must be provided!")
}
if (!ALLOWED_USERS) {
    throw new Error("ALLOWED_USERS must be provided!")
}
if (!ADMIN_IDS) {
    throw new Error("ADMIN_IDS must be provided!")
}

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

/* SECURITY */
// Restrict bot usage
bot.use((ctx, next) => {
    if (ALLOWED_USERS && ctx.message && !ALLOWED_USERS.split(",").includes(ctx.message.chat.id.toString())) {
        utils.notifyAdmins(bot, "Unauthorized access attempt by " + ctx.message.chat.id.toString())
        ctx.reply("You are not allowed to use this bot!")
        return
    }
    next()
})

/* BOT COMMANDS */
bot.start(commands.start)
bot.command("id", commands.id)
bot.command("promote", commands.promote)
bot.command("echo", commands.echo)
bot.command("pic", commands.pic)
bot.command("help", commands.help)
//bot.command("price", price.options)

bot.command("stream", (ctx) => {
    let msg = "s"
    ctx.reply(msg)
    setInterval(() => {
        msg += "s"
        ctx.editMessageText(msg)
    }, 100)
})

//Messages
bot.on("text", ai.text)
bot.on("voice", (ctx) => ai.voice(bot, ctx))


// Start bot
bot.launch({
    dropPendingUpdates: true
})
console.log("Bot started!")


// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))