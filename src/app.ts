import express from "express";
import fs from "fs";
import cors from "cors";
import http from "http";
import https from "https";
import dotenv from "dotenv";
import connectDb from "./connectDb"

dotenv.config({path : `.env.${process.env.NODE_ENV}`});
const app = express();
const { MONGO_URI } = process.env;

const options = {
  key: fs.readFileSync('./privkey.pem'),
  cert: fs.readFileSync('./cert.pem'),
  ca: fs.readFileSync('./chain.pem'),
};

app.use(cors());
app.use(express.json());
app.use(express.static("public/"));
app.use(express.urlencoded({ extended: true }));

async function main() {
  try {
    const con = await connectDb(MONGO_URI as string);
    https.createServer(options, app).listen(443, () => {
      console.log(`app listening on port 443 using https`)
    })

    http.createServer((req, res) => {
      res.writeHead(301, { "Location": `https://${req.headers.host}${req.url}` });
      res.end();
    }).listen(80);
  } catch (e) {
    console.log(e);
  }
}

async function devMain() {
  try {
    const con = await connectDb(MONGO_URI as string);
    app.listen(80, () => {
      console.log(`app listening on port 80 using http`)
    })

  } catch (e) {
    console.log(e);
  }
}

if(process.env.NODE_ENV === "production") main();
else {
  devMain();
}