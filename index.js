const connectToMongo = require("./db");
const cors = require('cors');
require("dotenv").config();
const express = require("express");
const app = express();

const port = 5000;


app.use(express.json());
app.use(cors());

//Available Routes
app.use('/api/auth',require('./routes/auth'));
app.use('/api/notes',require('./routes/notes'));


if(process.env.NODE_ENV === 'production'){
    const path = require('path');

    app.get('/',(req,res)=>{
          app.use(express.static(path.resolve(__dirname,'build')))
          res.sendFile(path.resolve(__dirname,'build','index.html'))
    })
}

app.listen(port,()=>{
    console.log(`Listening at port ${port}`);
})
connectToMongo();