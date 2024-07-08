import express from "express";
import metaControllers from "../controllers/metaControllers.js";
import zoroControllers from "../controllers/zoroControllers.js";

import apicache from "apicache";
import gogoanimeControllers from "../controllers/gogoanimeControllers.js";
let cache = apicache.middleware;

const metaRouter = express.Router();

const {
    searchRoute,
    infoRoute,
    trendingRoute,
    popularRoute,
    recentEpisodesRoute,
    watchRoute,
    advancedSearchRoute,
    AiringScheduleRoute,
    EpisodelistById,
} = metaControllers;

const { zoroInfoRoute, zoroWatchRoute, zoroRecentEpisodes } = zoroControllers;

const { gogoInfoRoute, gogoanimeRecentEpisodesRoute } = gogoanimeControllers;

metaRouter.get("/", (req, res) => {
    res.send("welcome to Anime API");
});

metaRouter.get("/search/:query", searchRoute);

metaRouter.get("/advanced-search", advancedSearchRoute);

metaRouter.get("/meta/info/:aniId", cache("2 minutes"), infoRoute);

metaRouter.get("/trending?", cache("2 minutes"), trendingRoute);

metaRouter.get("/popular?", cache("2 minutes"), popularRoute);

metaRouter.get("/recent-episode", cache("2 minutes"), recentEpisodesRoute);

metaRouter.get("/watch/:epId", watchRoute);

metaRouter.get("/airing-schedule", AiringScheduleRoute);

metaRouter.get("/meta/episodelist-by-id/:animeId", EpisodelistById);

//zoro

metaRouter.get("/zoro/info/:aniId", zoroInfoRoute);

metaRouter.get("/zoro/watch/:epId", zoroWatchRoute);

metaRouter.get("/zoro/recent-episode", cache("2 minutes"), zoroRecentEpisodes);

// gogoanime

metaRouter.get("/gogoanime/info/:aniId", cache("2 minutes"), gogoInfoRoute);

metaRouter.get("/gogoanime/recent-episode", cache("2 minutes"), gogoanimeRecentEpisodesRoute);

export default { metaRouter };
