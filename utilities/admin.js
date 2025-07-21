const BotModel = require('../mongodb/model/bot')
const { MyClient } = require('../bot/bot')

const GetBots = async (page) => {
    try {
        const limit = 10;
        const Bots = [];

        const bots = await BotModel.find()
            .skip((page - 1) * limit)
            .limit(limit);

        for (const bot of bots) {
            const botobj = {}; 
            const client = await MyClient(bot.bot_token);

            if (!client.status) {
                botobj.avatar = '';
                botobj.bot_name = bot.bot_name;
                botobj.bot_id = bot._id;
                botobj.online = false;
                Bots.push(botobj);
                continue;
            }

            const avatar = client.client.user.displayAvatarURL();
            botobj.avatar = avatar;
            botobj.bot_name = client.client.user.username;
            botobj.bot_id = client.client.user.id;
            botobj.online = true;
            Bots.push(botobj);
        }

        return { status: true, bots: Bots };
    } catch (error) {
        console.log(error.message);
        return { status: false, message: error.message };
    }
};

const GetOnlineBots = async (page) => {
    try {
        const limit = 10;
        const Bots = [];

        const bots = await BotModel.find({ online:true })
            .skip((page - 1) * limit)
            .limit(limit);

        for (const bot of bots) {
            const botobj = {}; 
            const client = await MyClient(bot.bot_token);

            if (!client.status) {
                botobj.avatar = '';
                botobj.bot_name = bot.bot_name;
                botobj.bot_id = bot._id;
                botobj.c_status = false;
                Bots.push(botobj);
                continue;
            }

            const avatar = client.client.user.displayAvatarURL();
            botobj.avatar = avatar;
            botobj.bot_name = client.client.user.username;
            botobj.bot_id = client.client.user.id;
            botobj.c_status = true;
            Bots.push(botobj);
        }

        return { status: true, bots: Bots };
    } catch (error) {
        console.log(error.message);
        return { status: false, message: error.message };
    }
}

module.exports = { GetBots, GetOnlineBots };
