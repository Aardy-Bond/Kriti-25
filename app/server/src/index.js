import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIo } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import companyRoutes from "./routes/company.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { RedisGet, RedisSet } from './config/redis.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

export const io = new SocketIo(server, {
  cors: {
    origin: "*", // Update to specific domain in production
    methods: ["GET", "POST"],
  },
});

let socketMap = {};

io.on('connection' , (socket)=>{
    console.log(`${socket.id} connected`);
    socket.on('subscribe' , async (iots)=>{
        if(iots) {
          iots.forEach(identifier => { //loop to handle all the identifiers
          socketMap[identifier] = socket.id
          });
        }
        let activities = await RedisGet({key:'activities'});
        io.to(socket.id).emit('activities' , activities);
    })

    socket.on('trade' , async (msg)=>{
        console.log('New Trade:',msg);
        io.emit('trade' , msg);
        let activities = await RedisGet({key:'activities'});
        activities = JSON.parse(activities);
        activities.push(msg);
        await RedisSet({key:'activities',value:JSON.stringify(activities)});
    })

    socket.on('disconnect', () => {
        Object.keys(socketMap).forEach(identifier => {
            if(socketMap[identifier] === socket.id){ 
              console.log(socket[identifier])
              delete socketMap[identifier];
            }
        });
    });
})

export async function BroadcastData(data) {
    if(!socketMap[data.identifier]) return;
    io.to(socketMap[data.identifier]).emit('data' , data);
}

// Middleware
app.use(
  cors({
    origin: "*", // Update to specific domain in production
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);


// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Connect to DB and start the server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(process.env.PORT || 3000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("MONGO db connection failed!!!", err);
  }
};

startServer();
