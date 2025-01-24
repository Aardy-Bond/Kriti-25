import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIo } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import iotRoutes from "./routes/iot.routes.js";
import companyRoutes from "./routes/company.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

export const io = new SocketIo(server, {
  cors: {
    origin: "*", // Update to specific domain in production
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: "*", // Update to specific domain in production
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/iot", iotRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Ping endpoint
app.get("/ping", (req, res) => {
  res.send("PONG");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Connect to DB and start the server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("MONGO db connection failed!!!", err);
  }
};

startServer();
