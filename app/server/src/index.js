import express from 'express'
import cors from 'cors'
import http from 'http'
import bodyParser from 'body-parser'
import {Server as SocketIo} from 'socket.io'
import iotRoutes from './routes/iot.routes.js'
import companyRoutes from './routes/company.routes.js'

const app = express();
const server = http.createServer(app);

export const io = new SocketIo(server ,{
  cors:{
    origin:"*",
    methods: ["GET", "POST"]
  }
})

app.use(
    cors({
      origin:"*" ,
      credentials: true,
    }),
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

app.use('/api/v1/iot' , iotRoutes);
app.use('/api/v1/company' , companyRoutes);

app.get('/ping' , (req , res)=>{
  res.send('PONG');
})

server.listen(process.env.PORT||3000 , ()=>{
    console.log(`express server running on port ${process.env.PORT}`);
})


