import { Monitor } from "forever-monitor";

let monitor: Monitor = new Monitor("dist/bot.js", {
    max: Infinity,
    silent: false
});

monitor.start();