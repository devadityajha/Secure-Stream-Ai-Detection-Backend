// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: "*", methods: ["GET", "POST"] },
// });

// let users = [];

// io.on("connection", (socket) => {
//   console.log("🔌 New connection:", socket.id);

//   // REGISTER USER
//   socket.on("register-user", (userId) => {
//     console.log("📝 Registering user:", userId, "socket:", socket.id);

//     // Remove old user with same ID
//     users = users.filter((u) => u.userId !== userId);

//     users.push({
//       userId: userId,
//       socketId: socket.id,
//       type: "user",
//       cameraActive: false,
//     });

//     console.log("👥 Active users:", users.length);
//     io.emit("users-updated", users);
//   });

//   // REGISTER ADMIN
//   socket.on("register-admin", () => {
//     console.log("👨‍💼 Admin registered:", socket.id);
//     users = users.filter((u) => u.socketId !== socket.id);
//     users.push({
//       userId: "admin",
//       socketId: socket.id,
//       type: "admin",
//     });
//     io.emit("users-updated", users);
//   });

//   // CAMERA PERMISSION
//   socket.on("camera-permission-granted", () => {
//     const user = users.find((u) => u.socketId === socket.id);
//     if (user) {
//       user.cameraActive = true;
//       io.emit("users-updated", users);
//     }
//   });

//   // LOCATION UPDATE
//   socket.on("location-update", ({ userId, location }) => {
//     io.emit("user-location-update", { userId, location });
//   });

//   // FACE STATUS
//   socket.on("face-status", (data) => {
//     io.emit("face-status", data);
//   });

//   // WEBRTC - OFFER
//   socket.on("offer", ({ offer, to, from }) => {
//     console.log("📨 SERVER: Offer from:", from);
//     const recipient = users.find((u) => u.type === "admin");
//     if (recipient) {
//       console.log("✅ SERVER: Forwarding offer to admin from:", from);
//       io.to(recipient.socketId).emit("offer", { offer, from });
//     } else {
//       console.log("❌ SERVER: No admin found");
//     }
//   });

//   // WEBRTC - ANSWER
//   socket.on("answer", ({ answer, to }) => {
//     console.log("📨 SERVER: Answer for:", to);
//     const recipient = users.find((u) => u.userId === to);
//     if (recipient) {
//       console.log("✅ SERVER: Sending answer to:", to);
//       io.to(recipient.socketId).emit("answer", { answer });
//     } else {
//       console.log("❌ SERVER: Student not found:", to);
//     }
//   });

//   // WEBRTC - ICE CANDIDATES
//   socket.on("ice-candidate", ({ candidate, to, from }) => {
//     if (to === "admin") {
//       const admin = users.find((u) => u.type === "admin");
//       if (admin) {
//         io.to(admin.socketId).emit("ice-candidate", { candidate, from });
//       }
//     } else {
//       const recipient = users.find((u) => u.userId === to);
//       if (recipient) {
//         io.to(recipient.socketId).emit("ice-candidate", { candidate, from });
//       }
//     }
//   });

//   // DISCONNECT
//   socket.on("disconnect", () => {
//     console.log("❌ Disconnected:", socket.id);
//     const disconnectedUser = users.find((u) => u.socketId === socket.id);
//     if (disconnectedUser) {
//       console.log("🚪 User left:", disconnectedUser.userId);
//     }
//     users = users.filter((u) => u.socketId !== socket.id);
//     io.emit("users-updated", users);
//   });
// });

// const PORT = 3001;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

let users = [];

io.on("connection", (socket) => {
  console.log("🔌 Connection:", socket.id);

  // REGISTER USER
  socket.on("register-user", (userId) => {
    console.log("📝 Register:", userId);

    // Remove duplicates
    users = users.filter(
      (u) => u.userId !== userId && u.socketId !== socket.id
    );

    users.push({
      userId: userId,
      socketId: socket.id,
      type: "user",
      cameraActive: false,
    });

    console.log("👥 Users:", users.length);
    io.emit("users-updated", users);
  });

  // REGISTER ADMIN
  socket.on("register-admin", () => {
    console.log("👨‍💼 Admin:", socket.id);
    users = users.filter((u) => u.type !== "admin");
    users.push({
      userId: "admin",
      socketId: socket.id,
      type: "admin",
    });
    io.emit("users-updated", users);
  });

  // CAMERA PERMISSION - NO EMIT
  socket.on("camera-permission-granted", () => {
    const user = users.find((u) => u.socketId === socket.id);
    if (user) {
      user.cameraActive = true;
      console.log("📹 Camera active:", user.userId);
      // DON'T EMIT HERE!
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

  // OFFER
  socket.on("offer", ({ offer, from }) => {
    console.log("📨 Offer:", from);
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
    if (user) console.log("🚪 Left:", user.userId);

    users = users.filter((u) => u.socketId !== socket.id);
    io.emit("users-updated", users);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
});
