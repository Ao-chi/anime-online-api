import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import routes from "./routes/metaRoutes.js";
import cors from "cors";
import cron from "./cron.js";

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

// episodes();
