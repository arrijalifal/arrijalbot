import fs = require("fs");
import { HttpClient } from "typed-rest-client/HttpClient";

async function run() {
    const client = new HttpClient("clientTest");
    const response = await client.get("https://some.server.of.mine.com/largeImage.png");
    const filePath = "C:\\temp\\downloadedFile.png";
    const file: NodeJS.WritableStream = fs.createWriteStream(filePath);
    
    if (response.message.statusCode !== 200) {
        const err: Error = new Error(`Unexpected HTTP response: ${response.message.statusCode}`);
        err["httpStatusCode"] = response.message.statusCode;
        throw err;
    }

    return new Promise((resolve, reject) => {
        file.on("error", (err) => reject(err));

        const stream = response.message.pipe(file);

        stream.on("close", () => {
            try { resolve(filePath); } catch (err) {
                reject(err);
            }
        });
    });
}

run();