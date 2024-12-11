import { MANGA } from "@consumet/extensions";

const mangakakalot = new MANGA.MangaKakalot();

const getMangakakalotInfo = async (req, res) => {
    const id = req.params.id;

    if (id === undefined || id === null) {
        return res.status(400).send({ message: "No id provided" });
    }

    try {
        const result = await mangakakalot
            .fetchMangaInfo(id)
            .catch((err) => reply.status(404).send({ message: err.message }));

        return res.status(200).send(result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "could not get chapter ", error });
    }
};

const getMangakakalotChapters = async (req, res) => {
    const chapterId = req.params.chapterId;
    const mangaId = req.query.mangaId;

    if (chapterId === undefined || chapterId === null) {
        return res.status(400).send({ message: "No chapterId provided" });
    }

    try {
        const result = await mangakakalot
            .fetchChapterPages(chapterId, mangaId)
            .catch((err) => reply.status(404).send({ message: err.message }));
        // console.log(result);

        return res.status(200).send(result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "could not get chapter ", error });
    }
};

export default {
    getMangakakalotInfo,
    getMangakakalotChapters,
};
