const BotModel = require('../mongodb/model/bot')
const TicketModel = require('../mongodb/model/ticket')
const WLMModel = require('../mongodb/model/wl_message')
const { SaveBotLog } = require('../sp_event/botlog')
require('dotenv').config()

const CheckCap = async () => {
    try {
        const bots = await BotModel.find()
        if (Number(process.env.Max_Cap) >= bots.length) {
            return { status: true, message: "Create New Bot!" }
        } else {
            return { status: false, message: "Node is Full!" }
        }
    } catch (error) {
        console.log(error)
        return { status: false, message: "Oops Server Error" }
    }
}

const InTicket = async (server_id) => {
    try {
        if (!server_id) return { status: false, message: "Server Id is required" }

        const Panel = await TicketModel.findOne({ server_id })
        if (!Panel) return { status: false, message: "Create New Panel Now" }

        return { status: true, ticketpanel: Panel }
    } catch (error) {
        console.log(error.message)
        return { status: false, message: error.message }
    }
}

const DeleteTicketPanel = async (server_id) => {
    try {
        if (!server_id) return { status: false, message: "Server Id is required" }
        await TicketModel.findOneAndDelete({ server_id })
        return { status: true, message: "successfully deleted the panel" }
    } catch (error) {
        console.log(error.message)
        return { status: false, message: error.message }
    }
}

const CreateWelcomeMessage = async (server_id, channel_id, message, bot_id, Embed) => {
    try {
        const EXData = await WLMModel.findOne({ server_id });
        if (EXData) {
            if (EXData.Iswelcome) return { status: false, message: "Welcome message already set for this server." }

            if (Embed) {
                if (!Embed.title) return { status: false, message: "Embed Title is Required" }
                EXData.Iswelcome = true;
                EXData.wl_channel_id = channel_id;
                EXData.wl_isEmbed = true;
                EXData.wl_embed = Embed;
                await EXData.save()
                SaveBotLog(bot_id, `Set Welcome Message. Server ID: ${server_id}`, "WelcomeMS")
                return { status: true, message: "Welcome message updated successfully." };
            } else {
                EXData.welcome_message = message;
                EXData.Iswelcome = true;
                EXData.wl_channel_id = channel_id;
                await EXData.save()
                SaveBotLog(bot_id, `Set Welcome Message. Server ID: ${server_id}`, "WelcomeMS")
                return { status: true, message: "Welcome message updated successfully." };
            }

        }

        if (Embed) {
            const NewData = new WLMModel({
                server_id,
                bot_id,
                wl_channel_id: channel_id,
                wl_embed: Embed,
                Iswelcome: true,
                wl_isEmbed: true
            });
            await NewData.save();
            return { status: true, message: "Welcome message created successfully." };
        } else {
            const NewData = new WLMModel({
                server_id,
                bot_id,
                wl_channel_id: channel_id,
                welcome_message: message,
                Iswelcome: true
            });
            await NewData.save();
            return { status: true, message: "Welcome message created successfully." };
        }
    } catch (error) {
        console.error("Error creating welcome message:", error);
        return { status: false, message: "An error occurred while creating the welcome message." };
    }
}

const CreateLeaveMessage = async (server_id, channel_id, message, bot_id) => {
    try {
        if (!server_id || !channel_id || !message || !bot_id) return { status: false, message: "Enter all Values. Server ID, Channel ID, Bot ID and Message" }
        const EXData = await WLMModel.findOne({ server_id });
        if (EXData) {
            if (EXData.isleave) return { status: false, message: "Leave message already set for this server." }
            EXData.leave_message = message;
            EXData.isleave = true;
            EXData.lv_channel_id = channel_id;
            await EXData.save()
            SaveBotLog(bot_id, `Set Leave Message. Server ID: ${server_id}`, "LeaveMS")
            return { status: true, message: "Leave message updated successfully." };
        }
        const NewData = new WLMModel({
            server_id,
            bot_id,
            lv_channel_id: channel_id,
            leave_message: message,
            isleave: true
        });
        await NewData.save();
        SaveBotLog(bot_id, `Set Leave Message. Server ID: ${server_id}`, "LeaveMS")
        return { status: true, message: "Leave message created successfully." };
    } catch (error) {
        console.error("Error creating Leave message:", error);
        return { status: false, message: "An error occurred while creating the Leave message." };
    }
}

const SendWelcomeMessage = async (member) => {
    try {
        const WelcomeData = await WLMModel.findOne({ server_id: member.guild.id, Iswelcome: true });
        if (!WelcomeData) return;

        const channel = member.guild.channels.cache.get(WelcomeData.wl_channel_id);
        if (!channel) return;

        if (WelcomeData.wl_isEmbed) {
            const EmbedModel = {
                title: WelcomeData.wl_embed.title?.replace(/{user}/g, `${member.username}`).replace(/{server}/g, member.guild.name),
                description: WelcomeData.wl_embed.description?.replace(/{user}/g, `<@${member.id}>`).replace(/{server}/g, member.guild.name),
                color: parseInt(WelcomeData.wl_embed.color.replace('#', ''), 16),
                author: {
                    name: WelcomeData.wl_embed.author_name,
                    icon_url: WelcomeData.wl_embed.author_icon,
                    url: WelcomeData.wl_embed.author_url
                },
                image: {
                    url: WelcomeData.wl_embed.image?.replace(/{user-avatar}/g, member.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 }))
                },
                thumbnail: {
                    url: WelcomeData.wl_embed.thumbnail?.replace(/{user-avatar}/g, member.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 }))
                },
                footer: {
                    text: WelcomeData.wl_embed.footer_title,
                    icon_url: WelcomeData.wl_embed.footer_icon
                },
                timestamp: new Date()
            };
            channel.send({ embeds: [EmbedModel] });
        }else if (WelcomeData.welcome_message) {
            const finalMessage = WelcomeData.welcome_message.replace(/{user}/g, `<@${member.id}>`).replace(/{server}/g, member.guild.name);
            channel.send(finalMessage);
        }
    } catch (error) {
        console.error("⚠️ Error handling welcome:", error);
    }
};


const SendLeaveMessage = async (member) => {
    try {
        const settings = await WLMModel.findOne({
            server_id: member.guild.id,
            isleave: true
        });

        if (!settings) return;

        const channel = member.guild.channels.cache.get(settings.lv_channel_id);
        if (!channel) return;

        const finalMessage = settings.leave_message
            .replace(/{user}/g, `<@${member.id}>`)
            .replace(/{server}/g, member.guild.name);

        channel.send(finalMessage);

    } catch (err) {
        console.error("Leave message error:", err);
    }
}

const DeleteWLMessage = async (server_id, type) => {
    try {
        if (!server_id || !type || !['welcome', 'leave'].includes(type)) {
            return { status: false, message: "server_id and valid type ('welcome' or 'leave') are required." };
        }

        const data = await WLMModel.findOne({ server_id });
        if (!data) {
            return { status: false, message: "No message configuration found for this server." };
        }

        if (type === "welcome") {
            data.Iswelcome = false;
            data.welcome_message = undefined;
            data.wl_channel_id = undefined;
            data.wl_isEmbed = false,
            data.wl_embed = undefined
        } else if (type === "leave") {
            data.isleave = false;
            data.leave_message = undefined;
            data.lv_channel_id = undefined;
            data.lv_isEmbed = false,
            data.lv_embed = undefined
        }

        await data.save();
        SaveBotLog(data.bot_id, `Delete ${type} Message System. Server ID: ${server_id}`, `${type}MS`)
        return { status: true, message: `${type} System message deleted successfully.` };

    } catch (error) {
        console.error("❌ Error in DeleteWLMessage:", error);
        return { status: false, message: "An error occurred while deleting the message." };
    }
};

const GetWelcomeLeaveMessageData = async (server_id) => {
    try {
        if (!server_id) {
            return { status: false, message: "Server ID is required.", data: null };
        }

        const data = await WLMModel.findOne({ server_id });

        if (!data) {
            return { status: false, message: "No data found for this server.", data: null };
        }

        return { status: true, message: "Data fetched successfully.", data };
    } catch (error) {
        console.error("❌ Error fetching server data:", error);
        return { status: false, message: "Internal server error", data: null };
    }
};


module.exports = { CheckCap, InTicket, DeleteTicketPanel, CreateWelcomeMessage, CreateLeaveMessage, SendWelcomeMessage, SendLeaveMessage, DeleteWLMessage, GetWelcomeLeaveMessageData }