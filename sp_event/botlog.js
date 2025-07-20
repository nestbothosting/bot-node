const BotLogModel = require('../mongodb/model/botlog')
const BotModel = require('../mongodb/model/bot')

const SaveBotLog = async (bot_cid, message, action, token) => {
    try {
        let id
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        if (!bot_cid) {
            if (token) {
                const data = await GetDataUseToken(token);
                if (!data.status) return;
                id = data.cid;
            }
        } else {
            id = bot_cid;
        }

        if (!message, !action) return;

        let BotLog = await BotLogModel.findOne({ bot_cid: id });

        const logEntry = {
            date: formattedDate,
            message,
            action
        };

        if (!BotLog) {
            const NewLog = new BotLogModel({
                bot_cid,
                bot_log: [logEntry]
            });
            await NewLog.save();
            return; // ✅ Return here so it doesn’t continue below
        }

        // BotLog exists, so push and save
        BotLog.bot_log.push(logEntry);
        await BotLog.save();

    } catch (error) {
        console.log(`Bot Log Error. Bot CID: ${id ? id : 'null'}. Error: ${error}`);
    }
};

const GetDataUseToken = async (token) => {
    try {
        if (!token) return { status: false }
        const botData = await BotModel.findOne({ bot_token: token })
        return { status: true, cid: botData._id }
    } catch (error) {
        console.log(`Bot Log Saving Error (token). Error: ${error.message}`)
        return { status: false }
    }
}

const GetBotLog = async (bot_cid) => {
    try {
        const logs = await BotLogModel.findOne({ bot_cid }).lean();

        if (!logs || !logs.bot_log) {
            return { status: true, message: "", log: [] }
        }

        // Return the last 10 logs (sorted by latest if needed)
        const last10Logs = logs.bot_log.slice(-10).reverse(); // reverse to show newest first
        return { status: true, message: "", log: last10Logs }
    } catch (error) {
        console.error("Error getting bot logs:", error);
        return { status: false, message: error.message, log: [] }
    }
};

module.exports = { SaveBotLog, GetBotLog }