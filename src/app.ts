import express from "express";
import authRouter from "./routes/auth";
import taskRouter from "./routes/tasks";

const app = express();

console.log("Initializing Express application...");

app.use(express.json());
app.use("/auth", authRouter);
app.use("/tasks", taskRouter);

console.log("Routes registered: /auth, /tasks");

app.get("/", (req, res) => {
  console.log("GET / - Root endpoint accessed");
  res.send("Welcome to my app!!!!!!!");
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server started successfully on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`- GET  / (Root)`);
  console.log(`- POST /auth/signup`);
  console.log(`- POST /auth/login`);
  console.log(`- POST /auth/tokenIsValid`);
  console.log(`- GET  /auth/`);
  console.log(`- POST /tasks`);
  console.log(`- GET  /tasks`);
  console.log(`- DELETE /tasks`);
  console.log(`- POST /tasks/sync`);
});
