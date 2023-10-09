const express = require('express');
require('dotenv').config();
const { PORT } = require('./env');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const routes = require('./routes/routes');
app.use(routes);

app.listen(PORT, () => {
    console.log('Application listening at ' + PORT);
});