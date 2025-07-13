const express = require('express')
const route = express.Router()
const { GetBots } = require('../utilities/admin')

route.get('/bots/:page' , async (req,res) => {
    const { page } = req.params;
    const response = await GetBots(page)
    res.status(200).json(response)
})

module.exports = route;