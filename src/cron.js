import { CronJob } from "cron";
import https from "https";

const API_URL = "https://animeonline-api.onrender.com/api.animeonline/";
// const API_URL = "https://anime-online-api-ocoi.onrender.com/api.animeonline/";

let num = 1;
const job = new CronJob(
    "*/14 * * * *",
    function () {
        console.log("running evry 14 minute");
        https
            .get(API_URL, (res) => {
                if (res.statusCode === 200) {
                    num++;
                    console.log(`Server restarted ${num}`);
                } else {
                    console.error(`failed to restart server with status code  ${res.statusMessage}`);
                }
            })
            .on("error", (error) => {
                console.error("Error during restart", error.message);
            });
    },
    null
);

export default { job };
