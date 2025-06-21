const YNSModel = require('../mongodb/model/yns');
const Youtube = require('simple-youtube-api')
const { MyClient } = require('../bot/bot')

const youtube_api = new Youtube(process.env.YOUTUBE_API_KEY)
let Running_YNS = {}

async function SaveYTS(req) {
    try {
        if (!req || !req.data || !req.token) {
            return { status: false, message: "Invalid request data" };
        }
        const {
            title,
            server_id,
            channel_id,
            role_id,
            yt_channel_id,
            etitle,
            edescription,
            ethumbnail
        } = req.data;

        const exData = await YNSModel.findOne({ server_id: server_id })
        if (exData) return { status: false, message: "Server ID already exists" };
        const channel = await youtube_api.getChannelByID(yt_channel_id)
        if (!channel) return { status: false, message: `Channel with ID ${yt_channel_id} not found` }

        const newEntry = new YNSModel({
            server_id: server_id,
            channel_id: channel_id,
            title: title,
            role_id: role_id,
            yt_channel_id: yt_channel_id,
            bot_token: req.token,
            embed: {
                title: etitle,
                description: edescription,
                thumbnail_url: ethumbnail
            }
        });

        await newEntry.save();
        return { status: true, message: "Data saved successfully" };
    } catch (error) {
        console.error(error.message);
        return { status: false, message: 'YNS Error Oops!' };
    }
}

async function YNS_Data(server_id, bot_token) {
    try {
        if (!server_id && !bot_token) return { status: false, message: "Server Id And Bot Token is required" }
        const Data = await YNSModel.findOne({ server_id })
        if (!Data) return { status: false, message: "No YNS Data!" }
        if (Data.bot_token !== bot_token) return { status: false, message: "No YNS Data!!" }
        const yt_channel = await youtube_api.getChannelByID(Data.yt_channel_id)
        if (!yt_channel) return { status: false, message: "YT Channel not found" }
        const returnData = {
            status: true,
            message: '',
            channel_name: yt_channel.title, //yt channel name
            channel_icon: yt_channel.thumbnails.medium.url, // yt channel icon url
            channel_id: Data.channel_id, // dc channel id 
            server_id: Data.server_id //dc server id
        }
        if (Running_YNS[Data.server_id]) {
            returnData.running = true
        } else {
            returnData.running = false;
        }
        return returnData;
    } catch (error) {
        console.log(error.message)
        return { status: false, message: "YNS DATA Error Oops" }
    }
}

async function Start_Listening(server_id, bot_token) {
    try {
        if (!server_id || !bot_token) {
            return { status: false, message: "No Server ID or Bot Token" };
        }

        const Channel_Data = await YNSModel.findOne({ server_id: server_id });
        if (!Channel_Data) {
            return { status: false, message: `No YT Channel Added For This Server ID ${server_id}` };
        }

        // Get latest video and store the ID
        const videos = await youtube_api.searchVideos('', 1, {
            channelId: Channel_Data.yt_channel_id,
            order: 'date'
        });

        const video = videos[0];
        if (video?.id) {
            Channel_Data.last_video_id = video.id;
            await Channel_Data.save();
        }

        // Store interval reference (optional improvement: store by server_id to clear later)
        const Loop = setInterval(async () => {
            try {
                const channelD = await YNSModel.findOne({ server_id });

                const latest = await youtube_api.searchVideos('', 1, {
                    channelId: channelD.yt_channel_id,
                    order: 'date'
                });

                const svideo = latest[0];

                if (!svideo || !svideo.id) return;

                if (svideo.id !== channelD.last_video_id) {
                    channelD.last_video_id = svideo.id;
                    await channelD.save();
                    // console.log(svideo)
                    // console.log(`📢 New video from ${channelD.yt_channel_id}: ${svideo.title}`);
                    SendEmbedYNS(channelD, svideo)
                    // 🔔 Call your sendDiscordNotification(svideo, channelD.server_id) here
                }
            } catch (loopErr) {
                console.error(`Loop Error for server ${server_id}:`, loopErr.message);
            }
        }, 10 * 1000); // 60 seconds

        if (Running_YNS[server_id]) {
            clearInterval(Running_YNS[server_id])
            delete Running_YNS[server_id];
        }
        Running_YNS[server_id] = Loop
        return { status: true, message: "Start to Listen" }
    } catch (error) {
        console.error(`Start_Listening Error for server ${server_id}:`, error);
        return { status: false, message: "Start_Listening Error" }
    }
}

function Stop_Listening(server_id) {
    if (!server_id) return { status: false, message: "Server ID required" }
    clearInterval(Running_YNS[server_id])
    delete Running_YNS[server_id];
    return { status: true, message: `Clear Listening. Server ID:${server_id}` }
}

async function DeleteYNS(server_id) {
    try {
        if (!server_id) return { status: false, message: "Server ID required" }
        await YNSModel.findOneAndDelete({ server_id: server_id })
        return { status: true, message: "successfully deleted" }
    } catch (error) {
        console.log(error.message)
        return { status: false, message: error.message }
    }
}

async function SendEmbedYNS(ChannelData, video) {
    try {
        console.log(ChannelData)
        console.log(video)
        if (!ChannelData.bot_token) return;

        const client = await MyClient(ChannelData.bot_token);
        if (!client.status) return client;

        const guild = client.client.guilds.cache.get(ChannelData.server_id);
        if (!guild) return console.error("Guild not found");

        // const channel = guild.channels.cache.get(ChannelData.channel_id);
        // if (!channel) return console.error("Channel not found");

        const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
        const replacements = {
            "{channel}": video.raw.snippet.channelTitle,
            "{role}": `<@&${ChannelData.role_id}>`,
            "{title}": video.title,
            "{link}": videoUrl
        };

        // Helper function to replace placeholders
        const replacePlaceholders = (template) => {
            return Object.entries(replacements).reduce((acc, [key, val]) => {
                return acc.replace(new RegExp(key, 'g'), val);
            }, template);
        };

        const Embed = {
            title: ChannelData.embed.title
                ? replacePlaceholders(ChannelData.embed.title)
                : `${video.raw.snippet.channelTitle} just uploaded ${video.title} at ${videoUrl}`,

            description: ChannelData.embed.description
                ? replacePlaceholders(ChannelData.embed.description)
                : `${video.raw.snippet.channelTitle} published a video on YouTube!`,

            color: 0xff0000,
            footer: {
                text: `Uploaded by ${video.raw.snippet.channelTitle}`
            },
            thumbnail: {
                url: ChannelData.embed.thumbnail_url || undefined
            },
            image: {
                url: video.thumbnails?.medium?.url || video.thumbnails?.default?.url
            }
        };

        console.log(Embed);

        // Uncomment to send
        // await channel.send({
        //     content: replacePlaceholders(ChannelData.title || ''),
        //     embeds: [Embed]
        // });

    } catch (error) {
        console.error("Failed to send embed:", error);
    }
}

module.exports = { SaveYTS, YNS_Data, Start_Listening, Stop_Listening, DeleteYNS }