const express = require('express')
const route = express.Router()
const { SaveBot, GetOneBot, Mybots } = require('../utilities/bot')

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

route.get('/bot/:id', async (req,res) => {
    const { id } = req.params;
    try {
        const response = await GetOneBot(id)
        res.status(200).json(response)
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ status:false, message:'Oops Server Error'})
    }
})

route.get('/mybots/:uid', async (req,res) => {
    const { uid } = req.params
    try {
        const response = await Mybots(uid)
        res.status(200).json(response)
    } catch (error) {
        console.log(error)
        res.status(400).json({ status:false, message:"Oops Server Error"})
    }
})

module.exports = route;