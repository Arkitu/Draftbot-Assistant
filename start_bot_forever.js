import { Monitor } from "forever-monitor";

let monitor = new Monitor("bot.js", {
    max: Infinity,
    silent: false
});

monitor.start();