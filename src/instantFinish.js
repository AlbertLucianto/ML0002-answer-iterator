const URLSearchParams = require('url-search-params');
const fetch = require('node-fetch');
const fs = require('fs');
const credentials = require('./credentials.json');
const settings = require('./instant-finish.settings.json');
const filename = 'instant-finish';

const { origin, finishUrl, toolSessionID } = settings;

const form = new URLSearchParams();
form.set('toolSessionID', toolSessionID);
form.set('mode', 'learner');
form.set('method', 'finish');

fetch(origin + finishUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie': Object.keys(credentials.cookies).reduce((pre, cur) => `${pre}${cur}=${credentials.cookies[cur]}; `, '')
  },
  body: form
})
.then(res => res.text())
.then(txt => {
  console.log(txt);
  fs.writeFile(`src/outputs/${filename}.html`, txt, err => {
    if(err) {
        console.log(err);
        lock = false; // continue
    }
});
});