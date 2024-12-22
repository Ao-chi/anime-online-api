import { ANIME, StreamingServers, VidCloud } from "@consumet/extensions";
let zoro = new ANIME.Zoro();

const zoroInfoRoute = async (req, res) => {
    const aniId = req.params.aniId;
    const isDub = req.query.isDub;

    const result = await zoro.fetchAnimeInfo(aniId, isDub);
    res.status(200).send(result);
};

// const zoroWatchRoute = async (req, res) => {
//     const epId = req.params.epId;
//     const isDub = req.query.isDub;
//     const server = req.query.server || "vidcloud";
//     console.log(`server: ${server}`);

//     const result = await zoro.fetchEpisodeSources(epId, server);
//     res.status(200).send(result);
// };

const zoroWatchRoute = async (req, res) => {
    const epId = req.params.epId;
    const isDub = req.query.isDub;
    const serverList = [
        StreamingServers.VidCloud,
        StreamingServers.StreamSB,
        StreamingServers.StreamTape,
        StreamingServers.VidStreaming,
    ];
    const defaultServer = req.query.server || StreamingServers.VidCloud;

    console.log(`Default server: ${defaultServer}`);

    const zoro = new ANIME.Zoro(); // Assuming you instantiate Zoro here.
    let result = null;

    // Iterate through the servers to find one with valid data.
    for (const server of serverList) {
        try {
            console.log(`Trying server: ${server}`);
            result = await zoro.fetchEpisodeSources(epId, server);
            if (result && Object.keys(result).length > 0) {
                console.log(`Successfully fetched data from: ${server}`);
                break; // Exit the loop if a valid response is found.
            }
        } catch (error) {
            console.error(`Error fetching data from ${server}:`, error.message);
        }
    }

    if (result) {
        return res.status(200).send(result); // Return the valid result.
    } else {
        return res.status(404).send({ error: "No valid sources found." }); // Handle no valid sources.
    }
};

const zoroRecentEpisodes = async (req, res) => {
    const page = req.query.page;

    const result = await zoro.fetchRecentlyUpdated(page);
    res.status(200).send(result);
};

const zoroEpisodeServers = async (req, res) => {
    const epId = req.params.epId;
    const server = req.query.server;
    const result = await zoro.fetchEpisodeServers(epId, isDub, server);
    res.status(200).send(result);
};

export default { zoroInfoRoute, zoroWatchRoute, zoroRecentEpisodes };
