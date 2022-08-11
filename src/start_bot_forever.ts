import { Monitor } from "forever-monitor";

let monitor: Monitor = new Monitor("bot.js", {
    max: Infinity,
    silent: false
});

monitor.start();