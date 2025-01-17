import {io} from '../index.js'

let socketMap = [];

io.on('connection' , (socket)=>{
    console.log(`connected with the ${socket.id}`);
    //socket events, likely not many
    // socket.on('event-name' , ()=>{
    // });
    
})

export async function BroadcastData({strollerId , data}) {
    //emit the data to the clients side UI. Needs more checks and handling here.
    io.to(socketMap[strollerId]).emit('data' , data);
    //hanldes any kind of email notifications and in app notification
}