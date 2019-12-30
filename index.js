'use strict';

require('dotenv').config();

const CATEGORIES = require(__dirname + "/category.json");
const request = require(__dirname + "/request.js");
const pcess = require(__dirname + "/process.js");
const send = require(__dirname + "/export.js");
const fs = require("fs");

async function start(){

    return new Promise( async resolve => {

    for(let masterCategory of Object.keys(CATEGORIES)){

        for(let cat of CATEGORIES[masterCategory]){
            await new Promise(async resolve => {
                let stream = await fs.createWriteStream(__dirname + '/results.csv', {flags: 'a'});
                stream.write("CATEGORYID,DATE,I_L1CATEGORYID,I_L1CATEGORYNAME,I_L2CATEGORYID,I_L2CATEGORYNAME,ID,LOC_ABROAD,LOC_CITYNAME,LOC_ISBUYERLOCATION,LOC_ONCOUNTRYLEVEL,NAPAVAILABLE,PAGE,PAGELOCATION,PRICE,PRICETYPE,PRIORITYPRODUCT,SELLERID,SELLERNAME,SELLERSHOWSOIURL,SELLERSHOWWEBSITEURL,SELLERWEBSITEURL,TITLE,URGENCYFEATUREACTIVE,URL,VIDEOONVIP");

                if (CATEGORIES[masterCategory].indexOf(cat) < 2) {
                    resolve()
                }else {
                    let searchObject = {
                        catSub: cat,
                        catMain: masterCategory,
                        page: 0,
                        minPrice: 0,
                        maxPrice: 999999999,
                        extraID: ""
                    };

                    let searchObjectArray = [searchObject];
                    let subdivided = false;

                    for (let so of searchObjectArray) {
                        console.clear();
                        console.log("Searching: " + searchObjectArray.indexOf(so) + "/" + searchObjectArray.length);
                        let moveOn = true;
                        let subdivided = true;

                        while (moveOn && so.page <= 50 && subdivided) {
                            let info = await request.getRequest(so)
                                .then(res => {
                                    if (res.totalResultCount <= 5000 || so.extraID !== "") {
                                        pcess.doProcess(res, stream);
                                        so.page++;
                                        if (res.listings.length < 100) {
                                            moveOn = false;
                                        }
                                    } else {
                                        let newPriceRange = (so.maxPrice - so.minPrice) / 2;

                                        let highSO = {
                                            catSub: cat,
                                            catMain: masterCategory,
                                            page: 0,
                                            minPrice: so.minPrice,
                                            maxPrice: Math.floor(so.minPrice + newPriceRange),
                                            extraID: ""
                                        };

                                        let lowSO = {
                                            catSub: cat,
                                            catMain: masterCategory,
                                            page: 0,
                                            minPrice: Math.floor(so.maxPrice - newPriceRange),
                                            maxPrice: so.maxPrice,
                                            extraID: ""
                                        };

                                        let priceArray = ['offeredSince:Een week', 'offeredSince:Gisteren', 'offeredSince:Vandaag'];

                                        if (!containsValues(searchObjectArray, highSO.maxPrice, highSO.minPrice)) {
                                            searchObjectArray.push(highSO);
                                        } else {
                                            for (let price of priceArray) {
                                                highSO['extraID'] = price;
                                                searchObjectArray.push(highSO);
                                            }
                                        }
                                        if (!containsValues(searchObjectArray, lowSO.maxPrice, lowSO.minPrice)) {
                                            searchObjectArray.push(lowSO);
                                        } else {
                                            for (let price of priceArray) {
                                                lowSO['extraID'] = price;
                                                searchObjectArray.push(lowSO);
                                            }
                                        }
                                        subdivided = false;
                                        //searchObjectArray.splice(searchObjectArray.indexOf(so), 1);
                                    }
                                })
                                .catch(e => {
                                    console.log(e)
                                })
                        }
                    }
                    await send.send(cat)
                        .catch((e) => {
                            console.log(e)
                        })
                        .then(() => {
                            resolve()
                        });
                }
            });
        }

    }
    resolve()
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