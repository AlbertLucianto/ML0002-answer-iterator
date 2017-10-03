const URLSearchParams = require('url-search-params');
const fetch = require('node-fetch');
const fs = require('fs');
const mkdirp = require('mkdirp');
const credentials = require('./credentials.json');
const settings = require('./dropdown.settings.json');
const folder = 'dropdown';

const { questionCount, questionUid0, origin, submitUrl, resubmitUrl, sessionMapID, choices } = settings;

let numIterate = 0;
let lock = false;
let gotcha = false;
const bufferFetch = [];

const urlParamsToObj = entries => {
    const obj = {};
    let { done, value } = entries.next();
    while(!done) {
        obj[value[0]] = value[1];
        ({ done, value } = entries.next());
    }
    return obj;
}

const executeFetch = (form, outId) => {
    return () => {
        lock = true;
        fetch(origin + submitUrl + sessionMapID, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': Object.keys(credentials.cookies).reduce((pre, cur) => `${pre}${cur}=${credentials.cookies[cur]}; `, '')
            },
            body: form,
        })
        .then(res => {
            fetch(origin + resubmitUrl + sessionMapID, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': Object.keys(credentials.cookies).reduce((pre, cur) => `${pre}${cur}=${credentials.cookies[cur]}; `, '')
                }
            })
            .then(res => {
                lock = false;
                if(bufferFetch[0] && !gotcha) {
                    bufferFetch[0]();
                    bufferFetch.shift();
                }
                return res.text();
            })
            .then(res => console.log('Resubmit:', outId));
            console.log('Successfully retrieved:', outId);
            return res.text();
        })
        .then(res => mkdirp(`src/outputs/${folder}`, () => {
            if(res.includes('good job') || res.includes('Excellent')) {
                console.log('Gotcha!', urlParamsToObj(form.entries()));
                gotcha = true;
            };
            fs.writeFile(`src/outputs/${folder}/out-${outId}.html`, res, err => {
                if(err) {
                    console.log(err);
                    lock = false; // continue
                }
            });
        }));
    }
}

const tryAllCombination = (answers, left) => {
    if(answers.length < questionCount) {
        Array.prototype.forEach.call(left, opt => {
            const next = answers.slice();
            next.push(opt);
            tryAllCombination(next, left.filter(val => val !== opt));
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
    const choicesLeft = choices.slice().filter(choice => choice !== val);
    tryAllCombination([val], choicesLeft);
});