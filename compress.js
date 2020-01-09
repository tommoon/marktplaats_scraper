'use strict';
let fs = require('fs');
var csv = require("fast-csv");

module.exports = {
    collectAndCompress:async () => {

        let files = fs.readdirSync(__dirname + "/results/");

        let numberOfStreams = Math.ceil(files.length/200);

        let count = 0;
        let rowcount = 0;

        for(let i = 0; i < numberOfStreams; i++){

            let csvStream = csv.format({
                renameHeaders: true,
                delimiter: ";",
                headers: [
                    'CATEGORYID', 'DATE', 'I_L1CATEGORYID', 'I_L1CATEGORYNAME', 'I_L2CATEGORYID', 'I_L2CATEGORYNAME', 'ID', 'LOC_ABROAD', 'LOC_CITYNAME',
                    'LOC_ISBUYERLOCATION', 'LOC_ONCOUNTRYLEVEL', 'NAPAVAILABLE', 'PAGE', 'PAGELOCATION', 'PRICE', 'PRICETYPE', 'PRIORITYPRODUCT', 'SELLERID',
                    'SELLERNAME', 'SELLERSHOWSOIURL', 'SELLERSHOWWEBSITEURL', 'SELLERWEBSITEURL', 'TITLE', 'URGENCYFEATUREACTIVE', 'URL', 'VIDEOONVIP'
                ]
            });

            let writableStream = fs.createWriteStream(__dirname + "/finalResults/" + i + "_finalResults.csv");
            csvStream.pipe(writableStream);

            let start = i * 200;
            let end = start + 200;

            for (let j = start; j < end; j++) {
                await new Promise((rs) => {

                    if (j < files.length) {
                        let path = files[j];

                        if (path !== ".DS_Store") {
                            let readStream = fs.createReadStream(__dirname + "/results/" + path);
                            csv
                                .parseStream(readStream, {headers: false, delimiter: ";"})
                                .on('error', error => console.error(error))
                                .on('data', row => csvStream.write(row))
                                .on('end', rc => {
                                    count++;

                                    rowcount += rc;

                                    console.log(count.toString() + "/" + (files.length - 1).toString() + " (" + (j - parseInt(start)) +"/" + 200 + ") " + path + " ROWS: " + rowcount);

                                    if(j === (parseInt(end) - 1)){
                                        writableStream.close()
                                    }
                                    rs()
                                });
                        }else{
                            rs()
                        }
                    }
                })
            }
            console.log('streaming ' + i + ' DONE!');
        }
    }
}