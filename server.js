const express = require('express')
const app = express()
//server to use socket io
const server = require('http').Server(app)
//pass the server to socket io
const io = require('socket.io')(server)
const {
    v4: uuidV4
} = require('uuid')
const {
    disconnect
} = require('process')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})
app.get('/:room', (req, res) => {
    res.render('room', {
        roomId: req.params.room
    })
})

io.on('connection', socket => {
    //once a person join the room, this will be done
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)
        //disconnect user who close the tab
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})
server.listen(3000)