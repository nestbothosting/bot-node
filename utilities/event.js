const { MyClient } = require("../bot/bot");
const TicketModel = require('../mongodb/model/ticket')
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { SaveBotLog } = require("../sp_event/botlog");

const checkOrCreateURL = (url) => {
    return url;
}

const SendTicket = async (ticketdata, fieldvalue, permission, bot_token) => {
    try {
        const Embed = {};

        const Client = await MyClient(bot_token);
        if (!Client.status) return Client;

        const client = Client.client;

        if (ticketdata.title) Embed.title = ticketdata.title;
        if (ticketdata.title_url) {
            const url = await checkOrCreateURL(ticketdata.title_url)
            Embed.url = url;
        }
        if (ticketdata.description) Embed.description = ticketdata.description;
        if (ticketdata.color) {
            const color = parseInt(ticketdata.color.replace('#', ''), 16);
            Embed.color = color;
        }

        if (ticketdata.auth_name || ticketdata.auth_icon || ticketdata.auth_url) {
            Embed.author = {};
            if (ticketdata.auth_name) Embed.author.name = ticketdata.auth_name;
            if (ticketdata.auth_icon) {
                const url = await checkOrCreateURL(ticketdata.auth_icon)
                Embed.author.icon_url = url

            };
            if (ticketdata.auth_url) {
                const url = await checkOrCreateURL(ticketdata.auth_url)
                Embed.author.url = url
            };
        }

        if (ticketdata.img_url) {
            const url = await checkOrCreateURL(ticketdata.img_url)
            Embed.image = { url: url }
        };

        if (ticketdata.footer_txt || ticketdata.footer_icon) {
            Embed.footer = {};
            if (ticketdata.footer_txt) Embed.footer.text = ticketdata.footer_txt;
            if (ticketdata.footer_icon) {
                const url = await checkOrCreateURL(ticketdata.footer_icon)
                Embed.footer.icon_url = url
            };
        }

        if (fieldvalue) {
            Embed.fields = fieldvalue;
        }

        const expanel = await TicketModel.findOne({ server_id: ticketdata.server_id })

        if (expanel) {
            return { status: false, message: "Ticket panel already exists for this server." };
        }

        const NewTicket = new TicketModel({
            server_id: ticketdata.server_id,
            channel_id: ticketdata.channel_id,
            embed: Embed,
            permissions: permission
        });

        await NewTicket.save();

        const channel = client.channels.cache.get(ticketdata.channel_id);
        if (!channel) return { status: false, message: "Channel not found." };

        const embed = EmbedBuilder.from(Embed);

        const button = new ButtonBuilder()
            .setCustomId('ticket_create_btn')
            .setLabel('Create Ticket')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await channel.send({ embeds: [embed], components: [row] });
        SaveBotLog(null,`Create Ticket Page Server id: ${ticketdata.server_id}`,'TIcket System', bot_token)
        return { status: true, message: "Ticket sent successfully." };

    } catch (error) {
        console.error("SendTicket Error:", error.message);
        return { status: false, message: error.message };
    }
};

const SendEmbed = async (bot_token, fields, ticketdata) => {
    try {
        const Embed = {}

        const Client = await MyClient(bot_token)
        if(!Client.status) return Client
        const client = Client.client

        if (ticketdata.title) Embed.title = ticketdata.title;
        if (ticketdata.title_url) {
            const url = await checkOrCreateURL(ticketdata.title_url)
            Embed.url = url;
        }
        if (ticketdata.description) Embed.description = ticketdata.description;
        if (ticketdata.color) {
            const color = parseInt(ticketdata.color.replace('#', ''), 16);
            Embed.color = color;
        }

        if (ticketdata.auth_name || ticketdata.auth_icon || ticketdata.auth_url) {
            Embed.author = {};
            if (ticketdata.auth_name) Embed.author.name = ticketdata.auth_name;
            if (ticketdata.auth_icon) {
                const url = await checkOrCreateURL(ticketdata.auth_icon)
                Embed.author.icon_url = url

            };
            if (ticketdata.auth_url) {
                const url = await checkOrCreateURL(ticketdata.auth_url)
                Embed.author.url = url
            };
        }

        if (ticketdata.image_url) {
            const url = await checkOrCreateURL(ticketdata.image_url)
            Embed.image = { url: url }
        };

        if (ticketdata.footer_text || ticketdata.footer_icon) {
            Embed.footer = {};
            if (ticketdata.footer_text) Embed.footer.text = ticketdata.footer_text;
            if (ticketdata.footer_icon) {
                const url = await checkOrCreateURL(ticketdata.footer_icon)
                Embed.footer.icon_url = url
            };
        }

        if (fields) {
            Embed.fields = fields;
        }

        const channel = client.channels.cache.get(ticketdata.channel_id);
        if(!channel){
            return { status:false, message:`Channel with ID ${ticketdata.channel_id} not found.` }
        }

        await channel.send({ embeds: [Embed] });
        return { status:true, message:'Embed sent successfully.' }
    } catch (error) {
        console.log(error.message)
        return { status:false, message: error.message }
    }
}

const SayText = async (server_id, channel_id, message, token) => {
    try {
        if (!server_id || !channel_id || !message) {
            return { status: false, message: "Oops! Enter all fields" };
        }

        const client = await MyClient(token);
        if (!client.status) return client;

        // Fetch the guild (server)
        const guild = await client.client.guilds.fetch(server_id).catch(() => null);
        if (!guild) return { status: false, message: "Server not found or bot not in server" };

        // Fetch the channel
        const channel = await guild.channels.fetch(channel_id).catch(() => null);
        if (!channel || !channel.isTextBased()) {
            return { status: false, message: "Channel not found or is not a text channel" };
        }

        // Send the message
        await channel.send(message);

        return { status: true, message: "Message sent successfully" };
    } catch (error) {
        console.error("Error in SayText:", error);
        return { status: false, message: "An error occurred while sending the message" };
    }
};


module.exports = { SendTicket, SendEmbed, SayText };
