const helper = require('./helper')
const login = require('./loginFacebook');

const {
    waitForEachScrapInMiliSeconds,
    totalAlowedProfilesToScrap,
    showLogs
} = require('../parameters')

let friendsUrlToScrap = [];
let scrapedsUrl = [];
let scrapedData = [];
let jsonObjectUrlsToScrap;

const scrapUserDataFromUrls = async (browser) => {
    await validateScraping();

    const newBrowser = browser ? browser : await login.loginFacebook();
    await helper.sleep(5000);

    await scrapProfiles(newBrowser);
    await saveNewScrapedData(scrapedData, `${__dirname}/../scrapedData/usersData.json`);
    await saveNewScrapedData(scrapedsUrl, `${__dirname}/../scrapedData/scrapedUrls.json`);

    if (showLogs)
        console.log("scraping of users data finished");
};

const validateScraping = async () => {
    jsonObjectUrlsToScrap = await helper.readFileToJson(`${__dirname}/../scrapedData/urlToScrap.json`).catch();
    const jsonObjectScrapedUrls = await helper.readFileToJson(`${__dirname}/../scrapedData/scrapedUrls.json`).catch();

    if (!jsonObjectUrlsToScrap) {
        throw 'No urls found in "urlToScrap.json" file';
    } else {
        friendsUrlToScrap = jsonObjectUrlsToScrap;
    }

    if (jsonObjectScrapedUrls && jsonObjectScrapedUrls.length >= jsonObjectUrlsToScrap) {
        throw 'All urls already scraped, compare "urlToScrap.json" and "scrapedUrls.json" files for more details ';
    } else {
        if (jsonObjectScrapedUrls)
            scrapedsUrl = jsonObjectScrapedUrls;
    }
}

const scrapProfiles = async (browser) => {
    let newScrapedsUrl = [];
    const totalUrlAlreadyScraped = scrapedsUrl.length;
    for (let friend of friendsUrlToScrap) {
        const alreadyScraped = await helper.inArray(scrapedsUrl, friend.profileUrl);

        if (!alreadyScraped && friend.profileUrl.trim() !== "") {
            const profilePage = await browser.newPage();

            if (waitForEachScrapInMiliSeconds)
                await helper.sleep(waitForEachScrapInMiliSeconds);

            await profilePage.goto(friend.profileUrl);
            await helper.sleep(3000);

            const userName = await profilePage.$eval('div[id="cover-name-root"]', element => element.textContent);
            const userInfoElementsArray = await profilePage.$$('div[data-sigil="touchable profile-intro-card-log profile-intro-card-log touchable"]');

            let userInfos = [];

            for (let userInfoElement of userInfoElementsArray) {
                const userInfo = await userInfoElement.$eval('div:nth-child(2)', element => element.textContent);
                userInfos.push(userInfo);
            }

            const userData = {
                userUrl: friend.profileUrl,
                userName: userName,
                userInfos: userInfos
            }

            scrapedData.push(userData);
            scrapedsUrl.push(friend.profileUrl);
            newScrapedsUrl.push(friend.newScrapedsUrl);

            if (showLogs)
                console.log(`${newScrapedsUrl.length + totalUrlAlreadyScraped} of ${jsonObjectUrlsToScrap.length} scraped`)

            await profilePage.close();

            if (totalAlowedProfilesToScrap && newScrapedsUrl.length == totalAlowedProfilesToScrap)
                return;
        }
    }
}

const saveNewScrapedData = async (array, fileName) => {
    let jsonScrapedData = await helper.readFileToJson(fileName);


    if (!jsonScrapedData) {
        await helper.writeJsonTofile(JSON.stringify(array), fileName);
    } else {
        for (newObj of array) {
            const objAlreadSaved = await helper.inArray(jsonScrapedData, newObj);

            if (!objAlreadSaved)
                jsonScrapedData.push(newObj);
        }

        await helper.writeJsonTofile(JSON.stringify(jsonScrapedData), fileName);
    }
}

module.exports = {
    scrapUserDataFromUrls
}