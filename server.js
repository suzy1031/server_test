const redis = require("./libs/redis");
const path = require("path");
const express = require("express");
const app = express();

const usersHandler = require("./handlers/users");

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render(path.join(__dirname, "views", "index.ejs"));
});

app.use("/static", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});

// const wrapAPI = (fn) => {
//   return (req, res, next) => {
//     try {
//       fn(req)
//         .then((data) => res.status(200).json(data))
//         .catch(next);
//     } catch (e) {
//       next(e);
//     }
//   };
// };

// const handler = async (req) => {
//   const error = new Error("Something Error");
//   error.status = 400;
//   throw error;
// };

// app.get("/user/:id", wrapAPI(handler));

app.get("/user/:id", async (req, res) => {
  try {
    const user = await usersHandler.getUser(req);
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/users", async (req, res) => {
  try {
    const locals = await usersHandler.getUsers(req);
    res.render(path.join(__dirname, "views", "users.ejs"), locals);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

redis
  .connect()
  .once("ready", async () => {
    try {
      await redis.init();
      app.listen(3000, () => {
        console.log("Server is running on port 3000");
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
