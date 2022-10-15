import { JsonDB } from "node-json-db";
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';
import { dirname } from "dirname-filename-esm";
import "../models/index.js";
import "../../bot.js";

const hashCorrespondances: {
    [key: string]: string
} = {
    "bd4d84ac0591f38e8941a40536b6bebe": "514194661850480657",
    "6ca26e4a9685fc77648de7aee77767b8": "694235386658160760",
    "361a05bbbf53c03a7f0dc78194f891b1": "690311143021215765",
    "0e9da3176a23d29abe154226a7000b88": "846090401152499733",
    "8c4eca83c876b6c2c532ad88e7058f21": "801864726589472778",
    "e762f763aafe24f949d2073835251e0a": "242331397304483840",
    "1c73f099fba6119d5440819db104f2e1": "355058285004587021",
    "ce50fe30f6653f1af4766269ab1b0a37": "773969529041977354",
    "d0a8858bddd643bdbaab60aafd04193f": "678645956769742848",
    "5a336f1f1ff1022bf4bfb3b70c0446b7": "950050618133856327",
    "58f2ace198676aa62c58926ce49598cb": "763073277995778118",
    "fc8cd694eeae2f59e0e52eb1e9e92866": "656874233745375253",
    "aadf75d5351aefeb1640135aef8ebb04": "301042456164827136",
    "1c40b02f2341719bbec4de399cea852f": "430098198003056641",
    "c4e038a8684933145775aab0a3cdf7d6": "799969134054080513",
    "4c46777c4f585a30452a71670e815866": "790198743806902303",
    "feb0a263b4180921f809025d003ce741": "397188237090881556",
    "be2969569cc21c2f4411c5487b10b4fe": "800787940421664809",
    "7f7dc78c29651f4ea7c0e9f20d6a9f6d": "738451361728823297",
    "05f9f9e31d860ecf4bfe93539d3556b5": "449953778905382912",
    "64cf8760ed6617eaba491ed40a4c3552": "509404381008101376",
    "cd2cafc62f9b0143ec0d7177a2dddb0c": "702128070173261824",
    "8a4dd26480ffd8ce37dcfc7c6be5a182": "693712187197358090",
    "799d3ad06339e2d51ad3eca0363426aa": "451761879912677386",
    "aefbab045b7e46461cf63d8930aa72f6": "390460796330835988",
    "6265b5e80ed6184820e58c5c7febc562": "707532169681305632",
    "c71e4119b9c0f541646067b6a82906ce": "990390033544536144",
    "90aad5b255c491094027f4f9897f2efd": "704574286869823538",
    "8cffae41753c3f99f34700865bf615c9": "420628217649692676",
    "e079763309c84dc5dc760560e0d85a71": "732517608418574406",
    "95ae66aca3ac1e484a450903e497f458": "757657740557549708",
    "ad5e8ed57a07fc008f7271cdaeed083e": "295360250771406848",
    "8c8840e7ad5264e0aa837a4b6bee9def": "880926445722017842",
    "bc927207fef84febf5eb26363802f3df": "376761072465477635",
    "eabb72d2991066598553a159ed85e73f": "419469647188983808",
    "c6d5a81c6809ec7ccf27fa8b1822315a": "219560393499082756",
    "0451bc0c579e96eafbe12fec68740988": "821622885821972510",
    "b4adcb7fc061dba05e8eda51438aca22": "763772634688782356",
    "0fdea0513480989964d9172eb809d5a6": "556485149164830725",
    "f8de5f4456a4adabbd35c7aa65faa76c": "424927336664662029",
    "ac0ead1a93b14ea604a0a3f72ba5330a": "290971941857263616",
    "0ace64c03d05d1261445bc9fa8284095": "339783857027153935",
    "27dfe0133a61326408fd51944df346f3": "328143978736386049",
    "4af9836e00802107fc82f29932fbc7b0": "436986915183525896",
    "75b71fa1c32e8e84972aa245ad0ed675": "536231770719256587",
    "2df6e63875478928ee729c9c31571559": "796783577555271681",
    "657663ba92f00e1d3468d26d50a4c976": "721337934426538005",
    "a6dd7a07df0cfd48ba9c5605674ff201": "456529623661150238",
    "b148d96e674572e70c59fc5f178ee9df": "515977228165578793",
    "ebdec64ff54c2f44999b20ba5417bc96": "835499315559530508",
    "03cc7ba0594d0afdb1c61dcb8636f962": "460158531501555712",
    "0eeccddce720a9596f45a0b77a29ac1a": "442603453521461248",
    "b6126d3416e9412e8a1658843fd6b28b": "735094283807359007",
    "3ec86d74861a697c7277690e213a63f6": "468324555514183680",
    "5bdbd24c99b6a1d8b84cf9b047ec1ebf": "538699217573511168",
    "b496272fbcd5372a026e58e2e1124817": "430265997534953473",
    "34601bf4765b0d927d20170dbf14a5db": "431905684519518208",
    "b92223cfd8b1b8219bd5c692f486bae7": "390385984866353163",
    "ee4190922748484e3a980eb4d8b2da28": "482536708580048929",
    "efd2a190b492343ff143a9850a1c98f1": "419835797005664287",
    "67bbc1aa6bfcdd7c661845f8f323adb3": "701092322846179381",
    "86e721542bbbee007603d27b3cb27566": "261260647155630081",
    "f8387e50794f87297341317212c221f7": "822895842964799499",
    "1c3824bf324516d8ab62e48328da1646": "942423492169711667",
    "e8dc5433ede046c7d399e25fe0be46e9": "715095973105238069",
    "7888c5c789d0e028aea6d005f373b00f": "484842828174721056",
    "78c72f3d8420f38d67f3c05bdb3fb1c5": "838666626005729280",
    "07226f5083be8ed26e06d3be199ccc9f": "552243550587453449",
    "68c2b838360e04abc17273f2a2eb95b1": "972899755627782145",
    "76923d890e909c6b29d85d10fb8151a2": "807956239169355838",
    "89102525d92f20474fa6901528f80f4a": "474528249985105920",
    "f2e5165f18ebffcff502a2c6249f58a4": "276623032745721857",
    "569fea10270051c28397b8e4fbcb84fa": "702936679417380966",
    "9b5d12378b9ab980b627be36b9da05fc": "543157200152035338",
    "30c655e1e47bd8f8f5d0639db417f11c": "959851838113464390",
    "6b21c5817d347f88579bda3875943004": "991811976063893615",
    "61bb4b6ddc7ec2844a0b627f4a7354fc": "480669102105690113",
    "a6c0c00568ab42a5c958cd6e71f67d8d": "595933863499399189",
    "dc2962f654576c0b4ada359b24425884": "844254495361204264",
    "8df93546bb489edb1b707d85b4cc3de2": "904046906672570439",
    "9cf7eb3320187cce939c4142804c6f38": "921667814677413888",
    "411a53187a18dff328effe8527f619dd": "898245984851755039",
    "606409b96545c48d321c9b51bab71d83": "863514833743380490",
    "d0840667ae2734411eb54e228dc0562a": "452189248888635396",
    "8caa52de00e9e5fca4aa2d79fca36a68": "739501310335909920",
    "3676e80bce45c4389465c2e0a04ea2fe": "327086262261645322",
    "73b0c0f3d27478fabb99dc2a119f9782": "371012505541279747",
    "eb400b55a1985cd61daa825f4f0399a8": "774650483402866699",
    "312ceac48af32477b998621ed4e65ce8": "749620779733352451",
    "9b1c175d2b64ea32044740ec6228c021": "584824626207522830",
    "6e90599ae63d659134451ef910211098": "768059466046111745",
    "742573318cc5b0a8115a51ae597f6f8f": "458436058539884544",
    "a05ae8954e9442a477fa6829915b7088": "467818337599225866",
    "59ebb2b1bdc33ddda33a1b49145aaf26": "769207557746720848",
    "5dfa465be4fa5faf5c9735f4febd994f": "987999394009845813",
    "ef190777a90654a554a36a916c607f53": "995322846396039189"
}

export async function up() {
    let oldDB = new JsonDB(new Config(`${dirname(import.meta)}/../../../db.json`, true, true, '/'));
    let i = 0;
    for (let hash in hashCorrespondances) {
        console.log(`Utilisateur ${i++} / ${Object.keys(hashCorrespondances).length}`);
        let oldUser = oldDB.getData(`/users/${hash}`);

        let config = JSON.parse(JSON.stringify(oldUser.config));
        delete config.reminders.on;

        // Create the user
        let user = await db.models.User.create({
            id: hashCorrespondances[hash],
            config: config
        });

        // Create trackings
        for (let oldTracking of oldUser.tracking) {
            await user.$createTracking({
                type: oldTracking.type,
                data: oldTracking.data,
                createdAt: oldTracking.timestamp
            })
        }

        // Create propoReminders
        for (let oldPropoReminderTrigger in oldUser.config.reminders.on) {
            if (oldPropoReminderTrigger.includes("/")) continue;
            if (!oldPropoReminderTrigger) continue;
            let oldPropoReminder = oldUser.config.reminders.on[oldPropoReminderTrigger];

            let multiplier = {
                secondes: 1000,
                minutes: 60 * 1000,
                heures: 60 * 60 * 1000,
                jours: 24 * 60 * 60 * 1000
            }[oldPropoReminder.unit as "secondes" | "minutes" | "heures" | "jours"];

            await user.$createPropoReminder({
                trigger: oldPropoReminderTrigger,
                duration: multiplier * oldPropoReminder.duration,
                inDm: oldPropoReminder.dm
            })
        }
    }

    i = 0;
    // Create reminders
    for (let oldReminder of oldDB.getData("/reminders")) {
        console.log(`Rappel ${i++} / ${oldDB.getData("/reminders").length}`);
        let user = (await db.models.User.findOrCreate({
            where: {
                id: oldReminder.author_id
            }
        }))[0];

        await user.$createReminder({
            channelId: oldReminder.channel.id,
            channelIsUser: oldReminder.channel.isUser,
            deadLineTimestamp: oldReminder.dead_line_timestamp,
            message: oldReminder.message
        })
    }

    i = 0;
    // Create guilds
    for (let oldGuildName in oldDB.getData("/guilds")) {
        console.log(`Guilde ${i++} / ${Object.keys(oldDB.getData("/guilds")).length}`);
        let oldGuild = oldDB.getData(`/guilds/${oldGuildName}`);
        let guild = await db.models.Guild.create({
            name: oldGuildName
        });

        await guild.$createTracking({
            type: "guild",
            data: {
                type: "guild",
                level: Math.floor(oldGuild.level),
                xp: 0,
                max_xp: 1,
                description: oldGuild.description
            }
        });
    }
}