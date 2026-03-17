import "./app.mjs";

import { connectDB } from "./config/db.js";
import { server } from "./config/socket.js";

const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log("server is running at " + PORT);
    connectDB();
});