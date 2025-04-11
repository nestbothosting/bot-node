const mongoose = require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.MONGODB)
.then(() => console.log('Connected! DB'))
.catch(err => console.log(err))