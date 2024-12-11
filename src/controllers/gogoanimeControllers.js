import { ANIME } from "@consumet/extensions";

const gogoanime = new ANIME.Gogoanime();

const gogoInfoRoute = async (req, res) => {
    const aniId = req.params.aniId;

    const result = await gogoanime.fetchAnimeInfo(aniId);
    res.status(200).send(result);
};

const gogoanimeRecentEpisodesRoute = async (req, res) => {
    const page = req.query.page;
    const perPage = req.query.perPage;
    const provider = req.query.provider;
    const type = req.query.type;

    const result = await gogoanime.fetchRecentEpisodes(type, page, perPage);
    res.status(200).send(result);
};

export default {
    gogoInfoRoute,
    gogoanimeRecentEpisodesRoute,
};
