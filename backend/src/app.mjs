import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js";
import { app } from "./config/socket.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { corsOptions } from "./config/corsOptions.js";

dotenv.config();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(corsOptions);

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);


app.use(errorHandler)
export default app;