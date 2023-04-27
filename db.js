const mongoose = require('mongoose');
require("dotenv").config();

const MONGODB_URL = process.env.MONGODB_URL; 

if(!MONGODB_URL){
    throw new Error("Please define the MONGODB_URL");
}
let cached = global.mongoose;

if(!cached){
    cached = global.mongoose = {ccn: null, promise: null}
}

const connectToMongo = async ()=>{
    if(cached.conn){
        return cached.conn;
    }

    if(!cached.promise){
        const opts = {
             bufferCommands: false
        };
        cached.promise = await mongoose.connect(MONGODB_URL, opts).then((mongoose)=>{
            return mongoose
        })
    }

    try{
        cached.conn = await cached.promise;
    }catch(e){
        cached.promise = null;
        throw e;
    }
    return cached.conn;
}

module.exports = connectToMongo;
