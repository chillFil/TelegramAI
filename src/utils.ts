// Admin notification
export function notifyAdmins(bot, msg) {
    let ADMIN_IDS = process.env.ADMIN_IDS
    if(ADMIN_IDS) {
        ADMIN_IDS.split(",").forEach((id) => {
            bot.telegram.sendMessage(id, msg)
        })
    }
}