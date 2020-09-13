require('dotenv').config()
const keysMap = { w: 'ArrowUp', s: 'ArrowDown' }
const express = require('express');
const app = express()
const server = require('http').Server(app)
const socket = require('socket.io');
const io = socket(server);
const IP  = process.env.SERVER_IP || '127.0.0.1'
const PORT = process.env.SERVER_PORT || 3000

app.set('views', "./views");
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))
var rooms = {};
app.get("/", (req, res) => {
    res.render('index', { rooms: rooms });
})


//For any Room
app.get("/:room", (req, res) => {
    //if the room exists 
    if (rooms[req.params.room] != null) {
        //render it passing in the name of the room..
        res.render('game', { roomName: req.params.room ,IP:IP,PORT:PORT});
        console.log(`REquest to join room ${req.params.room}`);
    } else {
        //else redirect to the home page..
        res.redirect("/")
    }
})
//Request to create a new room..
app.post('/room', (req, res) => {
    //if the room already exists..
    if (rooms[req.body.room] != null) {
        //redirect to the homepage..
        res.redirect("/");
    } else {
        //else Create a new Room Object with no players inside..
        console.log(`Created room ${req.body.room}`);
        rooms[req.body.room] = {
            players: {},
            noOfPlayers: 0,
            scoreP1: 0,
            scoreP2: 0,
            player1Id: null
        }   // Eg. Say roomName is  "myRoom"  =>  rooms object(our DB) becomes  {myRoom:{players{}}}
        //And redirect the player to the room
        res.redirect(req.body.room)
        //send message that new room was created..
        io.emit("room-created", req.body.room);

    }

})

//We are listening on port 3000.
server.listen(3000);

//When a player connects..
io.on("connection", (socket) => {
    //Send a message that He/she joined Successfully
    // socket.emit("chat-message","You Joined!");
    socket.emit('welcome', "Player1")


    //Recieve the  name  of the player and the roomName
    socket.on('new-player', (room, name) => {
        //Add the player to the room..
        //If the room exists
        if (rooms[room] != null) {
            console.log(`Room ${room} Exists and has ${rooms[room].noOfPlayers} Players in it`);
            //if the room is not full..
            if (rooms[room].noOfPlayers < 2) {
                //join the player to the  room
                socket.join(room)
                //add player to rooms obj
                rooms[room].players[socket.id] = name;
                rooms[room].noOfPlayers++;
                console.log(`Existing Id ? ${rooms[room].player1Id}`);
                //If the player1 is not set.. set this player as player1
                if (rooms[room].player1Id == null) {
                    const player1Id = Math.random()
                    console.log(`Sent player1 Id : ${player1Id}`);
                    rooms[room].player1Id = player1Id
                    socket.emit('player1-Id', { id: player1Id })
                }
                console.log(`Existing Id After? ${rooms[room].player1Id}`);

                console.log(`Joined player ${socket.id} to room `);
                //if the room already has player1..

            }
            //check if the room is full and start the game if it is..
            if (rooms[room].noOfPlayers == 2) {
                STARTGAME(room);
                // io.to(room).emit("player2-connected", name);
            }
        }
    })

    

    //Key Pressed..
    socket.on('downK', data => {
        console.log(`Recieved Data from user ${socket.id} pressing ${data.key} in room ${data.roomName}`);
        console.log(`Broadcasting data`);
        socket.broadcast.to(data.roomName).emit('downK', { key: keysMap[data.key], roomName: data.roomName })

    })

    //Key Released..
    socket.on('upK', (data) => {
        console.log(`Recieved Data  from user ${socket.id} stopped pressing ${data.key} in room ${data.roomName}`)
        console.log(`Broadcasting data`);
        socket.broadcast.to(data.roomName).emit('upK', { key: keysMap[data.key], roomName: data.roomName })
        // socket.to(data.room).broadcast.emit('upK',{key:keysMap[data.key],roomName:data.roomName})
        // socket.to(data.room).broadcast.emit('welcome',"asds")
    })
    socket.on('updatePaddle', (data) => {
        console.log(`Recieved Data  from user ${socket.id} updatePaddle in room ${data.roomName}`)
        console.log(`Broadcasting data`);
        socket.broadcast.to(data.roomName).emit('updatePaddle', { y: data.y, roomName: data.roomName })
        // socket.to(data.room).broadcast.emit('upK',{key:keysMap[data.key],roomName:data.roomName})
        // socket.to(data.room).broadcast.emit('welcome',"asds")
    })

    socket.on('score',data=>{
        var roomObj = rooms[data.roomName]
        console.log(`Id : ${data.Id}`);
        if (roomObj.player1Id === data.Id){
            roomObj.scoreP1++;
            console.log(`Incremented Score of player1 : ${rooms[data.roomName].scoreP1}`);
        }else{
            console.log(`Incremented Score of player2 : ${rooms[data.roomName].scoreP2}`);
            roomObj.scoreP2++;
        }
        STARTGAME(data.roomName);
    })
    socket.on('which-player',(data)=>{
        console.log(`Which player`);
        console.log(data);
        const player =  (data.Id === null)? 1:2;
        socket.emit('which-player',{player:player})
        if (player===1){
            rooms[data.roomName].player1Id = null;
        }

    })

    socket.on('bounce',data=>{
        socket.broadcast.to(data.roomName).emit('bounce',data)
    })
    //When a player Leaves..
    socket.on('disconnect', () => {
        //get all the rooms the player(which is a socket object) is in ..
        getUserRooms(socket).forEach(room => {
            //Broadcast to that room that the player has disconnected..
            console.log("DIsconnected!");
            console.log(rooms[room].players[socket.id]);
            console.log(`player ${rooms[room].players[socket.id]}`);
            io.to(room).emit('player-disconnected', room);
            //delete the name of the player..
            delete rooms[room].players[socket.id]
            rooms[room].noOfPlayers--;
            //Clean the room if no players available..
            if (rooms[room].noOfPlayers===0){
                delete rooms[room]
            }
            //Note: We used socket.join(<roomName>) to associate a room with the player..
            //When the player disconnects, the room is automatically disassociated..

        });
    })
})

function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if (room.players[socket.id] != null) names.push(name)
        return names

    }, [])
}



function STARTGAME(room) {
    //Math.random() < 0.5 ? -0.4 : 0.4
    const vx = Math.random()<0.5 ? -0.2:0.2;
    const vy = Math.random()<0.5 ? -0.2:0.2;
    //Send the ball params..
    //Give the ball a random velocity 
    io.to(room).emit('ball', { posX:0.5,posY:0.5,velX: vx, velY: vy,player1Id:rooms[room].player1Id })
    //start the game after setting the score..
    io.to(room).emit('START', {p1:rooms[room].scoreP1,p2:rooms[room].scoreP2})


}