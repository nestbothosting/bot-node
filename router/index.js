const express = require('express')
const route = express.Router()
const { Node_ID } = require('../core/auth.json')
const { CheckCap, InTicket, DeleteTicketPanel, CreateWelcomeMessage, CreateLeaveMessage, DeleteWLMessage, GetWelcomeLeaveMessageData } = require('../utilities/index')
const { SaveYTS, YNS_Data, Start_Listening, Stop_Listening, DeleteYNS } = require('../sp_event/yts')

route.get('/node_status', (req,res) => {
    res.status(200).json({ status:true, node_id:Node_ID })
})

route.get('/max_cap', async (req,res) => {
    try {
        const response = await CheckCap()
        res.status(200).json(response)
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ status:false, message:"Server Error" })
    }
})

route.get('/inticket/:server_id', async (req,res) =>{
    const { server_id } = req.params
    const response = await InTicket(server_id)
    res.status(200).json(response)
})

route.get('/delete_ticket_panel/:server_id', async (req,res) => {
    const { server_id } = req.params;
    const response = await DeleteTicketPanel(server_id)
    res.status(200).json(response)
})

route.post('/yns', async (req,res) => {
    const response = await SaveYTS(req.body)
    res.status(200).json(response)
})

route.get('/yns_data/:server_id/:token', async (req,res) => {
    const { server_id, token } = req.params;
    const response = await YNS_Data(server_id,token)
    res.status(200).json(response)
})

route.post('/start_listen_yns', async (req,res) => {
    const { server_id, bot_token } = req.body
    const response = await Start_Listening(server_id, bot_token)
    res.status(200).json(response)
})

route.post('/stop_listen_yns', async (req,res) => {
    const { server_id } = req.body;
    const response = await Stop_Listening(server_id)
    res.status(200).json(response)
}) 

route.post('/delete_yns', async (req,res) => {
    const { server_id } = req.body;
    const response = await DeleteYNS(server_id)
    res.status(200).json(response)
})

route.post('/set_welcome_message', async (req,res) => {
    const { server_id, channel_id, message, bot_id } = req.body;
    const response = await CreateWelcomeMessage(server_id, channel_id, message, bot_id)
    res.status(200).json(response)
})

route.post('/set_leave_message', async (req,res) => {
    const { server_id, channel_id, message, bot_id } = req.body;
    const response = await CreateLeaveMessage(server_id, channel_id, message, bot_id)
    res.status(200).json(response)
})

route.post('/delete_wlms', async (req,res) => {
    const { server_id, type } = req.body;
    const response = await DeleteWLMessage(server_id, type)
    res.status(200).json(response)
})

route.get('/get_wlms/:server_id', async (req,res) => {
    const { server_id } = req.params;
    const response = await GetWelcomeLeaveMessageData(server_id)
    res.status(200).json(response)
})

module.exports = route;