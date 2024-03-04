import express from "express";
import metaControllers from "../controllers/metaControllers.js";

import apicache from "apicache";
let cache = apicache.middleware;

const metaRouter = express.Router();

const {
    searchRoute,
    infoRoute,
    trendingRoute,
    popularRoute,
    recentEpisodesRoute,
    watchRoute,
    zoroInfoRoute,
    zoroWatchRoute,
    gogoanimeRecentEpisodesRoute,
    advancedSearchRoute,
    AiringScheduleRoute,
    EpisodelistById,
} = metaControllers;

metaRouter.get("/", (req, res) => {
    res.send("welcome to Anime API");
});

metaRouter.get("/search/:query", searchRoute);

metaRouter.get("/advanced-search", advancedSearchRoute);

metaRouter.get("/meta/info/:aniId", cache("2 minutes"), infoRoute);

metaRouter.get("/trending?", cache("2 minutes"), trendingRoute);

metaRouter.get("/popular?", cache("2 minutes"), popularRoute);

metaRouter.get("/recent-episode", cache("2 minutes"), recentEpisodesRoute);

metaRouter.get("/gogoanime/recent-episode", cache("2 minutes"), gogoanimeRecentEpisodesRoute);

metaRouter.get("/watch/:epId", watchRoute);

metaRouter.get("/zoro/info/:aniId", zoroInfoRoute);

metaRouter.get("/zoro/watch/:epiId", zoroWatchRoute);

metaRouter.get("/airing-schedule", AiringScheduleRoute);

metaRouter.get("/meta/episode-list-by-id/:id", EpisodelistById);

export default { metaRouter };
