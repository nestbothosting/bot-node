const express = require('express')
const route = express.Router()
const { SaveBot } = require('../utilities/bot')

route.post('/add_bot', async (req,res) => {
    try {
        const { bot_token, bot_name, owner_id } = req.body;
        const response = await SaveBot( bot_token, bot_name, owner_id )
        res.status(200).json(response)
    } catch (error) {
        console.log(error.message)
        return { status:false, message:'Oops Server Message!' }
    }
})

module.exports = route;