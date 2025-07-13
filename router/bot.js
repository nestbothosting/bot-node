const express = require('express')
const route = express.Router()
const { SaveBot, GetOneBot, Mybots, UpdateBot, DeleteBot, GetChannels, GetMyRoles, GetBotInfo } = require('../utilities/bot')
const { Start, Status, Stop, MyServers } = require('../bot/bot')
const BotModel = require('../mongodb/model/bot')
const { GetBotLog } = require('../sp_event/botlog')

route.post('/add_bot', async (req, res) => {
    try {
        const { bot_token, bot_name, owner_id } = req.body;
        const response = await SaveBot(bot_token, bot_name, owner_id)
        res.status(200).json(response)
    } catch (error) {
        console.log(error.message)
        return { status: false, message: 'Oops Server Message!' }
    }
})

route.get('/bot/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await GetOneBot(id)
        res.status(200).json(response)
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ status: false, message: 'Oops Server Error' })
    }
})

route.get('/mybots/:uid', async (req, res) => {
    const { uid } = req.params
    try {
        const response = await Mybots(uid)
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
        res.status(400).json({ status: false, message: "Oops Server Error" })
    }
})

route.post('/update', async (req, res) => {
    const { bot_id, bot_name, bot_token, st_message } = req.body;
    const response = await UpdateBot(bot_id, bot_name, bot_token, st_message)
    if (response.status) {
        return res.status(200).json(response)
    }
    res.status(400).json(response)
})

route.post('/start', async (req, res) => {
    try {
        const { bot_token } = req.body;
        const botdata = await BotModel.findOne({ bot_token:bot_token })
        const response = await Start(bot_token,botdata)
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
        return { status:false, message:error.message }
    }
})

route.get('/status/:token', async (req,res) => {
    const { token } = req.params;
    const response = await Status(token)
    res.status(200).json(response)
})

route.get('/stop/:token', async (req,res) => {
    const { token } = req.params;
    const response = await Stop(token)
    res.status(200).json(response)
})

route.post('/delete', async (req,res) => {
    const { bot_id } = req.body;
    const response = await DeleteBot(bot_id)
    res.status(200).json(response)
})

route.get('/servers/:token', async (req,res) =>{
    const { token } = req.params;
    const response = await MyServers(token)
    res.status(200).json(response)
})

route.post('/channels', async (req,res) => {
    const { server_id, bot_token } = req.body;
    const response = await GetChannels(server_id, bot_token)
    res.status(200).json(response)
})

route.post('/roles', async (req,res) => {
    const { server_id, bot_token } = req.body;
    const response = await GetMyRoles(server_id,bot_token)
    res.status(200).json(response)
})

route.get('/info/:bot_id', async (req,res) => {
    const { bot_id } = req.params;
    const response = await GetBotInfo(bot_id)
    res.status(200).json(response)
})

route.get('/log/:bot_cid', async (req,res) => {
    const { bot_cid } = req.params;
    const response = await GetBotLog(bot_cid)
    res.status(200).json(response)
})

module.exports = route;