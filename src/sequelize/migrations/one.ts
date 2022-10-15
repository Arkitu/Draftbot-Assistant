import "../models/index.js";
import "../../bot.js";

export async function up() {
    await db.sync({ alter: true });
    for (const guild of await db.models.Guild.findAll()) {
        const data = await guild.fetchData();
        guild.data = data;
        await guild.save();
    }
}