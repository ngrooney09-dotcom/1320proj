import crypto from "node:crypto";
import { readDb, writeDb } from "../../database/database.js";

function findTip(db, id, userId) {
  return db.tips.find(t => t.id === id && t.userId === userId);
}

export default {
  
  async findAll() {
    const { tips = [] } = await readDb();
    return tips;
  },

  async create({ title, userId }) {
    const db = await readDb();

    const tip = {
      id: crypto.randomUUID(),
      title,
      userId
    };

    db.tips = db.tips || [];
    db.tips.push(tip);

    await writeDb(db);
    return tip.id;
  },

  // This is the update tip
  async update({ id, title, userId }) {
    const db = await readDb();

    const existing = findTip(db, id, userId);
    if (!existing) return false;

    existing.title = title;
    await writeDb(db);
    return true;
  },

  async remove({ id, userId }) {
    const db = await readDb();

    const before = db.tips.length;
    db.tips = db.tips.filter(t => !(t.id === id && t.userId === userId));

    const changed = db.tips.length !== before;
    if (changed) await writeDb(db);

    return changed;
  }
};
