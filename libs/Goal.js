import { createHash } from "crypto";

export class Goal {
    constructor(client, db, config, user_id, start=new Date(), end=new Date(), value=0, unit="rank_points", init_value=0, end_value=init_value+value) {
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

    async save() {
        this.db.push(`/users/${createHash('md5').update(this.user_id).digest('hex')}/config/goal`, {
            start: this.start.getTime(),
            end: this.end.getTime(),
            value: this.value,
            unit: this.unit,
            init_value: this.init_value,
            end_value: this.end_value
        });
        return this;
    }
}