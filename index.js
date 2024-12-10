import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import routes from "./routes/metaRoutes.js";
import cors from "cors";
import cron from "./cron.js";
import axios from "axios";

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
const { metaRouter } = routes;

app.use(
    cors({
        origin: "*",
    })
);
app.use(bodyParser.json());
app.use("/api.animeonline/", metaRouter);
// app.use(metaRouter);

app.listen(port, () => console.log(`Server running on port: http://localhost:${port}`));
cron.job.start();
// export default app;

import { META } from "@consumet/extensions";

const meta = new META.Anilist();

const episodes = async () => {
    // const a = await meta.fetchEpisodesListById(164212);
    const a = await meta.fetchAnimeInfo(12189, true);
    // console.log(a.episodes);
};

const testProxy = async () => {
    try {
        const response = await axios.get(
            "https://goodproxy.goodproxy.workers.dev/fetch?url=https://mangasee123.com",
            {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    Referer: "https://mangasee123.com",
                },
            }
        );
        // console.log(response.data);
    } catch (err) {
        console.error("Proxy Test Failed:", err.message);
    }
};
// testProxy();

// episodes();
