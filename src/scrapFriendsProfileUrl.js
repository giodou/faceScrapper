const helper = require('./helper')
const login = require('./loginFacebook')

const {
    initialUrlToScrap,
    totalUrsToScrap,
    scrapeLimitPerFrieend,
    showLogs
} = require('../parameters')

var friends = [];

const scrapFriendsProfileUrl = async (browser) => {
    const newBrowser = browser ? browser : await login.loginFacebook();

    await helper.sleep(5000);

    await getFriendsProfileUrl(newBrowser, initialUrlToScrap);
    await getFriendsUntilTotalUrlsDefined(newBrowser);

    await helper.writeJsonTofile(JSON.stringify(friends), `${__dirname}/../scrapedData/urlToScrap.json`);

    if (showLogs)
        console.log("scraping of urls ended");
}

const getFriendsUntilTotalUrlsDefined = async (browser) => {
    let lastVisitedFriendIndex = 0;
    while (friends.length < totalUrsToScrap) {
        let urlToScrap = friends[lastVisitedFriendIndex].profileUrl;

        if (urlToScrap.includes('.php?'))
            urlToScrap = `${urlToScrap}&v=friends`;
        else
            urlToScrap = `${urlToScrap}/friends`;

        if (showLogs)
            console.log(`${friends.length} of ${totalUrsToScrap} urls scraped`);

        await getFriendsProfileUrl(browser, urlToScrap);
        lastVisitedFriendIndex++;
    }
}

const getFriendsProfileUrl = async (browser, urlFriend) => {
    const friendPage = await browser.newPage();
    await helper.sleep(3000);
    await friendPage.goto(urlFriend);
    await helper.sleep(1500);

    let friendsElementArray = await friendPage.$$('div[data-sigil="undoable-action"]');
    let friendsArrayLength = 0;

    while (friendsArrayLength < friendsElementArray.length && (!scrapeLimitPerFrieend || friendsArrayLength < scrapeLimitPerFrieend)) {
        await friendPage.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        friendsArrayLength = friendsElementArray.length;

        await helper.sleep(3000);

        friendsElementArray = await friendPage.$$('div[data-sigil="undoable-action"]');
    }

    for (let friendElement of friendsElementArray) {
        const friend = {
            name: await friendElement.$eval('div:nth-child(2) > div > div', element => element.textContent),
            profileUrl: await friendElement.$eval('div:nth-child(1) > a', element => element.href)
        }

        const friendAlreadyInArray = await helper.inArray(friends, friend);

        if (!friendAlreadyInArray) {
            friends.push(friend);
        }
    }

    await friendPage.close();
}

module.exports = {
    scrapFriendsProfileUrl
}
