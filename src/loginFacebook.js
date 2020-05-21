const {showBrowser, login, pass, facebookUrl, showLogs} = require('../parameters')
const puppeteer = require('puppeteer')

const loginFacebook = async()=>{

    const browser = await puppeteer.launch({
        headless: !showBrowser
    });

    const page = await browser.newPage();

    await page.goto(facebookUrl);

    if(showLogs)
        console.log("Facebook login page opened");

    await page.waitFor(1000);
    await page.waitFor('input[id="m_login_email"]');
    await page.type('input[id="m_login_email"', login, { delay: 100 });
    await page.type('input[id="m_login_password"]', pass, { delay: 100 });

    await page.waitFor(350);
    await page.click('button[name="login"]');

    if(showLogs)
        console.log("faceSraper logged into facebbok");

    return browser;
}

module.exports = {
    loginFacebook
}