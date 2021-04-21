const express = require('express');
const morgan = require('morgan');
const http = require('http');

const app = express();
const server = http.createServer(app);


const io = require('socket.io')(server);
require('./socket')(io);

app.set('view engine', 'ejs');

app.use(express.json());
app.use(morgan('dev'));

app.use('/', (req, res, next)=>{
    res.render('index');
});

app.use((req, res, next)=>{
    res.json({
        message: "not found"
    })
});

app.use((err, req, res, next)=>{
    console.log(err);
});

const PORT = 3000;
server.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
});