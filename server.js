// const express = require("express");
// const http = require("http");
// const socketIo = require("socket.io");
// const cors = require("cors");

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//   },
// });

// let users = new Map(); // userId -> socketId
// let sockets = new Map(); // socketId -> user info
// let adminSocketId = null;

// io.on("connection", (socket) => {
//   console.log("New connection:", socket.id);

//   socket.on("register-user", (userId) => {
//     users.set(userId, socket.id);
//     sockets.set(socket.id, {
//       userId,
//       type: "user",
//       cameraActive: false,
//       socketId: socket.id,
//     });
//     console.log(`User registered: ${userId} with socket ${socket.id}`);

//     // Notify admin of new user
//     if (adminSocketId) {
//       io.to(adminSocketId).emit(
//         "users-updated",
//         Array.from(sockets.values()).filter((u) => u.type === "user")
//       );
//     }
//   });

//   socket.on("register-admin", () => {
//     adminSocketId = socket.id;
//     sockets.set(socket.id, { type: "admin", socketId: socket.id });
//     console.log(`Admin registered with socket ${socket.id}`);

//     // Send current users list to admin
//     const usersList = Array.from(sockets.values()).filter(
//       (u) => u.type === "user"
//     );
//     socket.emit("users-updated", usersList);
//   });

//   socket.on("request-camera-access", (targetUserId) => {
//     const targetSocketId = users.get(targetUserId);
//     console.log(
//       `Admin requesting camera from user ${targetUserId}, socket: ${targetSocketId}`
//     );

//     if (targetSocketId) {
//       io.to(targetSocketId).emit("camera-access-request", {
//         from: adminSocketId,
//       });
//     }
//   });

//   socket.on("camera-permission-granted", () => {
//     const userInfo = sockets.get(socket.id);
//     if (userInfo) {
//       userInfo.cameraActive = true;
//       sockets.set(socket.id, userInfo);
//       console.log(`Camera permission granted by ${userInfo.userId}`);

//       // Notify admin
//       if (adminSocketId) {
//         io.to(adminSocketId).emit(
//           "users-updated",
//           Array.from(sockets.values()).filter((u) => u.type === "user")
//         );
//       }
//     }
//   });

//   socket.on("offer", ({ offer, to }) => {
//     console.log(`Offer from ${socket.id} to ${to}`);

//     // If 'to' is 'admin', send to admin socket
//     if (to === "admin" && adminSocketId) {
//       io.to(adminSocketId).emit("offer", { offer, from: socket.id });
//       console.log(`Offer sent to admin: ${adminSocketId}`);
//     } else {
//       io.to(to).emit("offer", { offer, from: socket.id });
//     }
//   });

//   socket.on("answer", ({ answer, to }) => {
//     console.log(`Answer from ${socket.id} to ${to}`);
//     io.to(to).emit("answer", { answer, from: socket.id });
//   });

//   socket.on("ice-candidate", ({ candidate, to }) => {
//     // If 'to' is 'admin', send to admin socket
//     if (to === "admin" && adminSocketId) {
//       io.to(adminSocketId).emit("ice-candidate", {
//         candidate,
//         from: socket.id,
//       });
//     } else {
//       io.to(to).emit("ice-candidate", { candidate, from: socket.id });
//     }
//   });

//   socket.on("send-feedback", ({ userId, message }) => {
//     const targetSocketId = users.get(userId);
//     console.log(
//       `Sending feedback to user ${userId}, socket: ${targetSocketId}`
//     );

//     if (targetSocketId) {
//       io.to(targetSocketId).emit("receive-feedback", message);
//     }
//   });

//   // NEW: Handle location updates from user
//   socket.on("location-update", ({ userId, location }) => {
//     console.log(`Location update from ${userId}:`, location);

//     // Send location to admin
//     if (adminSocketId) {
//       io.to(adminSocketId).emit("user-location-update", { userId, location });
//     }
//   });

//   // 🔥 ADD THIS NEW HANDLER BELOW IT:
//   socket.on("face-status", (data) => {
//     console.log("📥 SERVER RECEIVED face-status:", data);

//     // Get userId from socket if not in data
//     const socketUserId = sockets.get(socket.id)?.userId;

//     if (!data.userId && socketUserId) {
//       data.userId = socketUserId;
//     }

//     if (!data.studentId && socketUserId) {
//       data.studentId = socketUserId;
//     }

//     console.log("📤 SERVER SENDING to admin:", data);

//     if (adminSocketId) {
//       io.to(adminSocketId).emit("face-status", data);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("Disconnected:", socket.id);

//     // Remove from maps
//     const userInfo = sockets.get(socket.id);
//     if (userInfo && userInfo.userId) {
//       users.delete(userInfo.userId);
//     }
//     sockets.delete(socket.id);

//     // If admin disconnects
//     if (socket.id === adminSocketId) {
//       adminSocketId = null;
//     }

//     // Notify admin of updated users
//     if (adminSocketId) {
//       io.to(adminSocketId).emit(
//         "users-updated",
//         Array.from(sockets.values()).filter((u) => u.type === "user")
//       );
//     }
//   });
// });

// server.listen(3001, () => {
//   console.log("Server running on port 3001");
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
  console.log("🔌 New connection:", socket.id);

  // REGISTER USER
  socket.on("register-user", (userId) => {
    console.log("📝 Registering user:", userId);

    // 🔥 REMOVE OLD USER WITH SAME ID
    users = users.filter((u) => u.userId !== userId);

    users.push({
      userId: userId,
      socketId: socket.id,
      type: "user",
      cameraActive: false,
    });

    console.log("👥 Active users:", users);
    io.emit("users-updated", users);
  });

  // REGISTER ADMIN
  socket.on("register-admin", () => {
    console.log("👨‍💼 Admin registered:", socket.id);

    // Remove if already exists
    users = users.filter((u) => u.socketId !== socket.id);

    users.push({
      userId: "admin",
      socketId: socket.id,
      type: "admin",
    });

    console.log("👥 Active users:", users);
    io.emit("users-updated", users);
  });

  // CAMERA PERMISSION
  socket.on("camera-permission-granted", () => {
    const user = users.find((u) => u.socketId === socket.id);
    if (user) {
      user.cameraActive = true;
      console.log("📹 Camera active for:", user.userId);
      io.emit("users-updated", users);
    }
  });

  // LOCATION UPDATE
  socket.on("location-update", ({ userId, location }) => {
    console.log("📍 Location from:", userId);
    io.emit("user-location-update", { userId, location });
  });

  // FACE STATUS
  socket.on("face-status", (data) => {
    console.log("👁️ Face status from:", data.userId, data);
    io.emit("face-status", data);
    // io.to("admins").emit("face-status", data);
  });

  // WEBRTC
  socket.on("offer", ({ offer, to }) => {
    const recipient = users.find((u) => u.type === "admin");
    if (recipient) {
      io.to(recipient.socketId).emit("offer", {
        offer,
        from: socket.id,
      });
    }
  });

  socket.on("answer", ({ answer, to }) => {
    io.to(to).emit("answer", { answer });
  });

  // socket.on("ice-candidate", ({ candidate, to }) => {
  //   if (to === "admin") {
  //     const admin = users.find((u) => u.type === "admin");
  //     if (admin) {
  //       io.to(admin.socketId).emit("ice-candidate", { candidate });
  //     }
  //   } else {
  //     io.to(to).emit("ice-candidate", { candidate });
  //   }
  // });
  socket.on("ice-candidate", ({ candidate, to }) => {
    console.log("🧊 ICE candidate from:", socket.id, "to:", to);

    if (to === "admin") {
      const admin = users.find((u) => u.type === "admin");
      if (admin) {
        io.to(admin.socketId).emit("ice-candidate", {
          candidate,
          from: socket.id, // 🔥 ADD FROM
        });
      }
    } else {
      io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    }
  });

  // FEEDBACK
  socket.on("send-feedback", ({ userId, message }) => {
    const user = users.find((u) => u.userId === userId);
    if (user) {
      io.to(user.socketId).emit("receive-feedback", message);
    }
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);

    const disconnectedUser = users.find((u) => u.socketId === socket.id);
    if (disconnectedUser) {
      console.log("🚪 User left:", disconnectedUser.userId);
    }

    users = users.filter((u) => u.socketId !== socket.id);
    console.log("👥 Remaining users:", users);
    io.emit("users-updated", users);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
