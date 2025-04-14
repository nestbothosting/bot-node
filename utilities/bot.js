const BotModel = require('../mongodb/model/bot')

const SaveBot = async (bot_token, bot_name, owner_id) => {
    if (!bot_token && !bot_name && !owner_id) {
        return { status: false, message: "Missing required fields: bot_token, bot_name, and owner_id are required." }
    }
    try {
        const NewBot = new BotModel({
            bot_token,
            bot_name,
            owner_id
        })
        await NewBot.save()
        return { status: true, message: "Successfully add Bot", id: NewBot._id }
    } catch (error) {
        console.log(error.message)
        return { status: false, message: "Oops Server Error" }
    }
}

const GetOneBot = async (bot_uid) => {
    try {
        if (!bot_uid) {
            return { status: false, message: "bot id is required" }
        }

        const Bot = await BotModel.findById(bot_uid)

        return { status: true, bot: Bot }
    } catch (error) {
        console.log(error)
        return { status: false, bot: [] }
    }
}

const Mybots = async (user_id) => {
    try {
        if (!user_id) {
            return { status: false, message: "User id is required" }
        }

        const bots = await BotModel.find({ owner_id: user_id })

        return { status: true, bots }
    } catch (error) {
        console.log(error.message)
        return { status: false, bots: [] }
    }
}

const UpdateBot = async (bot_id, bot_name, bot_token, st_message) => {
    try {
        const data = {};
        if (bot_name) data.bot_name = bot_name;
        if (bot_token) data.bot_token = bot_token;
        if (st_message) data.st_message = st_message;

        const updatedBot = await BotModel.findOneAndUpdate(
            { _id: bot_id },
            { $set: data },
            { new: true }
        );

        return { status: true, message: "Successfully Updated Bot Data" };
    } catch (error) {
        console.error("Error updating bot:", error);
        return { status: false, message: "Oops Server Error" }
    }
};

const DeleteBot = async (bot_id) => {
    try {
        const deletedbot = await BotModel.findByIdAndDelete(bot_id);

        if (!deletedbot) {
            return { status: false, message: "Bot not found" };
        }

        return { status: true, message: `Successfully Deleted ${deletedbot.bot_name}` };
    } catch (error) {
        return { status: false, message: "An error occurred while deleting the bot", error: error.message };
    }
};


module.exports = { SaveBot, GetOneBot, Mybots, UpdateBot, DeleteBot }