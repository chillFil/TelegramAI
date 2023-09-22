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

export async function text(ctx) {
    ctx.reply(await prompt(ctx.message.text, ctx.message.chat.id))
}

export async function voice(bot, ctx) {
    let fileLink = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    let file = await axios.get(fileLink, { responseType: 'arraybuffer' })
    fs.writeFileSync('audio.ogg', file.data)

    let transcript = await openai.audio.transcriptions.create({
        file: fs.createReadStream('audio.ogg'),
        model: 'whisper-1',
    })

    ctx.reply(await prompt(transcript.text, ctx.message.chat.id))
}

async function prompt(msg, id) {
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
            return response.content
    } catch (err) {
        console.log(err)
        return (err.message)
    }
}