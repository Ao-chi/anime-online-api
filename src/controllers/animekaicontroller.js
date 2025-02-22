import { ANIME, StreamingServers, VidCloud } from "@consumet/extensions";
let animekai = new ANIME.AnimeKai();

const animekaiInfo = async (req, res) => {
    const id = req.params.id;
    const isDub = req.query.isDub;

    if (!id) {
        res.status(500).send({ error: "No id provided" });
    }

    try {
        const a = animekai.setProxy({
            url: "https://goodproxy.goodproxy.workers.dev/fetch?ref=https://animekai.to&url=",
        });
        animekai = new ANIME.AnimeKai(a);
        const result = await animekai.fetchAnimeInfo(id, isDub);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong", message: error });
    }
};

const animekaiWatch = async (req, res) => {
    const epId = req.params.epId;
    const { token, ep } = req.query;
    const isDub = req.query.isDub;

    // const episodeId = epId.concat("?token=", token);
    const episodeId = `${epId}#${ep}?token=${token}`;

    if (!epId) {
        res.status(500).send({ error: "No id provided" });
    }

    try {
        const result = await animekai.fetchEpisodeSources(epId);
        console.log(`${epId}#${ep}?token=${token}`, result);

        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ error: "Failed to fetch episode sources", message: error });
    }
};

const animekaiSearch = async (req, res) => {
    const { query } = req.query;
    try {
        const result = await animekai.search(query);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: `Failed to search ${query}`, error: error });
    }
};

export default { animekaiInfo, animekaiWatch, animekaiSearch };
