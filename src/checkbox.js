import credentials from './credentials.json';
import settings from './checkbox.settings.json';
import runCreator, { parseConfig } from './utils';

const folder = 'checkbox';
const reqDelay = 500;

const { questionCount, questionUid0, origin, submitUrl, resubmitUrl, sessionMapID } = settings;
const choices = ['on', null];

let numIterate = 0;
let lock = false;
let gotcha = false;
const bufferFetch = [];

runCreator({
    numIterate, lock, gotcha, bufferFetch, settings, credentials,
    folder, reqDelay, questionCount, questionUid0, origin, submitUrl,
    resubmitUrl, sessionMapID, choices
})([], choices, parseConfig(process.argv.slice(2)));