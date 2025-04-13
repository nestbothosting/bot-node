const { Client, GatewayIntentBits, ActivityType } = require("discord.js");

let Bots = {}

const Start = async (bot_token, st_message) => {
    if (Bots[bot_token]) {
        return { status: false, message: "Bot Already Running!" }
    }
    try {
        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
        client.once('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);
            client.user.setPresence({
                status: 'online',
                activities: [{ name: `${st_message || "Online" }`, type: ActivityType.Watching }]
            });

        });

        client.on('messageCreate', message => {
            if (message.content === '!ping') {
                message.reply('Pong! 🏓');
            }
        });

        await client.login(bot_token);
        Bots[bot_token] = client

        return { status: true, message: `✅ Bot started successfully` }
    } catch (error) {
        return { status: false, message: error.message, token }
    }
}

const Status = (bot_token) => {
    if(Bots[bot_token]){
        return { status:true, message:'Online' }
    }
    return { status:false, message:'Offline' }
}

const Stop = (token) => {
    if(Bots[token]){
        Bots[token].destroy()
        delete Bots[token];  
        console.log(`bot Stoped!`)
        return { status: true, message: 'Bot Stoped successfully' }
    }
    return { status:false, message:"Bot not found or already stopped!" }
}

module.exports = { Start, Status, Stop }