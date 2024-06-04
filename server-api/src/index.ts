// import http from 'http';
import express, { Request, Response } from "express";
require('dotenv').config();
const fileupload = require("express-fileupload");
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3001;

import { authenticate } from "./routers/auth";
import userRouter from './routers/user'
import patientRouter from './routers/patient'
app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({limit: '25mb', extended: true}));
app.options('*', cors());
app.use(cors());
app.use(express.json());
app.use(fileupload());
app.use(express.static("files"));

app.use(authenticate);

app.use("/user", userRouter)
app.use("/patient", patientRouter)

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


