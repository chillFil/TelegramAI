// Libraries and APIsù
const { Telegraf } = require("telegraf")
const { join } = require("path")
const { stringify } = require("querystring")
const { google } = require("googleapis")
const OpenAI = require("openai")



// Environment variables
require("dotenv").config({ 
    path: join(__dirname, "../.env") 
})

const {
    BOT_TOKEN,
    GG_API_KEY,
    IMG_SEARCH_ID,
    OPENAI_API_KEY,
    OPEN_AI_ID,
    ALLOWED_USERS,
    ADMIN_IDS
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
if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY must be provided!")
}
if (!OPEN_AI_ID) {
    throw new Error("OPEN_AI_ID must be provided!")
}
if (!ALLOWED_USERS) {
    throw new Error("ALLOWED_USERS must be provided!")
}
if (!ADMIN_IDS) {
    throw new Error("ADMIN_IDS must be provided!")
}

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);
//Custom Search
const customsearch = google.customsearch('v1');
// Setting OpenAiAPI
const openai = new OpenAI(OPENAI_API_KEY)

const history = {}

/* SECURITY */
// Admins notification
function notifyAdmins(msg) {
    if(ADMIN_IDS) {
        ADMIN_IDS.split(",").forEach((id) => {
            bot.telegram.sendMessage(id, msg)
        })
    }
}

// Restrict bot usage
bot.use((ctx, next) => {
    if (ALLOWED_USERS && !ALLOWED_USERS.split(",").includes(ctx.message.chat.id.toString())) {
        notifyAdmins("Unauthorized access attempt by " + ctx.message.chat.id.toString())
        ctx.reply("You are not allowed to use this bot!")
        return
    }
    next()
})



/* BOT COMMANDS */
//Start
bot.start((ctx) => {
    ctx.reply('Hello!')
})

//UserID
bot.command("id", (ctx) => {
    ctx.reply('Your id is: ' + ctx.message.chat.id.toString())
})

//Promote
bot.command("promote", (ctx) => {
    ctx.reply("IG: @_chillfil_, @fillo.dalla")
})

//Echo
bot.command("echo", (ctx) => {
    str = ctx.message.text.replace("/echo ", "")
    ctx.reply(str)
})

//Random pic
bot.command("pic", (ctx) => {
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

//Help
bot.command("help", (ctx) => {
    let reply = "/start \n/promote \n/echo <text you want to cut out> \n/pic <img you want to search>"
    ctx.reply(reply)
})

bot.command("stream", (ctx) => {
    let msg = "s"
    ctx.reply(msg)
    setInterval(() => {
        msg += "s"
        ctx.editMessageText(msg)
    }, 100)
})

//Messages
bot.on("message", async (ctx) => {
    const msg = ctx.message.text
    const id = ctx.message.chat.id
    
    if (history[id] === undefined) {
        history[id] = [{
            role: "system",
            content: "Il tuo lavoro è la troia, devi trovare nuovi clienti flirtando con loro."
        }]
    }

    try {
        history[id].push({
            role: "user",
            content: msg
        })
    
        const compl = await openai.chat.completions.create({
            messages: history[id],
            model: "gpt-3.5-turbo-16k",
        })

        const response = compl.choices[0].message
        history[id].push(response)
        ctx.reply(response.content)
    } catch (err) {
        console.log(err)
        ctx.reply("An error occurred: " + err.message)
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