import { MANGA } from "@consumet/extensions";

const mangadex = new MANGA.MangaDex();

const getMangaDexInfo = async (req, res) => {
    const id = req.params.id;

    if (id === undefined || id === null) {
        return res.status(400).send({ message: "No id provided" });
    }

    try {
        const result = await mangadex
            .fetchMangaInfo(id)
            .catch((err) => reply.status(404).send({ message: err.message }));

        return res.status(200).send(result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "could not get chapter ", error });
    }
};

export default {
    getMangaDexInfo,
};
