import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { readDb, writeDb } from "../../database/database.js";

const SECRET = "secret"; 

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    profilePicture: user.profilePicture,
  };
}

export default {
  
  async register({ username, password, profilePicture }) {
    const db = await readDb();
    db.users = db.users || [];

    const exists = db.users.some((u) => u.username === username);
    if (exists) throw new Error("user exists already");

    const newUser = {
      id: crypto.randomUUID(),
      username,
      password, 
      profilePicture: profilePicture ?? "",
    };

    db.users.push(newUser);
    await writeDb(db);

    return sanitizeUser(newUser);
  },

  async login({ username, password }) {
    const db = await readDb();
    db.users = db.users || [];

    const user = db.users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) return null;

    const tokenPayload = {
      userId: user.id,
      username: user.username,
    };

    const token = jwt.sign(tokenPayload, SECRET, {
      expiresIn: "1h",
    });

    return {
      token,
      user: sanitizeUser(user),
    };
  },
};
