'use strict';

let request = require("request");

module.exports = {
    getRequest: (opts) => {
        return new Promise((resolve, reject) => {
            let offset = opts.page * 100;
            let options = {
                url: "https://www.marktplaats.nl/lrp/api/search?attributeRanges[]=PriceCents%3A" + opts.minPrice + "%3A" + opts.maxPrice + "&l1CategoryId=" + opts.catMain + "&l2CategoryId=" + opts.catSub + "&limit=100&offset=" + offset + "&sortBy=SORT_INDEX&sortOrder=DECREASING&attributesByKey[]=" + opts.extraID,
                headers: {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'accept-encoding': 'gzip, deflate, br',
                    'accept-language': 'en-US,en;q=0.9,es;q=0.8',
                    'keep-alive':true,
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36'
                },
                method: 'GET',
                family: 4,
                gzip: true
            };
            request(options, function (error, response, body) {
                if (error) {
                    console.log(error);
                    reject(error)
                }
                try {
                    resolve(JSON.parse(body))
                }catch (e) {
                    reject(body)
                }
            })
        })
    }
};