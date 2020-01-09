'use strict';

require('dotenv').config();

const CATEGORIES = require(__dirname + "/category.json");
const request = require(__dirname + "/request.js");
const pcess = require(__dirname + "/process.js");
const send = require(__dirname + "/export.js");
const cpress = require(__dirname + "/compress.js");
const fs = require("fs");
let manifest = {
    meta: {
        available: 0,
        total: 0,
        allExcess: []
    }
};

async function start() {
    await pass();
    await cpress.collectAndCompress();

    fs.writeFile(__dirname + "/manifest.json", JSON.stringify(manifest,null,2),function(){
        console.log("Finished")
    });
}

async function pass(){
    return new Promise( async resolve => {

        let toCheck = [];

        Object.keys(CATEGORIES).map(masterCat => {
            let matCat = CATEGORIES[masterCat].map(cat => {
                toCheck.push({masterCat: masterCat, cat: cat});
            });
        });

        while (toCheck.length > 0) {
            for (let item of toCheck) {
                await scrape(item.masterCat,item.cat)
            }
            toCheck = countMisses(manifest)
        }
        resolve()
    })
}

function countMisses(parsedResults){
    let missesArray = [];

    for(let masterCat of Object.keys(parsedResults)){
        if(masterCat === "meta"){
            break;
        }else{
            for(let cat of Object.keys(parsedResults[masterCat])){
                if(cat == "available" || cat == "total") {
                    break;
                }else{
                    if (parsedResults[masterCat][cat].excess.length <= 0) {

                        let total = parsedResults[masterCat][cat].total;
                        let available = parsedResults[masterCat][cat].available;

                        if ((available - total) > 10) {
                            missesArray.push({
                                masterCat: masterCat,
                                cat: cat
                            })
                        }
                    }
                }
            }
        }
    }

    return missesArray;
}

async function scrape(masterCategory,cat){
    if(!manifest.hasOwnProperty(masterCategory)){
        manifest[masterCategory] = {
            available:0,
            total:0
        };
    }
    manifest[masterCategory][cat]={
        available:0,
        total:0,
        excess:[]
    };
    return new Promise(async resolve => {

        let totalResults = 0;
        let finalResults = [];
        let searchObject = {
            catSub: cat,
            catMain: masterCategory,
            page: 0,
            minPrice: 0,
            maxPrice: 999999999
        };

        let searchObjectArray = [searchObject];

        for (let so of searchObjectArray) {
            console.clear();
            console.log("searching " + masterCategory + " - " + cat + ". page: " + searchObjectArray.indexOf(so) + "/" + searchObjectArray.length);
            let moveOn = true;

            while (moveOn && so.page <= 50) {

                let info = await request.getRequest(so)
                    .then(async res => {

                        if(so.maxPrice === so.minPrice) {
                            if (so.page === 0 && res.totalResultCount > 5000) {

                                manifest[masterCategory][cat].excess.push({
                                    price_range: so.minPrice + "/" + so.maxPrice,
                                    results: res.totalResultCount
                                });

                                manifest.meta.allExcess.push({
                                    cat: cat,
                                    mainCat: masterCategory,
                                    price_range: so.minPrice + "/" + so.maxPrice,
                                    results: res.totalResultCount
                                })
                            }
                        }

                        if(searchObjectArray.indexOf(so) === 0){
                            if(so.page === 0) {

                                manifest[masterCategory].available = manifest[masterCategory].available + res.totalResultCount;
                                manifest[masterCategory][cat].available = res.totalResultCount;
                                manifest.meta.available = manifest.meta.available + parseInt(res.totalResultCount);
                            }
                        }


                        if (res.totalResultCount <= 5000 || so.minPrice === so.maxPrice) {

                            let difference = res.totalResultCount - (so.page * 100);

                            if (difference > 100)
                                difference = 100;

                            if ((Math.abs(res.listings.length - difference) > 2) && res.listings.length !== 0) {
                                console.log("ERROR: MISS");
                            } else {

                                let results = await pcess.doProcess(res);

                                for (let r of results) {
                                    finalResults.push(r);
                                }

                                so.page++;

                                totalResults = totalResults + res.listings.length;

                                if (res.listings.length < 100) {
                                    if(Math.abs(res.listings.length - difference) < 2){
                                        moveOn = true
                                    }else{
                                        moveOn = false;
                                    }
                                }
                            }
                        }else
                            {
                                let newPriceRange = (so.maxPrice - so.minPrice) / 2;

                                let highSO = {
                                    catSub: cat,
                                    catMain: masterCategory,
                                    page: 0,
                                    minPrice: so.minPrice,
                                    maxPrice: Math.floor(so.minPrice + newPriceRange)
                                };

                                let lowSO = {
                                    catSub: cat,
                                    catMain: masterCategory,
                                    page: 0,
                                    minPrice: Math.floor(so.maxPrice - newPriceRange),
                                    maxPrice: so.maxPrice
                                };

                                if (!containsValues(searchObjectArray, highSO.maxPrice, highSO.minPrice)) {
                                    searchObjectArray.push(highSO);
                                }
                                if (!containsValues(searchObjectArray, lowSO.maxPrice, lowSO.minPrice)) {
                                    searchObjectArray.push(lowSO);
                                }
                                moveOn = false;
                        }
                    })
                    .catch(e => {
                        console.log(e)
                    })
            }
        }

        manifest[masterCategory].total = totalResults;
        manifest[masterCategory][cat].total = totalResults;
        manifest.meta.total = manifest.meta.total + parseInt(totalResults);
        await send.send(cat,finalResults)
            .catch((e) => {
                console.log(e)
            })
            .then(() => {
                resolve()
            });

    });
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

function containsValues(arr, high, low) {
    let array = arr.some((el) =>{
        if(el.maxPrice === high && el.minPrice === low){
            return el
        }
    });

    return array
}

exports.handler = async (event) => {

    await start();
    return;
};



start();