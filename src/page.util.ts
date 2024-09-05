import { log } from 'apify';
import { Browser, Page } from 'playwright';
import { getDefaultViewport } from './screenshot.util.js';

export async function goToPageUrl(page: Page, url: string, options: any) {
    log.info(`Go To Url: , ${url}`);
    const navigationResult = await page.goto(url, options);
    if (navigationResult && navigationResult.status() !== 200) {
        const err = {
            status: navigationResult.status(),
            statusText: navigationResult.statusText(),
            headers: navigationResult.headers(),
        };

        throw err;
    }
}

export async function sleepForMs(page: Page, ms: number) {
    log.info(`Waiting for ${ms / 1000} seconds`);
    await page.waitForTimeout(ms);
}

export async function closePageAndBrowser(page: Page, browser: Browser) {
    if (page) {
        log.info('Closing page');
        await page.close();
    }
    if (browser) {
        log.info('Closing browser');
        await browser.close();
    }
}

export async function setViewport(page: Page, device?: string) {
    log.info('Changing viewport width');
    const deviceObject = getDefaultViewport(device);
    const viewport = {
        width: deviceObject.viewport.width,
        height: deviceObject.viewport.height,
    };
    log.info(`Viewport width: ${viewport.width} height: ${viewport.height}`);
    await page.setViewportSize(viewport);
}
