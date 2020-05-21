const login = require('./src/loginFacebook');
const { scrapFriendsProfileUrl } = require('./src/scrapFriendsProfileUrl');
const { scrapUserDataFromUrls } = require('./src/scrapUserDataFromUrl');

(async () => {
    let startTime = process.hrtime();

    new Promise(async(resolve) => {
        try {
            const browser = await login.loginFacebook();

            console.log("faceScraper has started the scraping")

            //await scrapFriendsProfileUrl(browser);
            await scrapUserDataFromUrls(browser);

            browser.close();
            resolve();
        } catch (error) {
            console.error(`faceScraper finished with an error: "${error}"`);
            resolve();
        }

    }).finally(function () {
        const hrtime = process.hrtime(startTime);
        let seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
        console.log(`faceScraper has finished the scraping in ${new Date(seconds * 1000).toISOString().substr(11, 8)}`);
        process.exit();
    })

})();