import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import routes from "./routes/metaRoutes.js";
import cors from "cors";
import cron from "./cron.js";
import axios from "axios";

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
const { metaRouter } = routes;

app.use(
    cors({
        origin: "*",
    })
);
app.use(bodyParser.json());
app.use("/api.animeonline/", metaRouter);
// app.use(metaRouter);

app.listen(port, () => console.log(`Server running on port: http://localhost:${port}`));
cron.job.start();
// export default app;
