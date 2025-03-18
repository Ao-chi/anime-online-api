import { ANIME, StreamingServers, VidCloud } from "@consumet/extensions";
let pahe = new ANIME.AnimePahe();

const paheSearch = async (req, res) => {
    const query = req.query.query;

    console.log("query:", query);
    try {
        const a = pahe.setProxy({
            url: "https://goodproxy.goodproxy.workers.dev/fetch?ref=https://animepahe.ru&url=",
        });
        pahe = new ANIME.AnimePahe(a);
        const result = await pahe.search(query);

        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: `Failed to search ${query}`, error: error });
    }
};

const paheInfoRoute = async (req, res) => {
    const id = req.params.id;
    const episodePage = req.query.episodePage;

    if (!id) {
        res.status(400).send({ message: "No episodeId provided" });
    }
    try {
        const result = await pahe.fetchAnimeInfo(id, episodePage);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: `Failed to fetch info ${id}`, error: error });
    }
};

const paheWatchRoute = async (req, res) => {
    const episodeId = req.params.episodeId;
    console.log(episodeId);
    // const encodedId = encodeURIComponent(episodeId);

    try {
        const a = pahe.setProxy({
            url: "https://goodproxy.goodproxy.workers.dev/fetch?ref=https://animepahe.ru&url=",
        });
        pahe = new ANIME.AnimePahe(a);
        const result = await pahe.fetchEpisodeSources(episodeId);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: `Failed to fetch episode sources`, error: error });
    }
};

export default { paheSearch, paheInfoRoute, paheWatchRoute };
