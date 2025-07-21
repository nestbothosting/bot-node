const express = require('express')
const route = express.Router()
const { GetBots, GetOnlineBots } = require('../utilities/admin')

route.get('/bots/:page' , async (req,res) => {
    const { page } = req.params;
    const response = await GetBots(page)
    res.status(200).json(response)
})

route.get('/onlinebots/:page', async (req,res) => {
    const { page } = req.params;
    const response = await GetOnlineBots(page)
    res.status(200).json(response)
})

module.exports = route;