import { google } from "googleapis"
import { config } from "dotenv"
config({ 
    path: "./.env" 
})
const {
    GG_API_KEY,
    IMG_SEARCH_ID
} = process.env

//Start
export function start (ctx) {
    ctx.reply("Welcome to the bot!")
}

//User ID
export function id (ctx) {
    ctx.reply('Your id is: ' + ctx.message.chat.id.toString())
}

//Promote
export function promote (ctx) {
    ctx.reply("Developer:\n@_chillfil_\n@fillo.dalla\n@niko.zanni\n@_bore_04")
}

//Echo
export function echo (ctx) {
    ctx.reply(ctx.message.text.replace("/echo ", ""))
}

//Help
export function help (ctx) {
    let reply = "/start \n/promote \n/echo <text you want to cut out> \n/pic <img you want to search> \n/picgen <img you want to generate> \nYou can also just send a message and get the AI response. \nOr you can just try to send a voice message and see what happens! \n\nHave fun!!"
    ctx.reply(reply)
}

//Pic
export async function pic (ctx) {
    try {
        let result = await google.customsearch("v1").cse.list({
            auth: GG_API_KEY,
            cx: IMG_SEARCH_ID,
            q: ctx.message.text.replace("/pic ", ""),
            searchType: 'image',
            num: 10,
            safe: 'off'
        })
        if(result.data.items)
            ctx.replyWithPhoto(result.data.items[Math.floor(Math.random() * 10)].link)
    }
    catch(err) {
        ctx.reply(err.message)
    }
}