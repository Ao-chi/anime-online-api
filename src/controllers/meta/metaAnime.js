import { META, ANIME } from "@consumet/extensions";
import { PROVIDERS_LIST } from "@consumet/extensions";
import Gogoanime from "@consumet/extensions/dist/providers/anime/gogoanime.js";
import Zoro from "@consumet/extensions/dist/providers/anime/zoro.js";
import Anilist from "@consumet/extensions/dist/providers/meta/anilist.js";

let anilist = new META.Anilist();
let manga = new META.Anilist.Manga();

const searchRoute = async (req, res) => {
    const query = req.params.query;
    const page = req.query.page;
    const perPage = req.query.perPage;

    const result = await anilist.search(query, page, perPage);
    res.status(200).send(result);
};

const advancedSearchRoute = async (req, res) => {
    try {
        // Extract query parameters from the request
        let { query, type, page, perPage, format, sort, genres, id, year, status, season } = req.query;
        console.log(req.query, "type:", type);

        // Parse the genres parameter as JSON
        genres = genres ? JSON.parse(genres) : undefined;
        if (genres) {
            genres = genres.map((genre) => {
                return genre.charAt(0).toUpperCase() + genre.slice(1);
            });
        }

        if (sort) sort = JSON.parse(sort);
        // if (sort) {
        //     sort = sort.map((sort) => {
        //         console.log(sort);
        //         return sort.charAt(0).toUpperCase() + sort.slice(1);
        //     });
        // }
        const result = await anilist.advancedSearch(
            query,
            type,
            page,
            perPage,
            format,
            sort,
            genres,
            id,
            year,
            status,
            season
        );

        // Send the result as a response
        res.json(result);
        // console.log(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const infoRoute = async (req, res) => {
    const aniId = req.params.aniId;
    const isDub = req.query.isDub;
    const provider = req.query.provider || "zoro";
    const referer = "https://anilist.co";

    console.log("isDub value:", isDub, "provider:", provider);
    if (provider) {
        let possibleProvider = PROVIDERS_LIST.ANIME.find(
            (p) => p.name.toLowerCase() === provider.toLocaleLowerCase()
        );

        anilist = new META.Anilist(possibleProvider);
        // console.log(anilist);
    }

    try {
        const result = await anilist.fetchAnimeInfo(aniId, isDub, provider, {
            headers: {
                Referer: referer,
            },
        });
        // console.log("Fetched result:", result); // Ensure this logs the fetched data
        res.status(200).send(result);
    } catch (err) {
        console.error("Error fetching anime info:", err); // Log errors
        res.status(500).send({ error: "Failed to fetch anime info" });
    }
};

const trendingRoute = async (req, res) => {
    const page = req.query.page;
    const perPage = req.query.perPage;

    const result = await anilist.fetchTrendingAnime(page, perPage);
    res.status(200).send(result);
};

const popularRoute = async (req, res) => {
    const page = req.query.page;
    const perPage = req.query.perPage;

    const result = await anilist.fetchPopularAnime(page, perPage);
    res.status(200).send(result);
};

const recentEpisodesRoute = async (req, res) => {
    const page = req.query.page;
    const perPage = req.query.perPage;
    const provider = req.query.provider;

    try {
        const result = await anilist.fetchRecentEpisodes(provider, page, perPage);

        res.status(200).send(result);
    } catch (error) {
        // Handle errors and send a 500 internal server error response
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};

const watchRoute = async (req, res) => {
    const epId = req.params.epId;

    // const result = await mal.fetchEpisodeSources(epId);
    const result = await anilist.fetchEpisodeSources(epId);
    res.status(200).send(result);
};

const AiringScheduleRoute = async (req, res) => {
    const page = req.query.page;
    const perPage = req.query.perPage;
    const weekStart = req.query.weekStart;
    const weekEnd = req.query.weekEnd;
    const notYetAired = req.query.notYetAired;

    const _weekStart = Math.ceil(Date.now() / 1000);
    const result = await anilist.fetchAiringSchedule(
        page,
        perPage,
        weekStart !== null && weekStart !== undefined ? weekStart : _weekStart,
        weekEnd !== null && weekEnd !== undefined ? weekEnd : _weekStart + 604800,
        notYetAired !== null && notYetAired !== undefined ? notYetAired : true
    );
    console.log(_weekStart);
    // const result = await anilist.fetchAiringSchedule(page, perPage, weekStart, weekEnd, notYetAired);
    res.status(200).send(result);
};

const EpisodelistById = async (req, res) => {
    const animeId = req.params.animeId;

    const result = await anilist.fetchEpisodesListById(animeId);
    console.log(result);
    res.status(200).send(result);
};

export default {
    searchRoute,
    infoRoute,
    trendingRoute,
    popularRoute,
    recentEpisodesRoute,
    watchRoute,
    advancedSearchRoute,
    AiringScheduleRoute,
    EpisodelistById,
};
