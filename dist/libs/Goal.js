"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Goal = void 0;
const crypto_1 = require("crypto");
class Goal {
    constructor(client, db, config, user_id, start = new Date(), end = new Date(), value = 0, unit = "rank_points", init_value = 0, end_value = init_value + value) {
        this.client = client;
        this.db = db;
        this.config = config;
        this.user = client.users.fetch(user_id);
        this.user_id = user_id;
        this.start = start;
        this.end = end;
        this.value = value;
        this.unit = unit;
        this.init_value = init_value;
        this.end_value = end_value;
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            this.db.push(`/users/${(0, crypto_1.createHash)('md5').update(this.user_id).digest('hex')}/config/goal`, {
                start: this.start.getTime(),
                end: this.end.getTime(),
                value: this.value,
                unit: this.unit,
                init_value: this.init_value,
                end_value: this.end_value
            });
            return this;
        });
    }
}
exports.Goal = Goal;
