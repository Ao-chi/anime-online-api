import { META } from "@consumet/extensions";
import { PROVIDERS_LIST } from "@consumet/extensions";
import axios from "axios";
import { anilistMangaQuery, anilistTrendingMangaQuery } from "../../utils/anilist-queries.js";

let manga = new META.Anilist.Manga();

const ANIFY_BASE_URL = "https://anify.eltik.cc";

const MangaInfo = async (req, res) => {
    const id = req.params.id;
    const provider = req.query.provider || "mangasee";
    // baseURL: "https://goodproxy.goodproxy.workers.dev/fetch",
    // console.log(id, provider);

    if (id === undefined || id === null) {
        return res.status(400).send({ message: "No id provided" });
    }

    switch (provider) {
        case "mangasee":
            console.log("yes provider", provider);

            const possibleProvider = PROVIDERS_LIST.MANGA.find(
                (p) => p.name.toLowerCase() === provider.toLowerCase()
            );

            possibleProvider.setProxy({
                url: "https://goodproxy.goodproxy.workers.dev/fetch?url=",
            });
            manga = new META.Anilist.Manga(possibleProvider);
            break;

        default:
            console.log("not mangasee, provider is:", provider);
            const possibleProvider1 = PROVIDERS_LIST.MANGA.find(
                (p) => p.name.toLowerCase() === provider.toLowerCase()
            );
            manga = new META.Anilist.Manga(possibleProvider1);

            break;
    }
    // if (provider) {
    //     const possibleProvider = PROVIDERS_LIST.MANGA.find(
    //         (p) => p.name.toLowerCase() === provider.toLowerCase()
    //     );

    //     possibleProvider?.setProxy({
    //         url: "https://goodproxy.goodproxy.workers.dev/fetch",
    //     });
    //     manga = new META.Anilist.Manga(possibleProvider);
    // } else {
    //     console.log("no provider");

    //     manga = new META.Anilist.Manga();
    // }

    try {
        const result = await manga.fetchMangaInfo(id);
        // console.log(manga.client.get);
        return res.status(200).send(result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "could not get manga info", error: error });
    }
};

const MangaRead = async (req, res) => {
    const chapterId = req.query.chapterId;
    const mangaId = req.query.mangaId;
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
            .fetchChapterPages(chapterId, mangaId)
            .catch((err) => reply.status(404).send({ message: err.message }));

        return res.status(200).send(result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "could not get chapter ", error });
    }
};

const getTtrendingManga = async (req, res) => {
    const { page = 1, perPage = 12, type = "MANGA", countryOfOrigin = "JP" } = req.query;

    try {
        const response = await axios.post(process.env.ANILIST_API_URL, {
            query: anilistTrendingMangaQuery,
            variables: {
                page: parseInt(page),
                perPage: parseInt(perPage),
                type: type.toUpperCase(),
                countryOfOrigin: countryOfOrigin,
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

const getRecentManga = async (req, res) => {
    const { page = 1, perPage = 12, type = "manga" } = req.query;

    try {
        const response = await axios.get(`${ANIFY_BASE_URL}/recent`, {
            params: { type, page, perPage },
        });

        return res.status(200).send(response.data);
    } catch (error) {
        return res.status(500).send({
            message: "Failed to get Recent Manga",
            error: error.response?.data || error.message,
        });
    }
};

const getPopularManga = async (req, res) => {
    const {
        page = 1,
        perPage = 20,
        type = "MANGA",
        sort = "POPULARITY_DESC",
        countryOfOrigin = "JP",
    } = req.query;

    try {
        const sortArray = Array.isArray(sort)
            ? sort.map((s) => s.toUpperCase()) // If already an array, map each value to uppercase
            : sort.split(",").map((s) => s.trim().toUpperCase());

        const response = await axios.post(process.env.ANILIST_API_URL, {
            query: anilistMangaQuery,
            variables: {
                page: parseInt(page),
                perPage: parseInt(perPage),
                type: type.toUpperCase(),
                sort: sortArray,
                countryOfOrigin: countryOfOrigin,
            },
        });

        const magaPopular = response.data.data.Page;
        const pageInfo = {
            total: magaPopular.pageInfo.total, // Rename total to totalItems
            itemsPerPage: magaPopular.pageInfo.perPage, // Rename perPage to itemsPerPage
            currentPage: magaPopular.pageInfo.currentPage,
            hasNext: magaPopular.pageInfo.hasNextPage, // Rename hasNextPage to hasNext
        };

        const results = magaPopular.media.map((anime) => ({
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
            .send({ message: "Something went wrong, unable to get POPULAR Manga", error: error });
    }
};

export default {
    MangaInfo,
    MangaRead,
    getTtrendingManga,
    getRecentManga,
    getPopularManga,
};
