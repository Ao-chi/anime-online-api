import express from "express";
import metaAnime from "../controllers/meta/metaAnime.js";

import zoroControllers from "../controllers/zoroControllers.js";

import apicache from "apicache";
import gogoanimeControllers from "../controllers/gogoanimeControllers.js";
import authController from "../controllers/authController.js";
import metaManga from "../controllers/meta/metaManga.js";
import mangaDex from "../controllers/manga/mangaDex.js";
import mangakakalot from "../controllers/manga/mangakakalot.js";
import userController from "../controllers/user/userController.js";
import anixControllers from "../controllers/anixController.js";

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
} = metaAnime;

const { MangaInfo, MangaRead, getTtrendingManga, getRecentManga, getPopularManga, getMangakakalotId } =
    metaManga;

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

const { fetchListByStatus } = userController;

const { getMangaDexInfo } = mangaDex;

const { getMangakakalotInfo, getMangakakalotChapters } = mangakakalot;

const { anixEpisodeSources, anixInfoRoute, anixSearch, mapAnix } = anixControllers;

metaRouter.get("/", (req, res) => {
    res.send("welcome to Anime API");
});

// meta anime

metaRouter.get("/search/:query", searchRoute);

metaRouter.get("/advanced-search", advancedSearchRoute);

metaRouter.get("/meta/info/:aniId", cache("20 seconds"), infoRoute);

metaRouter.get("/trending?", cache("2 minutes"), trendingRoute);

metaRouter.get("/popular?", cache("2 minutes"), popularRoute);

metaRouter.get("/recent-episode", cache("2 minutes"), recentEpisodesRoute);

metaRouter.get("/watch/:epId", watchRoute);

metaRouter.get("/airing-schedule", cache("2 minutes"), AiringScheduleRoute);

metaRouter.get("/meta/episodelist-by-id/:animeId", EpisodelistById);

// manga

metaRouter.get("/meta/manga/info/:id", cache("20 seconds"), MangaInfo);
metaRouter.get("/meta/manga/read", MangaRead);
metaRouter.get("/meta/manga/trending", getTtrendingManga);
metaRouter.get("/meta/manga/popular", getPopularManga);
metaRouter.get("/meta/manga/recent", cache("2 minutes"), getRecentManga);

metaRouter.get("/manga/mangadex/info/:id", cache("20 seconds"), getMangaDexInfo);
metaRouter.get("/manga/mangakakalot/info/:id", cache("20 seconds"), getMangakakalotInfo);
metaRouter.get("/manga/mangakakalot/read/:chapterId", cache("20 seconds"), getMangakakalotChapters);
metaRouter.get("/meta/manga/mangakakalot/:id", cache("20 seconds"), getMangakakalotId);

//zoro

metaRouter.get("/zoro/info/:aniId", zoroInfoRoute);

metaRouter.get("/zoro/watch/:epId", zoroWatchRoute);

metaRouter.get("/zoro/recent-episode", cache("2 minutes"), zoroRecentEpisodes);

// gogoanime

metaRouter.get("/gogoanime/info/:aniId", cache("2 minutes"), gogoInfoRoute);

metaRouter.get("/gogoanime/recent-episode", cache("2 minutes"), gogoanimeRecentEpisodesRoute);

// anix
metaRouter.get("/anix/search", cache("2 minutes"), anixSearch);
metaRouter.get("/anix/info/:id", cache("2 minutes"), anixInfoRoute);
metaRouter.get("/anix/watch/:id/:episodeId", anixEpisodeSources);
metaRouter.get("/anix/map/:id", cache("20 seconds"), mapAnix);

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

// anilist routes

metaRouter.get("/user/medialist/anime", cache("40 seconds"), fetchListByStatus);

export default { metaRouter };
