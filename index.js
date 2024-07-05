import express from "express";
import bodyParser from "body-parser";
import routes from "./routes/metaRoutes.js";
import cors from "cors";
import cron from "./cron.js";

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

// cron.job.start();

import { META } from "@consumet/extensions";

const meta = new META.Anilist();

const episodes = async () => {
    const a = await meta.fetchEpisodesListById(164212);
    console.log(a);
};

episodes();

const episodesL = async () => {
    const res = await fetch(
        "https://animeonline-api.onrender.com/api.animeonline/meta/episodelist-by-id/164212"
    );
    const data = await res.json();
    console.log(data);
};

// episodesL();
