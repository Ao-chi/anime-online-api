import express from "express";
import bodyParser from "body-parser";
import routes from "./routes/metaRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;
const { metaRouter } = routes;

app.use(bodyParser.json());
app.use("/api.animeonline/", metaRouter);

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));
