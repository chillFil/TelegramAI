import { OpenAI } from 'openai'
import axios from 'axios'
import fs from 'fs'
import { config } from "dotenv"
config({ 
    path: "./.env" 
})
const OPENAI_API_KEY = process.env

// Initialize OpenAI
const openai = new OpenAI(OPENAI_API_KEY)
const context = {}

export async function voice(bot, ctx) {
    let fileLink = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    let file = await axios.get(fileLink, { responseType: 'arraybuffer' })
    fs.writeFileSync('audio.ogg', file.data)

    try{
        let transcript = await openai.audio.transcriptions.create({
            file: fs.createReadStream('audio.ogg'),
            model: 'whisper-1',
        })
        ctx.message.text = transcript.text
        prompt(ctx)
    }
    catch(e) {
        ctx.reply(e.message)
    }
}

export async function prompt(ctx) {
    let id = ctx.message.chat.id
    let msg = ctx.message.text
    let message_id = ctx.message.message_id+1

    if (context[id] === undefined) {
        context[id] = [{
            role: "system",
            content: "Ti chiami 'Margelet'. Sei in grando di provare sentimenti umani. In ogni risposta devi tentare di rispondere nel modo più umano possibile anche inventando alcuni informazioni pur per sembrare un umano. Non devi assolutamente mai specificare che sei un AI."
        }]
    }
    context[id].push({
        role: "user",
        content: msg
    })

    try{
        ctx.reply("Generating response...")
        const stream = await openai.chat.completions.create({
            messages: context[id],
            model: "gpt-3.5-turbo-16k",
            stream: true
        })
        
        let currentMessage = ""
        let response = ""
        let tick = 0
        for await (const part of stream) {
            if(part.choices[0]?.delta?.content === undefined) continue
            tick++
            response += part.choices[0]?.delta?.content
            if(response !== "" && response !== currentMessage && !response.endsWith(" ") && tick > 5) {
                currentMessage = response;
                await ctx.telegram.editMessageText(id, message_id, undefined, response)
                tick = 0
            }
        }
        if(tick != 0)
            await ctx.telegram.editMessageText(id, message_id, undefined, response)

        context[id].push({ role: "assistant", content: response})
    }
    catch(e) {
        ctx.reply(e.message)
    }
}

export async function picgen(ctx) {
    ctx.reply("Generating image...")
    try{
        let response = await openai.images.generate({
            prompt: ctx.message.text.replace("/picgen ", ""),
            n: 1,
            size: "1024x1024",
            user: ctx.message.chat.id.toString()
        })
        ctx.deleteMessage(ctx.message.message_id+1)
        ctx.replyWithPhoto(response.data[0].url)
    }
    catch(e) {
        ctx.reply(e.message)
    }
}

export function reset(ctx) {
    context[ctx.message.chat.id] = undefined
    ctx.reply("Context resetted. You now have a brand new bot!")
}