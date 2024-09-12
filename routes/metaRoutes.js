import express from "express";
import metaControllers from "../controllers/metaControllers.js";
import zoroControllers from "../controllers/zoroControllers.js";

import apicache from "apicache";
import gogoanimeControllers from "../controllers/gogoanimeControllers.js";
import authController from "../controllers/authController.js";

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

const {
    redirectToAniList,
    handleCallback,
    getUserData,
    fetchUserAnimeList,
    getMediaListStatus,
    addToMediaListCollection,
    toggleFavourites,
    getFavouritesAnime,
    deleteMediaListEntry,
    getIndividualFavourite,
    fetchUserAnimeListAll,
} = authController;

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

metaRouter.get("/airing-schedule", cache("2 minutes"), AiringScheduleRoute);

metaRouter.get("/meta/episodelist-by-id/:animeId", EpisodelistById);

//zoro

metaRouter.get("/zoro/info/:aniId", zoroInfoRoute);

metaRouter.get("/zoro/watch/:epId", zoroWatchRoute);

metaRouter.get("/zoro/recent-episode", cache("2 minutes"), zoroRecentEpisodes);

// gogoanime

metaRouter.get("/gogoanime/info/:aniId", cache("2 minutes"), gogoInfoRoute);

metaRouter.get("/gogoanime/recent-episode", cache("2 minutes"), gogoanimeRecentEpisodesRoute);

// auth route

metaRouter.get("/authorize", redirectToAniList);
metaRouter.post("/token", handleCallback);
metaRouter.get("/user", cache("1 minute"), getUserData);
metaRouter.get("/user/anime-list", cache("40 seconds"), fetchUserAnimeList);
metaRouter.get("/user/anime-list-all", cache("60 seconds"), fetchUserAnimeListAll);
metaRouter.get("/user/media-list-status", getMediaListStatus);
metaRouter.get("/user/add/media-list-entry", addToMediaListCollection);
metaRouter.get("/user/add/favourite", toggleFavourites);
metaRouter.get("/user/anime/favourite", cache("40 seconds"), getFavouritesAnime);
metaRouter.get("/user/delete/media-list-entry", deleteMediaListEntry);
metaRouter.get("/user/get/favourite", cache("40 seconds"), getIndividualFavourite);

export default { metaRouter };
