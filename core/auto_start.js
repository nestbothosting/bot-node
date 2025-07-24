// start online bots bots automatically
const BotsModel = require('../mongodb/model/bot')
const { Start } = require('../bot/bot')


const s = async () => {
    const Bots = await BotsModel.find({ online:true })
    console.log(`${Bots.length}. Bots Starting!`)
    for(let x of Bots){
        if(x.online){
            Start(x.bot_token, x)
        }
    }
}

s()