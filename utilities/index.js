const BotModel = require('../mongodb/model/bot')
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

module.exports = { CheckCap }