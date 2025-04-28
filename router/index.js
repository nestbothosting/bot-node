const express = require('express')
const route = express.Router()
const { Node_ID } = require('../core/auth.json')
const { CheckCap, InTicket, DeleteTicketPanel } = require('../utilities/index')

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

module.exports = route;