const login = 'login';
const pass = 'pass';
const facebookUrl = 'https://m.facebook.com/'; //this scraper was made for facebook mobile for now, dont change url
const initialUrlToScrap = `${facebookUrl}me/friends`;
const totalUrsToScrap = 50; //mandatory 
const scrapeLimitPerFrieend = 10; //set false if has no limit, if false, will scraping all friends urls from this user
const waitForEachScrapInMiliSeconds = 10000; //set false if has not miliseconds to wait between profiles scraping
const totalAlowedProfilesToScrap = 10; //set false if has no limit, if false, will scraping all urls scrapeds before
const showBrowser = false;
const showLogs = true;

module.exports = {
    login,
    pass,
    facebookUrl,
    initialUrlToScrap,
    totalUrsToScrap,
    scrapeLimitPerFrieend,
    waitForEachScrapInMiliSeconds,
    totalAlowedProfilesToScrap,
    showBrowser,
    showLogs
}