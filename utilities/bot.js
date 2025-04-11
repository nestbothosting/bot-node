const BotModel = require('../mongodb/model/bot')

const SaveBot = async (bot_token, bot_name, owner_id) => {
    if (!bot_token && !bot_name && !owner_id) {
        return { status:false, message:"Missing required fields: bot_token, bot_name, and owner_id are required."}
    }
    try {
        const NewBot = new BotModel({
            bot_token,
            bot_name,
            owner_id
        })
        await NewBot.save()
        return { status:true , message:"Successfully add Bot", id:NewBot._id }
    } catch (error) {
        console.log(error.message)
        return { status:false, message:"Oops Server Error" }
    }
}

module.exports = { SaveBot }