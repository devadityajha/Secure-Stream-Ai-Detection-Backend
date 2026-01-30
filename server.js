require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv")
const attemptconnection = require("../Backend/src/config/db");
const userRoutes = require("../Backend/src/route/user.route");
const recordingRoutes = require("./src/route/recordingRoutes")

const app = express();
app.use(express.json());
app.use(cors());


dotenv.config();




attemptconnection();


//web socket code starts from here
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

let users = [];

io.on("connection", (socket) => {
  console.log("🔌 Connection:", socket.id);

  // ✅ REGISTER USER WITH FULL DATA
  socket.on("register-user", (userData) => {
    console.log("📝 Register User:", userData);

    // userData = { userId: "Aditya (aditya@gmail.com)", name: "Aditya", email: "aditya@gmail.com", _id: "..." }

    // Remove duplicates
    users = users.filter(
      (u) => u.email !== userData.email && u.socketId !== socket.id
    );

    users.push({
      userId: userData.userId, // "Aditya (aditya@gmail.com)"
      name: userData.name, // "Aditya"
      email: userData.email, // "aditya@gmail.com"
      _id: userData._id, // MongoDB ID
      socketId: socket.id,
      type: "user",
      cameraActive: false,
    });

    console.log("👥 Total Users:", users.length);
    io.emit("users-updated", users);
  });

  // REGISTER ADMIN
  socket.on("register-admin", () => {
    console.log("👨‍💼 Admin Registered:", socket.id);
    socket.join("admin");

    users = users.filter((u) => u.type !== "admin");
    users.push({
      userId: "Admin",
      socketId: socket.id,
      type: "admin",
    });
    io.emit("users-updated", users);
  });

  // CAMERA PERMISSION
  socket.on("camera-permission-granted", () => {
    const user = users.find((u) => u.socketId === socket.id);
    if (user) {
      user.cameraActive = true;
      console.log("📹 Camera active:", user.name);
    }
  });

  // LOCATION
  socket.on("location-update", ({ userId, location }) => {
    io.emit("user-location-update", { userId, location });
  });

  // FACE STATUS
  socket.on("face-status", (data) => {
    io.emit("face-status", data);
  });

  // TAB SWITCH
  socket.on("tab-switch", (data) => {
    console.log("⚠️ Tab switch from:", data.userId);
    io.to("admin").emit("tab-switch", data);
  });

  // WINDOW SWITCH
  socket.on("window-switch", (data) => {
    console.log("⚠️ Window switch from:", data.userId);
    io.to("admin").emit("window-switch", data);
  });

  // SCREENSHOT
  socket.on("screenshot-taken", (data) => {
    console.log(`📸 Screenshot by ${data.userId}. Total: ${data.count}`);
    io.emit("screenshot-taken", data);
  });

  // OFFER
  socket.on("offer", ({ offer, from }) => {
    console.log("📨 Offer from:", from);
    const admin = users.find((u) => u.type === "admin");
    if (admin) {
      io.to(admin.socketId).emit("offer", { offer, from });
    }
  });

  // ANSWER
  socket.on("answer", ({ answer, to }) => {
    console.log("📨 Answer for:", to);
    const student = users.find((u) => u.userId === to);
    if (student) {
      io.to(student.socketId).emit("answer", { answer });
    }
  });

  // ICE CANDIDATE
  socket.on("ice-candidate", ({ candidate, to, from }) => {
    if (to === "admin") {
      const admin = users.find((u) => u.type === "admin");
      if (admin) {
        io.to(admin.socketId).emit("ice-candidate", { candidate, from });
      }
    } else {
      const student = users.find((u) => u.userId === to);
      if (student) {
        io.to(student.socketId).emit("ice-candidate", { candidate, from });
      }
    }
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log("❌ Disconnect:", socket.id);
    const user = users.find((u) => u.socketId === socket.id);
    if (user) console.log("🚪 Left:", user.name || user.userId);

    users = users.filter((u) => u.socketId !== socket.id);
    io.emit("users-updated", users);
  });
});




app.use("/api/user", userRoutes);
app.use('/api/recordings', recordingRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'API working!' });
});

const PORT = process.env.PORT || 5001
server.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
});
