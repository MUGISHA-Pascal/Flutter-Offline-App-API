import { Router } from "express";
import { auth, AuthRequest } from "../middleware/auth";
import { NewTask, tasks } from "../db/schema";
import { db } from "../db/drizzle-client";
import { eq } from "drizzle-orm";

const taskRouter = Router();

taskRouter.post("/", auth, async (req: AuthRequest, res) => {
  console.log("POST /tasks - Create task request received");
  try {
    console.log(`Creating task for user ID: ${req.user}`);
    req.body = { ...req.body, dueAt: new Date(req.body.dueAt), uid: req.user };
    const newTask: NewTask = req.body;

    const [task] = await db.insert(tasks).values(newTask).returning();
    console.log(`Task created successfully with ID: ${task.id} for user: ${req.user}`);

    res.status(201).json(task);
  } catch (e) {
    console.error("Create task error:", e);
    res.status(500).json({ error: e });
  }
});

taskRouter.get("/", auth, async (req: AuthRequest, res) => {
  console.log("GET /tasks - Fetch tasks request received");
  try {
    console.log(`Fetching tasks for user ID: ${req.user}`);
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.uid, req.user!));

    console.log(`Found ${allTasks.length} tasks for user: ${req.user}`);
    res.json(allTasks);
  } catch (e) {
    console.error("Fetch tasks error:", e);
    res.status(500).json({ error: e });
  }
});

taskRouter.delete("/", auth, async (req: AuthRequest, res) => {
  console.log("DELETE /tasks - Delete task request received");
  try {
    const { taskId }: { taskId: string } = req.body;
    console.log(`Deleting task ID: ${taskId} for user: ${req.user}`);
    
    await db.delete(tasks).where(eq(tasks.id, taskId));
    console.log(`Task ${taskId} deleted successfully`);

    res.json(true);
  } catch (e) {
    console.error("Delete task error:", e);
    res.status(500).json({ error: e });
  }
});

taskRouter.post("/sync", auth, async (req: AuthRequest, res) => {
  console.log("POST /tasks/sync - Sync tasks request received");
  try {
    // req.body = { ...req.body, dueAt: new Date(req.body.dueAt), uid: req.user };
    const tasksList = req.body;
    console.log(`Syncing ${tasksList.length} tasks for user ID: ${req.user}`);

    const filteredTasks: NewTask[] = [];

    for (let t of tasksList) {
      t = {
        ...t,
        dueAt: new Date(t.dueAt),
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
        uid: req.user,
      };
      filteredTasks.push(t);
    }

    const pushedTasks = await db
      .insert(tasks)
      .values(filteredTasks)
      .returning();

    console.log(`Successfully synced ${pushedTasks.length} tasks for user: ${req.user}`);
    res.status(201).json(pushedTasks);
  } catch (e) {
    console.error("Sync tasks error:", e);
    res.status(500).json({ error: e });
  }
});

export default taskRouter;
