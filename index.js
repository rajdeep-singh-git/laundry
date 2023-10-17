const express = require('express');
require('dotenv').config();
const { PORT } = require('./env');
const cors = require('cors');
const routes = require('./routes/routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(routes);

app.listen(PORT, () => {
    console.log('Application listening at ' + PORT);
});