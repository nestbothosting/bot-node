const BotModel = require("../mongodb/model/bot");
const { MyClient } = require("../bot/bot");
const YNS_Model = require("../mongodb/model/yns");
const { Node_ID } = require("../core/auth.json");
const { SaveBotLog } = require('../sp_event/botlog')

const SaveBot = async (bot_token, bot_name, owner_id) => {
    if (!bot_token && !bot_name && !owner_id) {
        return {
            status: false,
            message:
                "Missing required fields: bot_token, bot_name, and owner_id are required.",
        };
    }
    try {
        const botCount = await BotModel.countDocuments({ owner_id });
        if (botCount >= 2) {
            return {
                status: false,
                message: "You can only create up to 2 bots.",
            };
        }
        const NewBot = new BotModel({
            bot_token,
            bot_name,
            owner_id,
        });
        await NewBot.save();
        SaveBotLog(NewBot._id, "Create New Collection", "Create Bot")
        return { status: true, message: "Successfully add Bot", id: NewBot._id };
    } catch (error) {
        console.log(error.message);
        return { status: false, message: "Oops Server Error" };
    }
};

const GetOneBot = async (bot_uid) => {
    try {
        if (!bot_uid) {
            return { status: false, message: "bot id is required" };
        }

        const Bot = await BotModel.findById(bot_uid);

        return { status: true, bot: Bot };
    } catch (error) {
        console.log(error);
        return { status: false, bot: [] };
    }
};

const Mybots = async (user_id) => {
    try {
        if (!user_id) {
            return { status: false, message: "User id is required" };
        }

        const bots = await BotModel.find({ owner_id: user_id });

        return { status: true, bots };
    } catch (error) {
        console.log(error.message);
        return { status: false, bots: [] };
    }
};

const UpdateBot = async (bot_id, bot_name, bot_token, st_message) => {
    try {
        const data = {};
        const oldData = await BotModel.findById(bot_id);

        if (bot_name) data.bot_name = bot_name;
        if (bot_token) {
            data.bot_token = bot_token;
            const YNS_Data = await YNS_Model.findOne({
                bot_token: oldData.bot_token,
            });
            if (YNS_Data) {
                YNS_Data.bot_token = bot_token;
                await YNS_Data.save();
            }
        }
        if (st_message) data.st_message = st_message;

        const updatedBot = await BotModel.findOneAndUpdate(
            { _id: bot_id },
            { $set: data },
            { new: true }
        );

        return { status: true, message: "Successfully Updated Bot Data" };
    } catch (error) {
        console.error("Error updating bot:", error);
        return { status: false, message: "Oops Server Error" };
    }
};

const DeleteBot = async (bot_id) => {
    try {
        const deletedbot = await BotModel.findByIdAndDelete(bot_id);

        if (!deletedbot) {
            return { status: false, message: "Bot not found" };
        }

        SaveBotLog(deletedbot._id, "Delete The Bot", "Delete")

        return {
            status: true,
            message: `Successfully Deleted ${deletedbot.bot_name}`,
        };
    } catch (error) {
        return {
            status: false,
            message: "An error occurred while deleting the bot",
            error: error.message,
        };
    }
};

const GetChannels = async (server_id, bot_token) => {
    try {
        const Client = await MyClient(bot_token);
        if (!Client.status) {
            return Client;
        }

        const clientdata = Client.client;
        const guild = clientdata.guilds.cache.get(server_id);

        if (!guild) {
            return {
                status: false,
                message: `Server with ID ${server_id} not found.`,
            };
        }

        const channels = guild.channels.cache;

        return { status: true, channels };
    } catch (error) {
        console.error(error.message);
        return { status: false, message: error.message };
    }
};

const GetMyRoles = async (server_id, bot_token) => {
    try {
        const Client = await MyClient(bot_token);
        if (!Client.status) {
            return Client;
        }
        const client = Client.client;

        const guild = client.guilds.cache.get(server_id);
        if (!guild) {
            return {
                status: false,
                message: `Guild with ID ${server_id} not found.`,
            };
        }

        const roles = guild.roles.cache;

        return { status: true, roles };
    } catch (error) {
        console.log(error.message);
        return { status: false, message: error.message };
    }
};

const GetBotInfo = async (bot_id) => {
    try {
        const Response = {};
        Response.node_id = Node_ID;
        if (!bot_id) return { status: false, message: "Bot iD is required" };
        const BotDat = await BotModel.findById(bot_id);
        if (!BotDat)
            return { status: false, message: `No Bot For This ID:${bot_id}` };
        const ClientData = await MyClient(BotDat.bot_token);
        if (!ClientData || !ClientData.client?.user) {
            Response.bot_name = BotDat.bot_name;
            Response.bot_id = `nodeCid-${bot_id}`;
            Response.bot_status = false;
            Response.status = true;
            Response.uptime = CalculateUpTime(0)
            return Response;
        } else {
            Response.bot_name = ClientData.client.user.username;
            Response.bot_id = ClientData.client.user.id;
            Response.uptime = CalculateUpTime(ClientData.client.uptime)
            Response.bot_avatar = ClientData.client.user.displayAvatarURL({
                dynamic: true,
                size: 512
            });

            (Response.bot_status = true), (Response.status = true);
            return Response;
        }
    } catch (error) {
        console.log(error.message);
        return { status: false, message: error.message };
    }
};

//calculate a Bot UpTime
const CalculateUpTime = (uptimeMilliseconds) => {
    let seconds, minutes, hours, days = 0
    seconds = Math.floor(uptimeMilliseconds / 1000) % 60;
    minutes = Math.floor(uptimeMilliseconds / (1000 * 60)) % 60;
    hours = Math.floor(uptimeMilliseconds / (1000 * 60 * 60)) % 24;
    days = Math.floor(uptimeMilliseconds / (1000 * 60 * 60 * 24))
    return `Days: ${days}. Hours: ${hours}. Minutes: ${minutes}. Seconds: ${seconds}.`
}

module.exports = {
    SaveBot,
    GetOneBot,
    Mybots,
    UpdateBot,
    DeleteBot,
    GetChannels,
    GetMyRoles,
    GetBotInfo,
};
