const http = require('http')
const express = require('express');
const app = express();
const cors = require('cors');
const fileupload = require("express-fileupload");
const bodyParser = require('body-parser');

const heliaOps = require('./helia_ops')

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.options('*', cors());
app.use(cors());
app.use(fileupload());
app.use(express.static("files"));
app.use(bodyParser.json());

const PORT = 5001

app.use("/ipfs", heliaOps)

// Error handling
app.use((req, res) => res.status(404).send("Router not found"))

var server = http.createServer(app).listen(PORT, async () => {
    console.log(`IPFS server is listening at post:${PORT}`)
})

