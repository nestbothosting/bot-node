const express = require('express')
const route = express.Router()
const { SendTicket, SendEmbed } = require('../utilities/event')
const { Mcstatus } = require('../sp_event/mcstatus')
const { SetMessage, GetMessages, StartMessage, StopMessage, DeleteMessage } = require('../sp_event/timedmessage')

route.post('/ticket', async (req,res) => {
    const { ticketdata, fieldvalue, permission, bot_token } = req.body;
    const response = await SendTicket(ticketdata, fieldvalue, permission, bot_token)
    res.status(200).json(response)
})

route.post('/embed', async (req,res) => {
    const { bot_token, fields, embed } = req.body;
    const response = await SendEmbed(bot_token, fields, embed)
    res.status(200).json(response)
})

route.post('/mcstatus', async (req,res) => {
    const { bot_token, paneldata } = req.body;
    const response = await Mcstatus(bot_token, paneldata)
    res.status(200).json(response)

})

route.post('/timedmessage', async (req,res) => {
    const {tday, thours, tminutes, server_id, channel_id, messages, bot_id} = req.body;
    const response = await SetMessage(tday, thours, tminutes, server_id, channel_id, messages, bot_id)
    res.status(200).json(response)
})

route.get('/my_timedmessage/:server_id', async (req,res) => {
    const { server_id } = req.params;
    const response = await GetMessages(server_id)
    res.status(200).json(response)
})

route.get("/start_timedmessage/:c_id", async (req,res) => {
    const { c_id } = req.params;
    const response = await StartMessage(c_id)
    res.status(200).json(response)
})

route.get('/stop_timedmessage/:c_id', async (req,res) => {
    const { c_id } = req.params;
    const response = await StopMessage(c_id)
    res.status(200).json(response)
})

route.post('/delete_timedmessage', async (req,res) => {
    const { c_id } = req.body;
    const response = await DeleteMessage(c_id)
    res.status(200).json(response)
})

module.exports = route;