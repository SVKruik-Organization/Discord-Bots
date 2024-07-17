// Dependencies
const express = require("express");
const logger = require('./utils/logger.js');
const modules = require('.');
const jwtSecret = process.env.SERVER_SECRET;
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const jwtUtils = require('./utils/jwt.js');
const config = require('./assets/config.js');

// Express Settings
const port = process.env.SERVER_PORT;
const app = express();
const cors = require("cors");
app.use(express.json());
const prefix = process.env.SERVER_PREFIX;
app.use(logger.apiMiddleware);

// CORS Config
const corsOptions = {
    origin: ["https://bots.stefankruik.com"],
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// Init
app.listen(port, () => {
    logger.log(`Update server listening on port ${port}.`, "info");
});

// Import Other Routes
const sensorRoutes = require('./routes/sensorRoutes.js');
app.use(`${prefix}/sensors`, sensorRoutes);
const guildRoutes = require('./routes/guildRoutes.js');
app.use(`${prefix}/guilds`, guildRoutes);
const broadcastRoutes = require('./routes/broadcastRoutes.js');
app.use(`${prefix}/broadcasts`, broadcastRoutes);

// Default
app.get(prefix, jwtUtils.authenticateJWT, (req, res) => {
    res.json({ message: `Authenticated Default ${config.general.name} Endpoint` });
});

// JWT Login
app.post(`${prefix}/login`, (req, res) => {
    const { username, password } = req.body;

    modules.database.query("SELECT operator.id, operator.snowflake, operator.username AS 'operator_username', user_general.username AS 'user_username', email, password, service_tag, operator.date_creation, operator.date_update FROM operator LEFT JOIN user_general ON operator.snowflake = user_general.snowflake WHERE operator.username = ?;", [username])
        .then((data) => {
            // Setup
            if (data.length === 0) return res.status(404).send({ message: "Not Found" });
            const rawOperator = data[0];
            if (CryptoJS.SHA512(password).toString() !== rawOperator.password) return res.status(401).send({ message: "Unauthorized" });

            modules.client.users.fetch(rawOperator.snowflake).then((userData) => {
                const access_token = jwt.sign({
                    "id": rawOperator.id,
                    "snowflake": rawOperator.snowflake,
                    "operator_username": rawOperator.operator_username,
                    "user_username": rawOperator.user_username,
                    "email": rawOperator.email,
                    "service_tag": rawOperator.service_tag,
                    "avatar": userData.avatarURL(),
                    "date_creation": rawOperator.date_creation,
                    "date_update": rawOperator.date_update,
                }, jwtSecret, { "expiresIn": process.env.SERVER_SECRET_EXPIRY });
                return res.json({ access_token });
            }).catch((error) => {
                logger.error(error);
                return res.sendStatus(error.status);
            });
        }).catch((error) => {
            logger.error(error);
            return res.sendStatus(500)
        });
});
