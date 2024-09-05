import { Actor, log } from 'apify';
import { launchPlaywright } from 'crawlee';
import { Page, Browser } from 'playwright';
import { closePageAndBrowser, goToPageUrl, setViewport, sleepForMs } from './page.util.js';
import { saveData, saveError } from './screenshot.util.js';
import { IInput } from './interface.js';

await Actor.init();

const input = (await Actor.getInput<IInput>()) ?? ({} as IInput);

const browser = (await launchPlaywright({
    launchOptions: {
        devtools: false,
        headless: true,
    },
})) as Browser;

const page = (await browser.newPage()) as Page;

try {
    await setViewport(page);

    await goToPageUrl(page, input.url, {
        waitUntil: 'commit',
        timeout: 30000,
    });

    await page.waitForSelector('body', { state: 'visible' });
    await sleepForMs(page, 500);

    let selector = 'div';
    if (input.selector) {
        selector = input.selector;
    } else if (input.url.includes('tout.html')) {
        selector = '.tout';
    } else if (input.url.includes('article.html')) {
        selector = '.article';
    }

    const found = page.locator(selector).first();
    try {
        await found.waitFor({ timeout: 30000 });
        log.info(`Found selector: ${selector}`);
        const buffer = await found.screenshot() as Buffer;
        await saveData(buffer, input.filename);
    } catch (error) {
        log.error(`Selector not found or other error: ${selector}, Error: ${error}`);
    }

    const buffer = await found.screenshot() as Buffer;
    await saveData(buffer, input.filename);
} catch (error: any) {
    await saveError(input, error);
    await Actor.fail('Execution failed!');
} finally {
    await closePageAndBrowser(page, browser);
    await Actor.exit('Execution finished!');
}
