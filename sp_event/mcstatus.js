const { MyClient } = require('../bot/bot');
const util = require('minecraft-server-util');

let Interval = {}

const Mcstatus = async (bot_token, paneldata) => {
    try {
        if (Interval[paneldata.server_id]) {
            clearInterval(Interval[paneldata.server_id])
        }
        const Client = await MyClient(bot_token)
        if (!Client.status) return Client;
        const client = Client.client;

        const ServerData = await ServerStatus(paneldata.server_ip, paneldata.port)
        const MessageJson = EmbedJson(paneldata, ServerData)

        const channel = await client.channels.fetch(paneldata.channel_id);
        if (!channel) return { status: false, message: "Oops!. Channel not found" }

        const ReMessage = await channel.send({ embeds: [MessageJson] });

        const NewInterval = setInterval( async () => {
            const ServerData = await ServerStatus(paneldata.server_ip, paneldata.port)
            const MessageJson = EmbedJson(paneldata, ServerData)
            await ReMessage.edit({ embeds: [MessageJson] })
        }, 60000)

        Interval[paneldata.server_id] = NewInterval;
        return { status:true, message:"Successfully Send Panel" }
    } catch (error) {
        console.log(error.message)
        return { status:false, message: error.message }
    }
};

const EmbedJson = (paneldata, ServerData) => {
    const Embed = {}
    Embed.title = "Server Status"
    Embed.color = ServerData.status ? 0x45fc03 : "red"

    if (paneldata.title) {
        Embed.title = paneldata.title;
    }
    if (paneldata.description) {
        Embed.description = paneldata.description;
    }
    if (paneldata.thumbnail_url) {
        Embed.thumbnail = { url: paneldata.thumbnail_url }
    }

    const Fields = [
        {
            name: `Status`,
            value: ServerData.status ? `${paneldata.on_icon_id ? `<a:off:${paneldata.on_icon_id}> Online` : '🟢 Online'}` :
                `${paneldata.of_icon_id ? `<a:off:${paneldata.of_icon_id}> Offline` : '🟢 Offline'}`
        },
        {
            name: `Online Players`,
            value: ServerData.status ? `Players: ${ServerData.players}:${ServerData.max}` : '💀'
        },
        {
            name: 'Server IP',
            value: `IP: ${paneldata.server_ip}`,
        }
    ];

    Embed.fields = Fields;

    const now = new Date().toLocaleString();
    Embed.footer = {
        text: `Last updated ${now}`
    };
    return Embed
}

const ServerStatus = async (server_ip, port) => {
    try {
        let Port = port ? port : 25565;
        const response = await util.status(server_ip, Port)
        const Data = {
            status: true,
            players: response.players.online,
            max: response.players.max,
        }
        return Data;
    } catch (error) {
        console.log(error.message)
        return { status: false }
    }
}

module.exports = { Mcstatus };
