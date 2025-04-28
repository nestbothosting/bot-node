const BotModel = require('../mongodb/model/bot')
const TicketModel = require('../mongodb/model/ticket')
require('dotenv').config()

const CheckCap = async () => {
    try {
        const bots = await BotModel.find()
        if(Number(process.env.Max_Cap) >= bots.length){
            return { status:true , message:"Create New Bot!" }
        }else{
            return { status:false, message:"Node is Full!" }
        }
    } catch (error) {
        console.log(error)
        return { status:false, message:"Oops Server Error" }
    }
}

const InTicket = async (server_id) => {  
    try {
        if(!server_id) return { status:false, message:"Server Id is required" }

        const Panel = await TicketModel.findOne({ server_id })
        if(!Panel) return { status:false, message:"Create New Panel Now" }

        return { status:true, ticketpanel:Panel }
    } catch (error) {
        console.log(error.message)
        return { status:false, message: error.message}
    }
}

const DeleteTicketPanel = async (server_id) => {
    try {
        if(!server_id) return { status:false, message:"Server Id is required" }
        await TicketModel.findOneAndDelete({ server_id })
        return { status:true, message:"successfully deleted the panel" }
    } catch (error) {
        console.log(error.message)
        return { status:false, message: error.message }
    }
}

module.exports = { CheckCap, InTicket, DeleteTicketPanel }