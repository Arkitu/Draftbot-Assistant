import "../models/index.js";

export async function up() {
  await db.sync({ alter: true });
  console.log("Migration complete.");
}