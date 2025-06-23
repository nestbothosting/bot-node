const TimedMessageModel = require('../mongodb/model/timedmessage')
const BotModel = require('../mongodb/model/bot');
const { MyClient } = require('../bot/bot');

const MessageLoop = {}

const SetMessage = async (tday, thours, tminutes, server_id, channel_id, messages, bot_id) => {
    try {
        let LoopTime = 0;
        const OneDay = 24 * 60 * 60 * 1000;
        const OneHour = 60 * 60 * 1000;
        const OneMinute = 60 * 1000;

        // Input validations
        if (tday < 0) return { status: false, message: `Enter valid Number for Days: ${tday}` };
        if (thours < 0) return { status: false, message: `Enter valid Number for Hours: ${thours}` };
        if (tminutes < 0) return { status: false, message: `Enter valid Number for Minutes: ${tminutes}` };
        if (!messages) return { status: false, message: "Enter Loop Message!" };
        if (!channel_id) return { status: false, message: "Select a DC Channel" };
        if (!bot_id) return { status: false, message: "Bot ID is required" };

        // Calculate loop time
        if (tday > 0) {
            if (tday > 30) return { status: false, message: "Enter less than 30 Days" };
            LoopTime += OneDay * tday;
        }
        if (thours > 0) {
            if (thours > 24) return { status: false, message: "Enter less than 24 Hours" };
            LoopTime += OneHour * thours;
        }
        if (tminutes > 0) {
            if (tminutes > 60) return { status: false, message: "Enter less than 60 Minutes" };
            LoopTime += OneMinute * tminutes;
        }

        // Check existing messages (max 2 allowed)
        const existingMessages = await TimedMessageModel.find({ server_id });
        if (existingMessages.length >= 2) {
            return { status: false, message: "You can only have 2 timed messages per server" };
        }

        // Save new timed message
        const NewData = new TimedMessageModel({
            channel_id,
            looptime: LoopTime,
            message: messages,
            server_id,
            bot_id
        });

        await NewData.save();
        return { status: true, message: "Timed message successfully Create!" };

    } catch (error) {
        console.log(error.message);
        return { status: false, message: error.message };
    }
};

function convertMilliseconds(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;
    const remainingHours = hours % 24;

    return {
        days,
        hours: remainingHours,
        minutes: remainingMinutes,
        seconds: remainingSeconds
    };
}

const GetMessages = async (server_id) => {
    try {
        const TMSDATA = [];
        if (!server_id) return { status: false, message: "Server ID is required" };

        const TMS = await TimedMessageModel.find({ server_id });
        const response = {};

        if (TMS.length === 0) {
            response.isTMS = false;
        } else {
            response.isTMS = true;

            TMS.forEach(msg => {
                const convertedTime = convertMilliseconds(msg.looptime);
                const msgObj = msg.toObject?.() || msg; // In case it's a Mongoose document
                msgObj.looptime = convertedTime;
                if (MessageLoop[msg._id]) {
                    msgObj.running = true
                } else[
                    msgObj.running = false
                ]
                TMSDATA.push(msgObj);
            });

            response.TMS = TMSDATA;
        }

        response.status = true;
        response.message = '';
        return response;
    } catch (error) {
        console.log(error.message);
        return { status: false, message: error.message };
    }
};

const StartMessage = async (c_id) => {
    try {
        if (!c_id) return { status: false, message: "Collection ID is required" };

        const MessageData = await TimedMessageModel.findById(c_id);
        if (!MessageData) return { status: false, message: "Message data not found" };

        const BotData = await BotModel.findById(MessageData.bot_id);
        if (!BotData) return { status: false, message: "Bot data not found" };

        const ClientData = await MyClient(BotData.bot_token);
        if (!ClientData || !ClientData.status) return { status: false, message: "Failed to connect bot client" };

        const channel = await ClientData.client.channels.fetch(MessageData.channel_id);
        if (!channel) return { status: false, message: "Channel not found" };

        const Loop = setInterval(async () => {
            try {
                await channel.send(MessageData.message);
            } catch (sendError) {
                console.error("Error sending message:", sendError.message);
            }
        }, MessageData.looptime);

        MessageLoop[MessageData._id] = Loop;

        return { status: true, message: "Message loop started successfully" };
    } catch (error) {
        console.error("StartMessage Error:", error.message);
        return { status: false, message: error.message };
    }
};

const StopMessage = async (c_id) => {
    if (!c_id) return { status: false, message: "Collection ID is required" };
    if (MessageLoop[c_id]) {
        clearInterval(MessageLoop[c_id])
        delete MessageLoop[c_id];
        return { status: true, message: "Clear The Loop!" }
    }
    return { status: false, message: "Failed The Event" }
}

const DeleteMessage = async (c_id) => {
    try {
        if (!c_id) return { status: false, message: "Collection ID is required" };
        if (MessageLoop[c_id]) {
            clearInterval(MessageLoop[c_id])
            delete MessageLoop[c_id];
        }
        await TimedMessageModel.findByIdAndDelete(c_id)
        return { status: true, message: "Message Loop Collection Deleted Successfully" }
    } catch (error) {
        console.log(error.message)
        return { status: false, message: error.message }
    }
}

module.exports = { SetMessage, GetMessages, StartMessage, StopMessage, DeleteMessage }