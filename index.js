const express = require('express');
require('dotenv').config();
const { PORT } = require('./env');

const app = express();

app.use(express.json());

const routes = require('./routes/routes');
app.use(routes);

app.listen(PORT, () => {
    console.log('Application listening at ' + PORT);
});