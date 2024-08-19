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
        const accessToken = response.data.access_token;
        res.json({ accessToken });
    } catch (error) {
        console.log(error.response.data, "new err");

        res.status(500).json({ error: error.response.data });
    }
};

export default {
    redirectToAniList,
    handleCallback,
};
