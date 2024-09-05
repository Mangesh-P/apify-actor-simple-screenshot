import { Actor, log } from 'apify';
import { devices } from 'playwright';
import { IMAGE_TYPE, KEY_VALUE_PATH } from './constants.js';
import { IInput } from './interface.js';

const { ACTOR_DEFAULT_KEY_VALUE_STORE_ID } = process.env;

export function getDefaultViewport(device?: string) {
    let deviceObject = devices['iPad Pro 11 landscape'];
    if (device) {
        log.info(`Expected Device to set for viewport: ${device}`);
        // Set device for screen size (width) purposes.
        if (devices[device]) {
            deviceObject = devices[device];
        } else {
            log.info(`Device not found. Using iPad Pro 11 landscape`);
        }
    }

    return deviceObject;
}

export async function saveData(
    buffer: Buffer,
    filename: string = 'screenshot.jpg',
    keyValueStoreId?: string,
    datasetId?: string,
) {
    if (datasetId) {
        const dataStore = await Actor.openDataset(datasetId);
        const screenshotUrl = `${KEY_VALUE_PATH}${keyValueStoreId}/records/${filename}?disableRedirect=true`;
        await dataStore.pushData({ url: screenshotUrl, filename });
        log.info(screenshotUrl);
        log.info(`Url saved: ${dataStore.name}`);
    } else {
        const screenshotUrl = `${KEY_VALUE_PATH}${ACTOR_DEFAULT_KEY_VALUE_STORE_ID}/records/${filename}?disableRedirect=true`;
        await Actor.pushData({ url: screenshotUrl, filename });
        log.info(screenshotUrl);
        log.info('screenshot url saved in default dataset');
    }

    if (keyValueStoreId) {
        const keyValueStore = await Actor.openKeyValueStore(keyValueStoreId);
        await keyValueStore.setValue(filename, buffer, {
            contentType: `image/${IMAGE_TYPE}`,
        });
        log.info(`Screenshot saved: ${keyValueStore.name}`);
    } else {
        await Actor.setValue(filename, buffer, {
            contentType: `image/${IMAGE_TYPE}`,
        });
        log.info(`Screenshot saved: ${filename} in default key value store`);
    }
}

export async function saveError(input: IInput, error: any) {
    const { message, stack, trace, status, statusText } = error;

    const errorVal = {
        source: 'apify-ntv-actor-clp',
        message,
        trace,
        status,
        statusText,
        input,
    };

    if (stack) {
        log.error(stack);
    }
    if (trace) {
        log.error(trace);
    }
    if (status) {
        log.error(status);
    }
    if (statusText) {
        log.error(statusText);
    }

    const key = `ERROR`;

    const errorPath = `${KEY_VALUE_PATH}${ACTOR_DEFAULT_KEY_VALUE_STORE_ID}/records/${key}?disableRedirect=true`;
    await Actor.pushData({ url: errorPath, filenameError: `${key}.json`, filename: `${key}.json` });
    log.info('screenshot url saved in default dataset');
    log.info(errorPath);

    await Actor.setValue(key, errorVal);
    log.info(`Error saved: ${key}`);
}
