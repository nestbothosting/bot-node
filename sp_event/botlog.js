const BotLogModel = require('../mongodb/model/botlog')

const SaveBotLog = async (bot_cid, message, action) => {
    try {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        if (!bot_cid || !message) return;

        let BotLog = await BotLogModel.findOne({ bot_cid });

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
        console.log(`Bot Log Error. Bot CID: ${bot_cid}. Error: ${error}`);
    }
};

const GetBotLog = async (bot_cid) => {
    try {
        const logs = await BotLogModel.findOne({ bot_cid }).lean();

        if (!logs || !logs.bot_log) {
            return { status:true, message:"", log:[] }
        }

        // Return the last 10 logs (sorted by latest if needed)
        const last10Logs = logs.bot_log.slice(-10).reverse(); // reverse to show newest first
        return { status:true, message:"", log:last10Logs }
    } catch (error) {
        console.error("Error getting bot logs:", error);
        return { status:false, message:error.message, log:[] }
    }
};

module.exports = { SaveBotLog, GetBotLog }