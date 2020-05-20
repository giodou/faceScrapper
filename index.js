const puppeteer = require('puppeteer')
const fs = require('fs')

const login = 'login';
const pass = 'pass';
const facebookUrl = 'https://m.facebook.com/'; //this scraper was made for facebook mobile for now, dont change url
const initialUrlToScrap = `${facebookUrl}me/friends`;

var friends = [];
const scrapeFriendsUntil = 600;
const scrapeLimitPerFrieend = 150; //set false if has no limit

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    await page.goto(facebookUrl);

    await page.waitFor(1000);
    await page.waitFor('input[id="m_login_email"]');
    await page.type('input[id="m_login_email"', login, { delay: 100 });
    await page.type('input[id="m_login_password"]', pass, { delay: 100 });

    await page.waitFor(350);
    await page.click('button[name="login"]');

    await page.waitFor(5000);

    await getFriendsProfileUrl(browser, initialUrlToScrap);
    await getFriendsUntil(browser);

    await writeFileToJsonFile(JSON.stringify(friends));

    console.log("end of the scraping");
})();

async function writeFileToJsonFile(jsonContent) {
    fs.writeFileSync("./urlToScrap.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });
}

async function getFriendsUntil(browser) {
    let lastVisitedFriendIndex = 0;
    while (friends.length < scrapeFriendsUntil) {
        await getFriendsProfileUrl(browser, `${friends[lastVisitedFriendIndex].profileUrl}/friends`);
        lastVisitedFriendIndex++;
    }
}

async function getFriendsProfileUrl(browser, urlFriend) {
    const friendPage = await browser.newPage();
    await friendPage.waitFor(3000);
    await friendPage.goto(urlFriend);
    await friendPage.waitFor(1500);

    let friendsElementArray = await friendPage.$$('div[data-sigil="undoable-action"]');
    let friendsArrayLength = 0;

    while (friendsArrayLength < friendsElementArray.length && (!scrapeLimitPerFrieend || friendsArrayLength < scrapeLimitPerFrieend)) {
        await friendPage.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        friendsArrayLength = friendsElementArray.length;

        await friendPage.waitFor(3000);

        friendsElementArray = await friendPage.$$('div[data-sigil="undoable-action"]');
    }

    for (let friendElement of friendsElementArray) {
        const friend = {
            name: await friendElement.$eval('div:nth-child(2) > div > div', element => element.textContent),
            profileUrl: await friendElement.$eval('div:nth-child(1) > a', element => element.href),
        }

        if (friends.indexOf(friend) === -1) {
            friends.push(friend);
        }
    }

    await friendPage.close();
}