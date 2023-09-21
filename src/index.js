// Libraries and APIs
// const { Configuration, OpenAIApi } = require("openai");
const { Telegraf } = require("telegraf")
const { join } = require("path")
const { stringify } = require("querystring")
const { google } = require("googleapis")


// Environment variables
require("dotenv").config({ 
    path: join(__dirname, "../.env") 
})

const {
    BOT_TOKEN,
    GG_API_KEY,
    IMG_SEARCH_ID,
    // OPENAI_API_KEY,
    // OPEN_AI_ID
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
// if (!OPENAI_API_KEY) {
//     throw new Error("OPENAI_API_KEY must be provided!")
// }
// if (!OPEN_AI_ID) {
//     throw new Error("OPEN_AI_ID must be provided!")
// }

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);
//Custom Search
const customsearch = google.customsearch('v1');
// Setting OpenAiAPI
// const configuration = new Configuration({
//     organization: OPEN_AI_ID,
//     apiKey: OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);
// const response = openai.listEngines();

// Bot commands
bot.start((ctx) => { //start
    ctx.reply("Hello!")
})

bot.command("promote", (ctx) => { //promote
    ctx.reply("IG: @_chillfil_, @fillo.dalla")
})

bot.command("echo", (ctx) => { //echo
    str = ctx.message.text.replace("/echo ", "")
    ctx.reply(str)
})

bot.command("pic", (ctx) => { //random pic
    let str = ctx.message.text.replace("/pic ", "")
    customsearch.cse.list({
        auth: GG_API_KEY,
        cx: IMG_SEARCH_ID,
        q: str,
        searchType: 'image',
        num: 10,
        safeSearch: 'off',
        disableWebSearch: true
    }).then((result) => {
        ctx.replyWithPhoto(result.data.items[Math.floor(Math.random() * 10)].link)
    }).catch((err) => {
        ctx.reply(err)
    })
})

bot.command("help", (ctx) => {
    let reply = "/start \n/promote \n/echo <text you want to cut out> \n/pic <img you want to search>"
    ctx.reply(reply)
})

bot.on("message", (ctx) => {
    const msg = ctx.message.text.toLowerCase()

    if (msg.includes("hi")) {
        ctx.reply("Hello!")
    }
    if (msg.includes("how are you")) {
        ctx.reply("Fine, thanks!")
    }
})


// Start bot
bot.launch({
    dropPendingUpdates: true
})
console.log("Bot started!")


// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))