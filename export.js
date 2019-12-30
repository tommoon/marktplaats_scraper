'use strict';
const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: 'guest4',
    secretAccessKey: 'guest4guest4'
});

module.exports = {
    send: (cat) => {
        return new Promise(async (resolve, reject) => {
            if (process.env.LOCAL) {
                saveToLocal(cat)
                    .then(() => {
                        resolve()
                    })
                    .catch((e) => {
                        reject(e)
                    })
            } else {
                sendToS3(cat)
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

function sendToS3 (cat) {
    return new Promise((resolve, reject) => {
        fs.readFile(__dirname + "/results.csv",'utf-8', (err, data) => {
            if (err) throw err;
            const params = {
                Bucket: 'daybat4', // pass your bucket name
                Key: cat + '.csv', // file will be saved as testBucket/contacts.csv
                Body: data
            };
            s3.upload(params, async function(s3Err, data) {
                if (s3Err) {
                    reject()
                }
                console.log(`File uploaded successfully at ${data.Location}`)
                await fs.unlinkSync(__dirname + "/results.csv")
                resolve()
            });
        });
    })
}

function saveToLocal (cat) {
    return new Promise( async (resolve, reject) => {
        let results = await fs.readFileSync(__dirname + "/results.csv",'utf-8');
        await fs.writeFileSync(__dirname + "/results/" + cat + "_results.csv", results);
        await fs.unlinkSync(__dirname + "/results.csv")
        resolve()
    })
}