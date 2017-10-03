import credentials from './credentials.json';
import settings from './dropdown.settings.json';
import runCreator, { parseConfig } from './utils';

const folder = 'dropdown';
const reqDelay = 500;

const { questionCount, questionUid0, origin, submitUrl, resubmitUrl, sessionMapID, choices } = settings;

let numIterate = 0;
let lock = false;
let gotcha = false;
const bufferFetch = [];

runCreator({
    numIterate, lock, gotcha, bufferFetch, settings, credentials,
    folder, reqDelay, questionCount, questionUid0, origin, submitUrl,
    resubmitUrl, sessionMapID, choices
})([], choices, parseConfig(process.argv.slice(2)));