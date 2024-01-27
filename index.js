import express from "express";
import bodyParser from "body-parser";
import routes from "./routes/metaRoutes.js";

const app = express();
const port = process.env.PORT || 3001;
const { metaRouter } = routes;

app.use(bodyParser.json());
app.use("/api.animeonline/", metaRouter);

app.listen(port, () => console.log(`Server running on port: http://localhost:${port}`));
