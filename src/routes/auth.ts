import { db } from "./../db/drizzle-client";
import { Router, Request, Response } from "express";
import { NewUser, users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { auth, AuthRequest } from "../middleware/auth";
const authRouter = Router();

interface SignUpBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

authRouter.post(
  "/signup",
  async (req: Request<{}, {}, SignUpBody>, res: Response) => {
    console.log("POST /auth/signup - User signup request received");
    try {
      // get req body
      const { name, email, password } = req.body;
      console.log(`Signup attempt for email: ${email}`);
      
      // check if the user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existingUser.length) {
        console.log(`Signup failed - User already exists: ${email}`);
        res
          .status(400)
          .json({ error: "User with the same email already exists!" });
        return;
      }

      // hashed pw
      const hashedPassword = await bcryptjs.hash(password, 8);
      // create a new user and store in db
      const newUser: NewUser = {
        name,
        email,
        password: hashedPassword,
      };

      const [user] = await db.insert(users).values(newUser).returning();
      console.log(`User successfully created: ${email} with ID: ${user.id}`);
      res.status(201).json(user);
    } catch (e) {
      console.error("Signup error:", e);
      res.status(500).json({ error: e });
    }
  }
);

authRouter.post(
  "/login",
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    console.log("POST /auth/login - User login request received");
    try {
      // get req body
      const { email, password } = req.body;
      console.log(`Login attempt for email: ${email}`);

      // check if the user doesnt exist
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!existingUser) {
        console.log(`Login failed - User not found: ${email}`);
        res.status(400).json({ error: "User with this email does not exist!" });
        return;
      }

      const isMatch = await bcryptjs.compare(password, existingUser.password);
      if (!isMatch) {
        console.log(`Login failed - Incorrect password for: ${email}`);
        res.status(400).json({ error: "Incorrect password!" });
        return;
      }

      const token = jwt.sign({ id: existingUser.id }, "passwordKey");
      console.log(`Login successful for: ${email} with ID: ${existingUser.id}`);

      res.json({ token, ...existingUser });
    } catch (e) {
      console.error("Login error:", e);
      res.status(500).json({ error: e });
    }
  }
);

authRouter.post("/tokenIsValid", async (req, res) => {
  console.log("POST /auth/tokenIsValid - Token validation request received");
  try {
    // get the header
    const token = req.header("x-auth-token");

    if (!token) {
      console.log("Token validation failed - No token provided");
      res.json(false);
      return;
    }

    // verify if the token is valid
    const verified = jwt.verify(token, "passwordKey");

    if (!verified) {
      console.log("Token validation failed - Invalid token");
      res.json(false);
      return;
    }

    // get the user data if the token is valid
    const verifiedToken = verified as { id: string };

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, verifiedToken.id));

    if (!user) {
      console.log(`Token validation failed - User not found for ID: ${verifiedToken.id}`);
      res.json(false);
      return;
    }

    console.log(`Token validation successful for user ID: ${verifiedToken.id}`);
    res.json(true);
  } catch (e) {
    console.error("Token validation error:", e);
    res.status(500).json(false);
  }
});

authRouter.get("/", auth, async (req: AuthRequest, res) => {
  console.log("GET /auth/ - Get user data request received");
  try {
    if (!req.user) {
      console.log("Get user data failed - User not found in request");
      res.status(401).json({ error: "User not found!" });
      return;
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.user));
    console.log(`User data retrieved successfully for ID: ${req.user}`);

    res.json({ ...user, token: req.token });
  } catch (e) {
    console.error("Get user data error:", e);
    res.status(500).json(false);
  }
});

export default authRouter;
