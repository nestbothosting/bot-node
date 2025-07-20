const AutoReplayModel = require('../mongodb/model/autoreplay');
const { SaveBotLog } = require('./botlog');

const SaveMessage = async (serverdata, messagekey, messageReplay, bot_token) => {
    // Validation
    if (!serverdata) return { status: false, message: "Server data is missing." };
    if (!serverdata.name || !serverdata.server_id) return { status: false, message: "Server name or ID is missing." };
    if (!messagekey) return { status: false, message: "Message key is required." };
    if (!messageReplay) return { status: false, message: "Message reply is required." };

    try {
        // Check for existing messages for the server
        const exMessages = await AutoReplayModel.find({ server_id: serverdata.server_id });

        // Limit of 4 messages per server
        if (exMessages.length >= 4) {
            return { status: false, message: "Auto replay limit (4 messages) reached for this server." };
        }

        // Save new auto-reply message
        const NewMessage = new AutoReplayModel({
            server_id: serverdata.server_id,
            server_name: serverdata.name,
            message_key: messagekey,
            message_value: messageReplay
        });

        await NewMessage.save();

        // Save to bot log
        SaveBotLog(null, `Created new auto-reply. Server: ${serverdata.name}`, 'Auto Replay', bot_token);

        return { status: true, message: "Auto replay message saved successfully." };

    } catch (error) {
        console.error(error);
        return { status: false, message: "Auto replay saving error!" };
    }
};

const CheckMessageARMS = async (server_id, message, repserver) => {
    if (!server_id || !message) return;

    try {
        const AutoMessData = await AutoReplayModel.find({ server_id })
        if (!AutoMessData || AutoMessData.length === 0) return;
        for (let data of AutoMessData) {
            if (message === data.message_key) {
                repserver.reply(`${data.message_value}`)
            }
        }
    } catch (error) {
        console.log(`Auto Replay Cheking Error, Error: ${error.message}`)
    }
}

const GetAllAutoRPCollections = async (server_id) => {
    if(!server_id) return { status:false, message:"Server id is required" }
    try {
        const ARMS = await AutoReplayModel.find({ server_id })
        return { status:true, autoreplays:ARMS }
    } catch (error) {
        console.log(error.message)
        return { status:false, message:error.message }
    }
}

const DeleteARMS = async (cid) => {
    if(!cid) return { status:false, message:'Collection id is required'}
    try {
        await AutoReplayModel.findByIdAndDelete(cid)
        return { status:true, message:"successfully Deleted Message" }
    } catch (error) {
        console.log(error.message)
        return { status:false, message:"Collection Deleting Error" }
    }
}

module.exports = { SaveMessage, CheckMessageARMS, GetAllAutoRPCollections, DeleteARMS };
