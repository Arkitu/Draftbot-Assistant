"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forever_monitor_1 = require("forever-monitor");
let monitor = new forever_monitor_1.Monitor("bot.js", {
    max: Infinity,
    silent: false
});
monitor.start();
