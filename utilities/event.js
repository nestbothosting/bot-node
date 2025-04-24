const { MyClient } = require("../bot/bot");
const TicketModel = require('../mongodb/model/ticket')
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');


const SendTicket = async (ticketdata, fieldvalue, permission, bot_token) => {
    try {
        const Embed = {};

        const Client = await MyClient(bot_token);
        if (!Client.status) return Client;

        const client = Client.client;

        if (ticketdata.title) Embed.title = ticketdata.title;
        if (ticketdata.title_url) Embed.url = ticketdata.title_url;
        if (ticketdata.description) Embed.description = ticketdata.description;
        if (ticketdata.color) {
            const color = parseInt(ticketdata.color.replace('#', ''), 16);
            Embed.color = color;
        }

        if (ticketdata.auth_name || ticketdata.auth_icon || ticketdata.auth_url) {
            Embed.author = {};
            if (ticketdata.auth_name) Embed.author.name = ticketdata.auth_name;
            if (ticketdata.auth_icon) Embed.author.icon_url = ticketdata.auth_icon;
            if (ticketdata.auth_url) Embed.author.url = ticketdata.auth_url;
        }

        if (ticketdata.img_url) Embed.image = { url: ticketdata.img_url };

        if (ticketdata.footer_txt || ticketdata.footer_icon) {
            Embed.footer = {};
            if (ticketdata.footer_txt) Embed.footer.text = ticketdata.footer_txt;
            if (ticketdata.footer_icon) Embed.footer.icon_url = ticketdata.footer_icon;
        }

        if (fieldvalue) {
            Embed.fields = fieldvalue;
        }

        const expanel = await TicketModel.findOne({ server_id: ticketdata.server_id })

        if(expanel){
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

        return { status: true, message: "Ticket sent successfully." };

    } catch (error) {
        console.error("SendTicket Error:", error.message);
        return { status: false, message: error.message };
    }
};

module.exports = { SendTicket };
