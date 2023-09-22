import { Telegraf } from "telegraf"
import OpenAI from "openai"
import * as commands from "./commands"
import * as utils from "./utils"

// Environment variables
import { config } from "dotenv"
config({ 
    path: "./.env" 
})

const {
    BOT_TOKEN,
    OPENAI_API_KEY,
    OPEN_AI_ID,
    ALLOWED_USERS,
    ADMIN_IDS
} = process.env
if (!BOT_TOKEN) {
    throw new Error("BOT_TOKEN must be provided!")
}
if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY must be provided!")
}
// if (!OPEN_AI_ID) {
//     throw new Error("OPEN_AI_ID must be provided!")
// }
if (!ALLOWED_USERS) {
    throw new Error("ALLOWED_USERS must be provided!")
}
if (!ADMIN_IDS) {
    throw new Error("ADMIN_IDS must be provided!")
}

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Initialize OpenAI
const openai = new OpenAI(OPENAI_API_KEY)
const context = {}

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

bot.command("stream", (ctx) => {
    let msg = "s"
    ctx.reply(msg)
    setInterval(() => {
        msg += "s"
        ctx.editMessageText(msg)
    }, 100)
})

//Messages
bot.on("text", async (ctx) => {
    let msg = ctx.message.text
    const id = ctx.message.chat.id
    
    if (context[id] === undefined) {
        context[id] = [{
            role: "system",
            content: "Sei un tecnico informatico esperto in qualsiasi materia IT."
        }]
    }

    try {
        context[id].push({
            role: "user",
            content: msg
        })
    
        const compl = await openai.chat.completions.create({
            messages: context[id],
            model: "gpt-3.5-turbo-16k",
        })

        const response = compl.choices[0].message
        context[id].push(response)
        if(response.content)
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