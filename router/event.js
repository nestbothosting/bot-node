const express = require('express')
const route = express.Router()
const { SendTicket } = require('../utilities/event')

route.post('/ticket', async (req,res) => {
    const { ticketdata, fieldvalue, permission, bot_token } = req.body;
    const response = await SendTicket(ticketdata, fieldvalue, permission, bot_token)
    res.status(200).json(response)
})

module.exports = route;