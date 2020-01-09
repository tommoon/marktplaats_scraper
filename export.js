'use strict';
const fs = require('fs');
const AWS = require('aws-sdk');
var csv = require("fast-csv");

const s3 = new AWS.S3({
    accessKeyId: 'guest4',
    secretAccessKey: 'guest4guest4'
});

module.exports = {
    send: (cat,results) => {
        return new Promise(async (resolve, reject) => {
            if (process.env.LOCAL) {
                saveToLocal(cat,results)
                    .then(() => {
                        resolve()
                    })
                    .catch((e) => {
                        reject(e)
                    })
            } else {
                sendToS3(cat,results)
                    .then(() => {
                        resolve()
                    })
                    .catch((e) => {
                        reject(e)
                    })
            }
        })
    }
};

function sendToS3 (cat,results) {
    return new Promise((resolve, reject) => {
        results = results.join("\n");
        const params = {
                Bucket: 'daybat4', // pass your bucket name
                Key: cat + '.csv', // file will be saved as testBucket/contacts.csv
                Body: results
            };
            s3.upload(params, async function(s3Err, data) {
                if (s3Err) {
                    reject()
                }
                console.log(`File uploaded successfully at ${data.Location}`);
                resolve()
            });

    })
}

function saveToLocal (cat, results) {
    return new Promise( async (resolve) => {

        csv
            .writeToPath(__dirname + "/results/" + cat + ".csv",results,
                {
                    headers: false,
                    delimiter:";"
                })
            .on('finish', () =>resolve())

    })
}