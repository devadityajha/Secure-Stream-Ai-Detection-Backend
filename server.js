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
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let users = new Map(); // userId -> socketId
let sockets = new Map(); // socketId -> user info
let adminSocketId = null;

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("register-user", (userId) => {
    users.set(userId, socket.id);
    sockets.set(socket.id, {
      userId,
      type: "user",
      cameraActive: false,
      socketId: socket.id,
    });
    console.log(`User registered: ${userId} with socket ${socket.id}`);

    // Notify admin of new user
    if (adminSocketId) {
      io.to(adminSocketId).emit(
        "users-updated",
        Array.from(sockets.values()).filter((u) => u.type === "user")
      );
    }
  });

  socket.on("register-admin", () => {
    adminSocketId = socket.id;
    sockets.set(socket.id, { type: "admin", socketId: socket.id });
    console.log(`Admin registered with socket ${socket.id}`);

    // Send current users list to admin
    const usersList = Array.from(sockets.values()).filter(
      (u) => u.type === "user"
    );
    socket.emit("users-updated", usersList);
  });

  socket.on("request-camera-access", (targetUserId) => {
    const targetSocketId = users.get(targetUserId);
    console.log(
      `Admin requesting camera from user ${targetUserId}, socket: ${targetSocketId}`
    );

    if (targetSocketId) {
      io.to(targetSocketId).emit("camera-access-request", {
        from: adminSocketId,
      });
    }
  });

  socket.on("camera-permission-granted", () => {
    const userInfo = sockets.get(socket.id);
    if (userInfo) {
      userInfo.cameraActive = true;
      sockets.set(socket.id, userInfo);
      console.log(`Camera permission granted by ${userInfo.userId}`);

      // Notify admin
      if (adminSocketId) {
        io.to(adminSocketId).emit(
          "users-updated",
          Array.from(sockets.values()).filter((u) => u.type === "user")
        );
      }
    }
  });

  socket.on("offer", ({ offer, to }) => {
    console.log(`Offer from ${socket.id} to ${to}`);

    // If 'to' is 'admin', send to admin socket
    if (to === "admin" && adminSocketId) {
      io.to(adminSocketId).emit("offer", { offer, from: socket.id });
      console.log(`Offer sent to admin: ${adminSocketId}`);
    } else {
      io.to(to).emit("offer", { offer, from: socket.id });
    }
  });

  socket.on("answer", ({ answer, to }) => {
    console.log(`Answer from ${socket.id} to ${to}`);
    io.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    // If 'to' is 'admin', send to admin socket
    if (to === "admin" && adminSocketId) {
      io.to(adminSocketId).emit("ice-candidate", {
        candidate,
        from: socket.id,
      });
    } else {
      io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    }
  });

  socket.on("send-feedback", ({ userId, message }) => {
    const targetSocketId = users.get(userId);
    console.log(
      `Sending feedback to user ${userId}, socket: ${targetSocketId}`
    );

    if (targetSocketId) {
      io.to(targetSocketId).emit("receive-feedback", message);
    }
  });

  // NEW: Handle location updates from user
  socket.on("location-update", ({ userId, location }) => {
    console.log(`Location update from ${userId}:`, location);

    // Send location to admin
    if (adminSocketId) {
      io.to(adminSocketId).emit("user-location-update", { userId, location });
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    // Remove from maps
    const userInfo = sockets.get(socket.id);
    if (userInfo && userInfo.userId) {
      users.delete(userInfo.userId);
    }
    sockets.delete(socket.id);

    // If admin disconnects
    if (socket.id === adminSocketId) {
      adminSocketId = null;
    }

    // Notify admin of updated users
    if (adminSocketId) {
      io.to(adminSocketId).emit(
        "users-updated",
        Array.from(sockets.values()).filter((u) => u.type === "user")
      );
    }
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
