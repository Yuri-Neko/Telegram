const { fetchJson, range, parseMarkdown } = require('./lib/function')
const { Telegraf } = require('telegraf')
const help = require('./lib/help')
const tele = require('./lib/tele')
const chalk = require('chalk')
const os = require('os')
const fs = require('fs')

const {
    apikey,
    apikeyanto,
    bot_token,
    owner,
    ownerLink,
    version,
    prefix
} = JSON.parse(fs.readFileSync(`./config.json`))

if (bot_token == "") {
    return console.log("=== BOT TOKEN CANNOT BE EMPTY ===")
}

const bot = new Telegraf(bot_token)

bot.command('start', async(lol) => {
    user = tele.getUser(lol.message.from)
    await help.start(lol, user.full_name)
    await lol.deleteMessage()
})

bot.command('help', async(lol) => {
    user = tele.getUser(lol.message.from)
    await help.help(lol, user.full_name, lol.message.from.id.toString())
})

bot.on("callback_query", async(lol) => {
    cb_data = lol.callbackQuery.data.split("-")
    user_id = Number(cb_data[1])
    if (lol.callbackQuery.from.id != user_id) return lol.answerCbQuery("Sorry, You do not have the right to access this button.", { show_alert: true })
    callback_data = cb_data[0]
    user = tele.getUser(lol.callbackQuery.from)
    const isGroup = lol.chat.type.includes("group")
    const groupName = isGroup ? lol.chat.title : ""
    if (!isGroup) console.log(chalk.whiteBright("├"), chalk.cyanBright("[ ACTIONS ]"), chalk.whiteBright(callback_data), chalk.greenBright("from"), chalk.whiteBright(user.full_name))
    if (isGroup) console.log(chalk.whiteBright("├"), chalk.cyanBright("[ ACTIONS ]"), chalk.whiteBright(callback_data), chalk.greenBright("from"), chalk.whiteBright(user.full_name), chalk.greenBright("in"), chalk.whiteBright(groupName))
    if (callback_data == "help") return await help[callback_data](lol, user.full_name, user_id)
    await help[callback_data](lol, user_id.toString())
})

bot.on("message", async(lol) => {
    try {
        const body = lol.message.text || lol.message.caption || ""
        comm = body.trim().split(" ").shift().toLowerCase()
        cmd = false
        if (prefix != "" && body.startsWith(prefix)) {
            cmd = true
            comm = body.slice(1).trim().split(" ").shift().toLowerCase()
        }
        const command = comm
        const args = await tele.getArgs(lol)
        const user = tele.getUser(lol.message.from)

        const reply = async(text) => {
            for (var x of range(0, text.length, 4096)) {
                return await lol.replyWithMarkdown(text.substr(x, 4096), { disable_web_page_preview: true })
            }
        }

        const isCmd = cmd
        const isGroup = lol.chat.type.includes("group")
        const groupName = isGroup ? lol.chat.title : ""

        const isImage = lol.message.hasOwnProperty("photo")
        const isVideo = lol.message.hasOwnProperty("video")
        const isAudio = lol.message.hasOwnProperty("audio")
        const isSticker = lol.message.hasOwnProperty("sticker")
        const isContact = lol.message.hasOwnProperty("contact")
        const isLocation = lol.message.hasOwnProperty("location")
        const isDocument = lol.message.hasOwnProperty("document")
        const isAnimation = lol.message.hasOwnProperty("animation")
        const isMedia = isImage || isVideo || isAudio || isSticker || isContact || isLocation || isDocument || isAnimation

        const quotedMessage = lol.message.reply_to_message || {}
        const isQuotedImage = quotedMessage.hasOwnProperty("photo")
        const isQuotedVideo = quotedMessage.hasOwnProperty("video")
        const isQuotedAudio = quotedMessage.hasOwnProperty("audio")
        const isQuotedSticker = quotedMessage.hasOwnProperty("sticker")
        const isQuotedContact = quotedMessage.hasOwnProperty("contact")
        const isQuotedLocation = quotedMessage.hasOwnProperty("location")
        const isQuotedDocument = quotedMessage.hasOwnProperty("document")
        const isQuotedAnimation = quotedMessage.hasOwnProperty("animation")
        const isQuoted = lol.message.hasOwnProperty("reply_to_message")

        var typeMessage = body.substr(0, 50).replace(/\n/g, '')
        if (isImage) typeMessage = "Image"
        else if (isVideo) typeMessage = "Video"
        else if (isAudio) typeMessage = "Audio"
        else if (isSticker) typeMessage = "Sticker"
        else if (isContact) typeMessage = "Contact"
        else if (isLocation) typeMessage = "Location"
        else if (isDocument) typeMessage = "Document"
        else if (isAnimation) typeMessage = "Animation"

        if (!isGroup && !isCmd) console.log(chalk.whiteBright("├"), chalk.cyanBright("[ PRIVATE ]"), chalk.whiteBright(typeMessage), chalk.greenBright("from"), chalk.whiteBright(user.full_name))
        if (isGroup && !isCmd) console.log(chalk.whiteBright("├"), chalk.cyanBright("[  GROUP  ]"), chalk.whiteBright(typeMessage), chalk.greenBright("from"), chalk.whiteBright(user.full_name), chalk.greenBright("in"), chalk.whiteBright(groupName))
        if (!isGroup && isCmd) console.log(chalk.whiteBright("├"), chalk.cyanBright("[ COMMAND ]"), chalk.whiteBright(typeMessage), chalk.greenBright("from"), chalk.whiteBright(user.full_name))
        if (isGroup && isCmd) console.log(chalk.whiteBright("├"), chalk.cyanBright("[ COMMAND ]"), chalk.whiteBright(typeMessage), chalk.greenBright("from"), chalk.whiteBright(user.full_name), chalk.greenBright("in"), chalk.whiteBright(groupName))

        var file_id = ""
        if (isQuoted) {
            file_id = isQuotedImage ? lol.message.reply_to_message.photo[lol.message.reply_to_message.photo.length - 1].file_id :
                isQuotedVideo ? lol.message.reply_to_message.video.file_id :
                isQuotedAudio ? lol.message.reply_to_message.audio.file_id :
                isQuotedDocument ? lol.message.reply_to_message.document.file_id :
                isQuotedAnimation ? lol.message.reply_to_message.animation.file_id : ""
        }
        var mediaLink = file_id != "" ? await tele.getLink(file_id) : ""

        switch (command) {
            case 'help':
                await help.help(lol, user.full_name, lol.message.from.id.toString())
                break
//api jojo
case 'quotes':
                result = await fetchJson(`https://docs-jojoapi.herokuapp.com/api/randomquote?apikey=Syaa`)
                pk = `"${result.result.quotes}"\n- ${result.result.author}`
                await reply(pk)
                break
case 'quotesislami':
                result = await fetchJson(`https://docs-jojoapi.herokuapp.com/api/randomquote/muslim?apikey=Syaa`)
                jer = `${result.result.text_id}`
                await reply(jer)
                break
//api anto
case 'nuliskiri':
              jird = body.slice(11)
                if (args.length == 0) return await reply(`Example: ${prefix + command} Arasya`)
                await lol.replyWithPhoto({ url: `https://hardianto.xyz/api/nuliskiri?text=${jird}&apikey=${apikeyanto}` })
                break
case 'nuliskanan':
              jird = body.slice(12)
                if (args.length == 0) return await reply(`Example: ${prefix + command} Arasya`)
                await lol.replyWithPhoto({ url: `https://hardianto.xyz/api/nuliskanan?text=${jird}&apikey=${apikeyanto}` })
                break
case 'foliokiri':
              jird = args.join(" ")
                if (args.length == 0) return await reply(`Example: ${prefix + command} Arasya`)
                await lol.replyWithPhoto({ url: `https://hardianto.xyz/api/foliokiri?text=${jird}&apikey=${apikeyanto}` })
                break
                case 'foliokanan':
              jird = args.join(" ")
                if (args.length == 0) return await reply(`Example: ${prefix + command} Arasya`)
                await lol.replyWithPhoto({ url: `https://hardianto.xyz/api/foliokanan?text=${jird}&apikey=${apikeyanto}` })
                break
//api amel
case 'glitch':
              jird = args.join(" ")
                if (args.length == 0) return await reply(`Example: ${prefix + command} Arasya`)
                await lol.replyWithPhoto({ url: `https://melcanz.com/textpro/glitch?text=${jird}&apikey=${apikey}` })
                break
case 'glitchtt':
                if (args.length == 0) return await reply(`Example: ${prefix + command} Arasya Jojo`)
                await lol.replyWithPhoto({ url: `https://melcanz.com/textpro/glitchtiktok?text=${args[0]}&text2=${args[1]}&apikey=${apikey}` })
                break
case 'wolflogo':
                if (args.length == 0) return await reply(`Example: ${prefix + command} Arasya Jojo`)
                await lol.replyWithPhoto({ url: `https://melcanz.com/textpro/logowolf?text=${args[0]}&text2=${args[1]}&apikey=${apikey}` })
                break
case 'pornhub':
                if (args.length == 0) return await reply(`Example: ${prefix + command} Arasya Jojo`)
                await lol.replyWithPhoto({ url: `https://melcanz.com/textpro/pornhub?text=${args[0]}&text2=${args[1]}&apikey=${apikey}` })
                break
case 'gameover':
                if (args.length == 0) return await reply(`Example: ${prefix + command} Arasya Jojo`)
                await lol.replyWithPhoto({ url: `https://melcanz.com/textpro/gameover?text=${args[0]}&text2=${args[1]}&apikey=${apikey}` })
                break
case 'toxic':
              jird = args.join(" ")
                if (args.length == 0) return await reply(`Example: ${prefix + command} Arasya`)
                await lol.replyWithPhoto({ url: `https://melcanz.com/textpro/toxic?text=${jird}&apikey=${apikey}` })
                break
        }
    } catch (e) {
        console.log(chalk.whiteBright("├"), chalk.cyanBright("[  ERROR  ]"), chalk.redBright(e))
    }
})


bot.launch()
bot.telegram.getMe().then((getme) => {
    itsPrefix = (prefix != "") ? prefix : "No Prefix"
    console.log(chalk.greenBright(' ===================================================='))
    console.log(chalk.greenBright(" │ + Owner    : " + owner || ""))
    console.log(chalk.greenBright(" │ + Bot Name : " + getme.first_name || ""))
    console.log(chalk.greenBright(" │ + Version  : " + version || ""))
    console.log(chalk.greenBright(" │ + Host     : " + os.hostname() || ""))
    console.log(chalk.greenBright(" │ + Platfrom : " + os.platform() || ""))
    console.log(chalk.greenBright(" │ + Prefix   : " + itsPrefix))
    console.log(chalk.greenBright(' ===================================================='))
    console.log(chalk.whiteBright('╭─── [ LOG ]'))
})
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))