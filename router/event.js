const express = require('express')
const route = express.Router()
const { SendTicket, SendEmbed } = require('../utilities/event')
const { Mcstatus } = require('../sp_event/mcstatus')

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

module.exports = route;