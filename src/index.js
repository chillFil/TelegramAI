const { Telegraf } = require("telegraf")
const { join } = require("path")
const { stringify } = require("querystring")
const { google } = require("googleapis")


require("dotenv").config({ 
    path: join(__dirname, "../.env") 
})

const {
    BOT_TOKEN,
    GG_API_KEY,
    IMG_SEARCH_ID
} = process.env

if (!BOT_TOKEN) {
    throw new Error("BOT_TOKEN must be provided!")
}
if (!GG_API_KEY) {
    throw new Error("GOOGLE_API_KEY must be provided!")
}
if (!IMG_SEARCH_ID) {
    throw new Error("IMG_SEARCH_ID must be provided!")
}
const customsearch = google.customsearch('v1');

customsearch.cse.list({
    auth: GG_API_KEY,
    cx: IMG_SEARCH_ID,
    q: 'cat',
}).then((result) => {
    console.log(result.data)
})

const bot = new Telegraf(BOT_TOKEN)

// Triggered when start the bot (or send /start command)
bot.start((ctx) => {
    ctx.reply("Hello!")
})

bot.command("promote", (ctx) => {
    ctx.reply("IG: @_chillfil_, @fillo.dalla")
})

bot.command("echo", (ctx) => {
    ctx.reply(ctx.message.text)
})

//Random pic generator
bot.command("pic", (ctx) => {
    let time = new Date().getTime()
    const pic = "https://picsum.photos/?time"
    ctx.replyWithPhoto(pic)
})


bot.command("custom", (ctx) => {
    str = ctx.message.text.replace("/custom ", "")
    ctx.reply(str)
})

bot.on("message", (ctx) => {
    const msg = ctx.message.text.toLowerCase()

    if (msg.includes("hi")) {
        ctx.reply("Hello!")
    }
    if (msg.includes("how are you")) {
        ctx.reply("Fine, thanks!")
    }
    if (msg.includes("cat")) {
        ctx.replyWithPhoto("https://im.indiatimes.in/content/2023/Sep/Blue-Smurf-Cat-meme_6506cc84d1090.png")
    }
})

bot.launch({
    dropPendingUpdates: true
})

console.log("Bot started!")

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))