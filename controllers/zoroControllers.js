import { ANIME } from "@consumet/extensions";
const zoro = new ANIME.Zoro();

const zoroInfoRoute = async (req, res) => {
    const aniId = req.params.aniId;
    const isDub = req.query.isDub;

    const result = await zoro.fetchAnimeInfo(aniId, isDub);
    res.status(200).send(result);
};

const zoroWatchRoute = async (req, res) => {
    const epId = req.params.epId;
    const isDub = req.query.isDub;
    const server = req.query.server;

    const result = await zoro.fetchEpisodeSources(epId, isDub, server);
    res.status(200).send(result);
};

const zoroRecentEpisodes = async (req, res) => {
    const page = req.query.page;

    const result = await zoro.fetchRecentlyUpdated(page);
    res.status(200).send(result);
};

export default { zoroInfoRoute, zoroWatchRoute, zoroRecentEpisodes };
