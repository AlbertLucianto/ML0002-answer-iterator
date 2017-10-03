const URLSearchParams = require('url-search-params');
const fetch = require('node-fetch');
const fs = require('fs');
const mkdirp = require('mkdirp');
const credentials = require('./credentials.json');
const settings = require('./checkbox.settings.json');

const { questionCount, questionUid0, origin, url } = settings;
const choices = [true, false];

let numIterate = 0;
let lock = false;
const bufferFetch = [];

const executeFetch = (form, outId) => {
    return () => {
        lock = true;
        fetch(origin + url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': credentials.cookies
            },
            body: form,
            mode: 'no-cors'
        })
        .then(res => {
            if(bufferFetch[0]) {
                bufferFetch[0]();
                bufferFetch.shift();
                lock = false;
            }
            console.log('Successfully retrieved:', outId);
            return res.text();
        })
        .then(res => mkdirp('src/outputs/checkbox', () => {
            fs.writeFile(`src/outputs/checkbox/out-${outId}.html`, res, err => {
                if(err) {
                    console.log(err);
                    lock = false; // continue
                }
            });
        }));
    }
}

const tryAllCombination = (answers) => {
    if(answers.length < questionCount) {
        Array.prototype.forEach.call(choices, opt => {
            const next = answers.slice();
            next.push(opt);
            tryAllCombination(next);
        });
    }
    else {
        const outId = numIterate++;
        const form = new URLSearchParams();
        form.set('questionUid0', questionUid0);
        Array.prototype.forEach.call(answers, (val, idx) => {
            form.set(`question0_${idx}`, val);
        });
        if(lock) bufferFetch.push(executeFetch(form, outId));
        else executeFetch(form, outId)();
    }
}

choices.forEach(val => {
    tryAllCombination([val]);
});