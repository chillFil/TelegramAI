const { Telegraf } = require("telegraf")
const { join } = require("path")

require("dotenv").config({ 
    path: join(__dirname, "../.env") 
})

const {
    BOT_TOKEN
} = process.env

if (!BOT_TOKEN) {
    throw new Error("BOT_TOKEN must be provided!")
}

const bot = new Telegraf(BOT_TOKEN)

// Triggered when start the bot (or send /start command)
bot.start((ctx) => {
    ctx.reply("Hello!")
})

bot.launch({
    dropPendingUpdates: true
})

console.log("Bot started!")

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))