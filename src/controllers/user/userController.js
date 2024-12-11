import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const fetchListByStatus = async (req, res) => {
    const { access_token, userId, status, type, page, perPage } = req.query;

    if (!access_token || !userId) {
        return res.status(400).json({ error: "Token and username are required" });
    }

    const query = `
          query ($userId: Int, $page: Int, $perPage: Int, $status: MediaListStatus $type: MediaType) {
            Page(page: $page, perPage: $perPage) {
              pageInfo {
                total
                currentPage
                lastPage
                hasNextPage
                perPage
              }
              mediaList(userId: $userId, type: $type, status: $status) {
                id
                progress
                progressVolumes
                score
                status
                media {
                  id
                  idMal
                  title {
                    romaji
                    english
                    native
                    userPreferred
                  }
                  coverImage {
                    large
                    color
                  }
                  bannerImage
                  episodes
                  status
                  averageScore
                  meanScore
                  format
                  description
                  duration
                  season
                  seasonYear
                  startDate {
                    year
                    month
                    day
                  }
                  endDate {
                    year
                    month
                    day
                  }
                  genres
                  synonyms
                }
              }
            }
          }
`;

    const variables = {
        userId: parseInt(userId),
        status: status.toUpperCase(),
        type: type.toUpperCase(),
        page,
        perPage,
    };

    try {
        const response = await axios.post(
            process.env.ANILIST_API_URL,
            { query, variables },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const userList = response.data.data.Page;
        const pageInfo = {
            total: userList.pageInfo.total, // Rename total to totalItems
            itemsPerPage: userList.pageInfo.perPage, // Rename perPage to itemsPerPage
            currentPage: userList.pageInfo.currentPage,
            hasNext: userList.pageInfo.hasNextPage, // Rename hasNextPage to hasNext
        };

        const results = response.data.data.Page.mediaList.map((list) => ({
            name: list.name,
            mediaStatus: list.status,
            progress: list.progress,
            progressVolumes: list.progressVolumes,
            score: list.score,
            //
            malId: list.media.idMal, // Rename idMal to malId
            id: list.media.id, // Rename id to anilistId
            title: list.media.title,
            image: list.media.coverImage.large, // Rename coverImage to cover
            cover: list.media.bannerImage, // Rename bannerImage to banner
            episodes: list.media.episodes,
            status:
                list.media.status == "RELEASING"
                    ? "ONGOING"
                    : list.media.status == "FINISHED"
                    ? "COMPLETED"
                    : list.media.status == "NOT_YET_RELEASED"
                    ? "NOT_YET_AIRED"
                    : list.media.status == "CANCELLED"
                    ? "CANCELLED"
                    : list.media.status == "HIATUS"
                    ? "HIATUS"
                    : "UNKNOWN",
            rating: list.media.averageScore, // Rename averageScore to score
            format: list.media.format,
            description: list.media.description,
            duration: list.media.duration,
            season: list.media.season,
            releaseDate: list.media.seasonYear,
            startDate: list.media.startDate,
            endDate: list.media.endDate,
            genres: list.media.genres,
            synonyms: list.media.synonyms,
        }));

        const modifiedResponse = {
            pageInfo,
            results,
        };

        // res.json(response.data);
        return res.status(200).json(modifiedResponse);
        // res.json(response.data.data.MediaListCollection);
    } catch (error) {
        console.error("Error fetching animelist:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch anime list" });
    }
};

export default {
    fetchListByStatus,
};
