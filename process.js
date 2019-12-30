'use strict';

module.exports = {
    doProcess: (res,stream) => {


        let I_L1CATEGORYID = res.categoriesById[Object.keys(res.categoriesById)[0]].id;
        let I_L1CATEGORYNAME = res.categoriesById[Object.keys(res.categoriesById)[0]].fullName;
        let I_L2CATEGORYID = res.categoriesById[Object.keys(res.categoriesById)[1]].id;
        let I_L2CATEGORYNAME = res.categoriesById[Object.keys(res.categoriesById)[1]].fullName;
        let PAGE = res.searchRequest.pagination.offset;

        for(let item of res.listings){

            let CATEGORYID = item.categoryId;
            let DATE = item.date;
            let ID = item.itemId;
            let LOC_ABROAD = item.location.abroad;
            let LOC_CITYNAME = item.location.cityName;
            let LOC_ISBUYERLOCATION = item.location.isBuyerLocation;
            let LOC_ONCOUNTRYLEVEL = item.location.onCountryLevel;
            let NAPAVAILABLE = item.location.napAvailable;
            let PAGELOCATION = item.pageLocation;
            let PRICE = item.priceInfo.priceCents;
            let PRICETYPE = item.priceInfo.priceType;
            let PRIORITYPRODUCT = item.priorityProduct;
            let SELLERID = item.sellerInformation.sellerId;
            let SELLERNAME = item.sellerInformation.sellerName;
            let SELLERSHOWSOIURL = item.sellerInformation.showSoiUrl;
            let SELLERSHOWWEBSITEURL = item.sellerInformation.showWebsiteUrl;
            let SELLERWEBSITEURL = item.sellerInformation.sellerWebsiteUrl;
            let TITLE = item.title;
            let URGENCYFEATUREACTIVE = item.urgencyFeatureActive;
            let URL = "https://www.marktplaats.nl" + item.vipUrl;
            let VIDEOONVIP = item.videoOnVip;

            let itemString = [
                CATEGORYID,DATE,I_L1CATEGORYID,I_L1CATEGORYNAME,I_L2CATEGORYID, I_L2CATEGORYNAME,ID,LOC_ABROAD,LOC_CITYNAME,
                LOC_ISBUYERLOCATION,LOC_ONCOUNTRYLEVEL,NAPAVAILABLE,PAGE,PAGELOCATION,PRICE,PRICETYPE,PRIORITYPRODUCT,SELLERID,
                SELLERNAME,SELLERSHOWSOIURL,SELLERSHOWWEBSITEURL,SELLERWEBSITEURL,TITLE,URGENCYFEATUREACTIVE,URL,VIDEOONVIP];

            stream.write("\n" + itemString.join(","));

        }
    }
};

//CATEGORYID,DATE,I_L1CATEGORYID,I_L1CATEGORYNAME,I_L2CATEGORYID,I_L2CATEGORYNAME,ID,LOC_ABROAD,LOC_CITYNAME,LOC_ISBUYERLOCATION,
// LOC_ONCOUNTRYLEVEL,NAPAVAILABLE,PAGE,PAGELOCATION,PRICE,PRICETYPE,PRIORITYPRODUCT,SELLERID,SELLERNAME,
// SELLERSHOWSOIURL,SELLERSHOWWEBSITEURL,SELLERWEBSITEURL,TITLE,URGENCYFEATUREACTIVE,URL,VIDEOONVIP