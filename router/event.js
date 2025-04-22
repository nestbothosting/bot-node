const express = require('express')
const route = express.Router()

route.post('/ticket', (req,res) => {
    const { ticketdata, fieldvalue, permission, bot_token } = req.body;
})

module.exports = route;