import { createHash } from "crypto";
import { User } from "discord.js";

export default class Goal {

    user: User | undefined;
    user_id: string;
    start: Date;
    end: Date;
    value: number;
    unit: string;
    init_value: number;
    end_value: number;

    constructor(opts: {
        user_id: string,
        start: Date,
        end: Date,
        value: number,
        unit: string,
        init_value: number,
        end_value?: number
    }) {
        this.user_id = opts.user_id;
        this.start = opts.start;
        this.end = opts.end;
        this.value = opts.value;
        this.unit = opts.unit || "rank_points";
        this.init_value = opts.init_value;
        this.end_value = opts.end_value | opts.value + opts.init_value;
    }

    async init () {
        this.user = await client.users.fetch(this.user_id);
    }

    async save() {
        db.push(`/users/${createHash('md5').update(this.user_id).digest('hex')}/config/goal`, {
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