import { META } from "@consumet/extensions";
import { PROVIDERS_LIST } from "@consumet/extensions";
import axios from "axios";
import { anilistTrendingMangaQuery } from "../../utils/anilist-queries.js";

let manga = new META.Anilist.Manga();

const MangaInfo = async (req, res) => {
    const id = req.params.id;
    const provider = req.query.provider;

    if (provider) {
        const possibleProvider = PROVIDERS_LIST.MANGA.find(
            (p) => p.name.toLowerCase() === provider.toLowerCase()
        );
        manga = new META.Anilist.Manga(possibleProvider);
    } else {
        manga = new META.Anilist.Manga();
    }

    if (id === undefined || id === null) {
        return res.status(400).send({ message: "No id provided" });
    }

    try {
        const result = await manga.fetchMangaInfo(id);
        // console.log(result);
        return res.status(200).send(result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "could not get manga info" });
    }
};

const MangaRead = async (req, res) => {
    const chapterId = req.query.chapterId;
    const provider = req.query.provider;

    if (provider) {
        const possibleProvider = PROVIDERS_LIST.MANGA.find(
            (p) => p.name.toLowerCase() === provider.toLowerCase()
        );
        manga = new META.Anilist.Manga(possibleProvider);
    } else {
        manga = new META.Anilist.Manga();
    }

    if (chapterId === undefined || chapterId === null) {
        return res.status(400).send({ message: "No chapterId provided" });
    }

    try {
        const result = await manga
            .fetchChapterPages(chapterId)
            .catch((err) => reply.status(404).send({ message: err.message }));

        return res.status(200).send(result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "could not get chapter ", error });
    }
};

const getTtrendingManga = async (req, res) => {
    const { page = 1, perPage = 12, type = "MANGA" } = req.query;

    try {
        const response = await axios.post(process.env.ANILIST_API_URL, {
            query: anilistTrendingMangaQuery,
            variables: {
                page: parseInt(page),
                perPage: parseInt(perPage),
                type: type.toUpperCase(),
            },
        });

        const mangaTrending = response.data.data.Page;
        const pageInfo = {
            total: mangaTrending.pageInfo.total, // Rename total to totalItems
            itemsPerPage: mangaTrending.pageInfo.perPage, // Rename perPage to itemsPerPage
            currentPage: mangaTrending.pageInfo.currentPage,
            hasNext: mangaTrending.pageInfo.hasNextPage, // Rename hasNextPage to hasNext
        };

        const results = mangaTrending.media.map((anime) => ({
            malId: anime.idMal, // Rename idMal to malId
            id: anime.id, // Rename id to anilistId
            title: anime.title,
            image: anime.coverImage.large, // Rename coverImage to cover
            cover: anime.bannerImage, // Rename bannerImage to banner
            chapters: anime.chapters,
            status:
                anime.status == "RELEASING"
                    ? "ONGOING"
                    : anime.status == "FINISHED"
                    ? "COMPLETED"
                    : anime.status == "NOT_YET_RELEASED"
                    ? "NOT_YET_AIRED"
                    : anime.status == "CANCELLED"
                    ? "CANCELLED"
                    : anime.status == "HIATUS"
                    ? "HIATUS"
                    : "UNKNOWN",
            rating: anime.averageScore, // Rename averageScore to score
            format: anime.format,
            description: anime.description,
            duration: anime.duration,
            season: anime.season,
            releaseDate: anime.seasonYear,
            startDate: anime.startDate,
            endDate: anime.endDate,
            genres: anime.genres,
            synonyms: anime.synonyms,
        }));

        const modifiedResponse = {
            pageInfo,
            results,
        };

        return res.status(200).json(modifiedResponse);
    } catch (error) {
        console.log(error);

        return res
            .status(500)
            .send({ message: "Something went wrong, unable to get Trending Manga", error: error });
    }
};

export default {
    MangaInfo,
    MangaRead,
    getTtrendingManga,
};
