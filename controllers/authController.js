import axios from "axios";

// Handle redirect to AniList authorization
const redirectToAniList = (req, res) => {
    const authUrl = `${process.env.ANILIST_AUTH_URI}?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code`;
    res.redirect(authUrl);
};

// Handle callback and exchange code for access token
const handleCallback = async (req, res) => {
    const { code } = req.body;

    console.log("Authorization code received:", code);
    try {
        const response = await axios.post(
            `${process.env.ANILIST_TOKEN_URI}`,
            {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: "authorization_code",
                redirect_uri: process.env.REDIRECT_URI,
                code,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        // Access token obtained
        const { access_token, refresh_token, token_type } = response.data;
        // console.log(response.data);
        console.log("Received access token:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("Error during token exchange:", error.message);
        console.log(error.response.data, "new err");
        res.status(500).json({ error: error.response.data || error });
    }
};

const fetchUserData = async (token) => {
    const query = `
      query {
        Viewer {
          id
          name
          avatar {
            large
            medium
          }
          bannerImage
          statistics {
            anime {
                count
                episodesWatched
                meanScore
                minutesWatched
              }
          }
        }
      }
    `;

    try {
        // console.log("received", token);
        const response = await axios.post(
            process.env.ANILIST_API_URL,
            { query },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data.data.Viewer;
    } catch (error) {
        console.error("Error fetching user data:", error.response?.data || error.message);
        throw error;
    }
};

const getUserData = async (req, res) => {
    const { access_token } = req.query;

    try {
        const userData = await fetchUserData(access_token);
        res.json(userData);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user data" });
    }
};

export const fetchUserAnimeList = async (req, res) => {
    const { access_token, userId } = req.query;

    if (!access_token || !userId) {
        return res.status(400).json({ error: "Token and username are required" });
    }

    const query = `
      query {
        MediaListCollection(userId: ${userId}, type: ANIME, status: CURRENT) {
          lists {
            name
            status
            entries {
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
      }
    `;

    const variables = {
        userId: parseInt(userId),
    };
    try {
        const response = await axios.post(
            process.env.ANILIST_API_URL,
            { query },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );
        const mediaLists = response.data.data.MediaListCollection.lists.map((list) => ({
            name: list.name,
            status: list.status,
            entries: list.entries.map((entry) => ({
                malId: entry.media.idMal, // Rename idMal to malId
                id: entry.media.id, // Rename id to anilistId
                title: entry.media.title,
                image: entry.media.coverImage.large, // Rename coverImage to cover
                cover: entry.media.bannerImage, // Rename bannerImage to banner
                episodes: entry.media.episodes,
                status:
                    entry.media.status == "RELEASING"
                        ? "ONGOING"
                        : entry.media.status == "FINISHED"
                        ? "COMPLETED"
                        : entry.media.status == "NOT_YET_RELEASED"
                        ? "NOT_YET_AIRED"
                        : entry.media.status == "CANCELLED"
                        ? "CANCELLED"
                        : entry.media.status == "HIATUS"
                        ? "HIATUS"
                        : "UNKNOWN",
                rating: entry.media.averageScore, // Rename averageScore to score
                format: entry.media.format,
                description: entry.media.description,
                duration: entry.media.duration,
                season: entry.media.season,
                releaseDate: entry.media.seasonYear,
                startDate: entry.media.startDate,
                endDate: entry.media.endDate,
                genres: entry.media.genres,
                synonyms: entry.media.synonyms,
            })),
        }));
        res.json({ mediaLists });

        // res.json(response.data.data.MediaListCollection);
    } catch (error) {
        console.error("Error fetching anime list:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch anime list" });
    }
};

const getMediaListStatus = async (req, res) => {
    const { access_token, userId, mediaId } = req.query;

    if (!access_token || !userId || !mediaId) {
        return res.status(400).json({ error: "Token, userId and id required" });
    }
    // mediaId is the animeId
    const query = `
       query  {
            MediaList(userId: ${userId}, mediaId: ${mediaId}) {
                id
                status
                progress
                score
                startedAt{
                    year
                    month
                    day
                }
                completedAt{
                    year
                    month
                    day
                }
                updatedAt
                notes
            }
        }
    `;
    const variables = {
        userId: parseInt(userId),
        mediaId: parseInt(mediaId),
    };
    try {
        const response = await axios.post(
            process.env.ANILIST_API_URL,
            { query },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const mediaList = response.data.data.MediaList;

        // if (mediaList && mediaList.status === "CURRENT") {
        //     mediaList.status = "WATCHING";
        // }
        // res.status(200).json(response.data.data.MediaList);
        res.status(200).json(mediaList);
    } catch (error) {
        console.error("Error fetching anime status:", error.response?.data || error.message);
        console.log(error.response?.data.errors[0].status);
        if (error.response?.data.errors[0].status === 404) {
            res.status(404).json(error.response?.data);
        } else res.status(500).json({ error: "Failed to fetch anime status" });
    }
};

const addToMediaListCollection = async (req, res) => {
    const {
        access_token,
        listEntryId,
        mediaId,
        status,
        score,
        progress,
        repeat,
        isPrivate,
        notes,
        startedAt,
        completedAt,
    } = req.query;

    if (!mediaId) return res.status(400).json("mediaId required!");

    let queryFields = `mediaId: ${mediaId}`;

    if (status) queryFields += ` status:${status.toUpperCase()}`;
    if (listEntryId) queryFields += ` id: ${listEntryId}`;
    if (score) queryFields += ` score: ${score}`;
    if (progress) queryFields += ` progress: ${progress}`;
    if (repeat) queryFields += ` repeat: ${repeat}`;
    if (isPrivate) queryFields += ` private: ${isPrivate}`;
    if (notes) queryFields += ` notes: "${notes}"`;
    if (startedAt)
        queryFields += ` startedAt: { year: ${startedAt.year}, month: ${startedAt.month}, day: ${startedAt.day} }`;
    if (completedAt)
        queryFields += ` completedAt: { year: ${completedAt.year}, month: ${completedAt.month}, day: ${completedAt.day} }`;

    const query = `
        mutation {
            SaveMediaListEntry(${queryFields} ){
                id
                mediaId
                status
                score
                progress
                notes
                private
                startedAt {
                    year
                    month
                    day
                }
                completedAt {
                    year
                    month
                    day
                } 
                repeat
            }
        }
    `;

    try {
        const response = await axios.post(
            process.env.ANILIST_API_URL,
            { query },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const mediaListEntry = response.data.data.SaveMediaListEntry;
        res.status(200).json(mediaListEntry);
    } catch (error) {
        console.error("Error saving mediaListEntry:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to save mediaListEntry" });
    }
};

const updateMediaListCollection = async (req, res) => {
    const {
        access_token,
        listEntryId,
        mediaId,
        status,
        score,
        progress,
        repeat,
        isPrivate,
        notes,
        startedAt,
        completedAt,
    } = req.query;

    if (!mediaId || !status) return res.status(400).json("listEntryId / mediaId / status required!");

    let queryFields = `mediaId: ${mediaId}, status: ${status.toUpperCase()}`;

    if (listEntryId) queryFields += ` id: ${listEntryId}`;
    if (score) queryFields += ` score: ${score}`;
    if (progress) queryFields += ` progress: ${progress}`;
    if (repeat) queryFields += ` repeat: ${repeat}`;
    if (isPrivate) queryFields += ` private: ${isPrivate}`;
    if (notes) queryFields += ` notes: "${notes}"`;
    if (startedAt)
        queryFields += ` startedAt: { year: ${startedAt.year}, month: ${startedAt.month}, day: ${startedAt.day} }`;
    if (completedAt)
        queryFields += ` completedAt: { year: ${completedAt.year}, month: ${completedAt.month}, day: ${completedAt.day} }`;

    const query = `
        mutation {
            SaveMediaListEntry(${queryFields} ){
                id
                mediaId
                status
                score
                progress
                notes
                private
                startedAt {
                    year
                    month
                    day
                }
                completedAt {
                    year
                    month
                    day
                } 
                repeat
            }
        }
    `;

    try {
        const response = await axios.post(
            process.env.ANILIST_API_URL,
            { query },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const mediaListEntry = response.data.data.SaveMediaListEntry;
        res.status(200).json(mediaListEntry);
    } catch (error) {
        console.error("Error updating mediaListEntry:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to update mediaListEntry" });
    }
};

const deleteMediaListEntry = async (req, res) => {
    const { access_token, mediaListId } = req.query;
    const query = `
        mutation {
            DeleteMediaListEntry(id:${mediaListId}) {
                deleted
            }
        }
    `;

    try {
        const response = await axios.post(
            process.env.ANILIST_API_URL,
            { query },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const mediaListEntry = response.data.data.DeleteMediaListEntry;
        res.status(200).json(mediaListEntry);
    } catch (error) {
        console.error("Error updating mediaListEntry:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

const toggleFavourites = async (req, res) => {
    const { access_token, animeId } = req.query;

    const query = `
        mutation{
            ToggleFavourite(animeId: ${animeId}){
                anime{
                    nodes  {
                    
                        id
                        idMal
                        title{
                            romaji
                            english
                            native
                            userPreferred
                        }
                    }
                }
            }
        }
    `;
    try {
        const response = await axios.post(
            process.env.ANILIST_API_URL,
            { query },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const favourites = response.data.data.ToggleFavourite;
        res.status(200).json(favourites);
    } catch (error) {
        console.error("Error toggling favourites:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to save/delete favourites" });
    }
};
const getIndividualFavourite = async (req, res) => {
    const { access_token, animeId } = req.query;
    if (!access_token) {
        return res.status(400).json("Access token required!");
    }
    const query = `
        query  {
              Media(id: ${animeId}) {
                    id
                    isFavourite
                  }
        }
    `;

    try {
        const response = await axios.post(
            process.env.ANILIST_API_URL,
            { query },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const favourites = response.data.data.Media;
        res.status(200).json(favourites);
    } catch (error) {
        console.error("Error getting favourite:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to retrieve favourite" });
    }
};

const getFavouritesAnime = async (req, res) => {
    const { access_token } = req.query;

    if (!access_token) {
        return res.status(400).json("Access token required!");
    }

    const query = `
        query {
            Viewer {
                favourites {
                    anime (page: 1, perPage: 30) {
                        pageInfo {
                            total
                            perPage
                            currentPage
                            hasNextPage
                        }
                        nodes {
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
                            
                        }
                    }
                }
            }
        }
    `;

    try {
        const response = await axios.post(
            process.env.ANILIST_API_URL,
            { query },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        // const favourites = response.data.data.Viewer;

        const animeFavourites = response.data.data.Viewer.favourites.anime;

        // Modify the pageInfo structure
        const pageInfo = {
            total: animeFavourites.pageInfo.total, // Rename total to totalItems
            itemsPerPage: animeFavourites.pageInfo.perPage, // Rename perPage to itemsPerPage
            currentPage: animeFavourites.pageInfo.currentPage,
            hasNext: animeFavourites.pageInfo.hasNextPage, // Rename hasNextPage to hasNext
        };

        // Modify the nodes (anime list) structure
        const results = animeFavourites.nodes.map((anime) => ({
            malId: anime.idMal, // Rename idMal to malId
            id: anime.id, // Rename id to anilistId
            title: anime.title,
            image: anime.coverImage.large, // Rename coverImage to cover
            cover: anime.bannerImage, // Rename bannerImage to banner
            episodes: anime.episodes,
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

        // Combine pageInfo and modified nodes into the final response object
        const modifiedResponse = {
            pageInfo,
            results,
        };

        res.status(200).json(modifiedResponse);
    } catch (error) {
        console.error("Error fetching favourite lists:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch favourites list" });
    }
};
export default {
    redirectToAniList,
    handleCallback,
    getUserData,
    fetchUserAnimeList,
    getMediaListStatus,
    addToMediaListCollection,
    toggleFavourites,
    getFavouritesAnime,
    updateMediaListCollection,
    deleteMediaListEntry,
    getIndividualFavourite,
};
