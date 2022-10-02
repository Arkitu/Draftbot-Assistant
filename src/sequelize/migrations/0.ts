import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";
import { dirname } from "dirname-filename-esm";
import "../models/index.js";

export default {
    up: ()=>{
        let oldDB = new JsonDB(new Config(`${dirname}/../../../db.json`, true, true, '/'));
    }
}