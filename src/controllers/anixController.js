import { ANIME, META, PROVIDERS_LIST } from "@consumet/extensions";
import distance from "jaro-winkler";
import { findOriginalTitle, sanitize } from "../utils/utils.js";

let anix = new ANIME.Anix();

const anixSearch = async (req, res) => {
    const query = req.query.query;

    try {
        const result = await anix.search(query);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: `Failed to search ${query}`, error: error });
    }
};

const anixInfoRoute = async (req, res) => {
    const id = req.params.id;
    const isDub = req.query.isDub;
    try {
        const result = await anix.fetchAnimeInfo(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: "Failed to get AnimeInfo from anix provider", error: error });
    }
};

const anixEpisodeSources = async (req, res) => {
    const id = req.params.id;
    const episodeId = req.params.episodeId;
    const server = req.query.server;

    console.log(id, episodeId);

    try {
        const result = await anix.fetchEpisodeSources(id, episodeId);
        res.status(200).send(result);
    } catch (error) {
        console.log(error);

        res.status(500).send({ message: "Failed to get Episode Sources from anix provider", error: error });
    }
};

// mapped

const getAnimeTitle = async (id) => {
    try {
        const meta = new META.Anilist();
        return (await meta.fetchAnimeInfo(id)).title;
    } catch (error) {
        console.error(error);
        return {
            romaji: "",
            native: "",
            english: "",
        };
    }
};

const mapAnix = async (req, res) => {
    const id = req.params.id;

    if (id === undefined || id === null) {
        return res.status(400).send({ message: "No id provided" });
    }

    let title;
    let searchRes;
    const provider = "anix";

    try {
        title = await getAnimeTitle(id);
        console.log("titles", title);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch titles", error: error });
    }

    const possibleProvider = PROVIDERS_LIST.ANIME.find(
        (p) => p.name.toLowerCase() === provider.toLowerCase()
    );

    searchRes = await possibleProvider.search(sanitize(title.romaji));

    // Fallback: use `title.english` if no results found
    if (!searchRes.results.length) {
        console.log("use en title");

        searchRes = await possibleProvider.search(sanitize(title.english));
    }

    const anixTitles = searchRes.results
        .filter((anime) => anime !== null) // Filter out null values
        .map((anime) => anime.title); // Extract the title property

    console.log("anixtitles", searchRes);

    const bestTitle = findOriginalTitle(title, anixTitles);

    const possibleAnime = searchRes.results.find(
        (manga) => bestTitle.toLowerCase() === manga.title.toLowerCase()
    );
    res.status(200).json(possibleAnime);
};

export default { anixSearch, anixEpisodeSources, anixInfoRoute, mapAnix };
