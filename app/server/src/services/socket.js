import {io} from '../index.js'

let socketMap = [];

io.on('connection' , (socket)=>{
    console.log(`${socket.id} connected`);
    socket.on('subscribe' , (identifiers)=>{
        identifiers.forEach(identifier => {
            socketMap[identifier] = socket.id
        });
    })
})

export async function BroadcastData(data) {
    io.to(socketMap[data.identifier]).emit('data' , data.carbonCredits);
}