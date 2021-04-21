module.exports = (io) => {
    io.use((socket, next)=>{
        const token = socket.handshake.auth.token;
        if(token){
            console.log(token);
            next();
        }else{
            const err = new Error("not authorized");
            err.data = { content: "Please retry later" }; // additional details
            next(err);
        }
    })
    io.on('connection', (socket) => {
        
        console.log('a new connection');
        socket.on('ping', (data) => {
            console.log(data);
            socket.emit('pong', "test");
        });

        /**
         * data: {
         *  id,
         *  name,
         *  email,
         *  url
         * }
         */
        socket.on('authentication', (data)=>{
            console.log(data);
            socket.user = data;
        })


        /**
         * {
         *  roomname,
         *  password,
         *  owner: id
         * }
         */
        socket.on('create_room', (data)=>{
            console.log(socket.user);
        })
    });
}