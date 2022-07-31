import { createHash } from "crypto";
import { Context } from "./Context.js";

export class Goal {
    constructor(opts: {
        ctx: Context,
        user_id: any,
        start: Date,
        end: Date,
        value: number,
        unit: string,
        init_value: number,
        end_value: number
    }) {
        this.client = client;
        this.db = db;
        this.config = config;
        this.user = client.users.fetch(user_id);
        this.user_id = user_id;
        this.start = start;
        this.end = end;
        this.value = value;
        this.unit = unit || "rank_points";
        this.init_value = init_value;
        this.end_value = end_value;
    }

    async save() {
        this.db.push(`/users/${createHash('md5').update(this.user_id).digest('hex')}/config/goal`, {
            start: this.start.getTime(),
            end: this.end.getTime(),
            value: this.value,
            unit: this.unit,
            init_value: this.init_value,
            end_value: this.end_value,
            active: true
        });
        return this;
    }
}