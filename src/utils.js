import URLSearchParams from 'url-search-params';
import fetch from 'node-fetch';
import fs from 'fs';
import mkdirp from 'mkdirp';

export const parseConfig = args => {
  const obj = {};
  args.forEach(val => {
      if(val.includes('=')) {
          let [att, val] = val.split('=');
          obj[att] = val;
      } else obj[val] = true;
  });
  return obj;
}

const runCreator = ({
  numIterate, lock, gotcha, bufferFetch, settings, credentials,
  folder, reqDelay, questionCount, questionUid0, origin, submitUrl,
  resubmitUrl, sessionMapID, choices
}) => {
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
                    setTimeout(() => {
                        bufferFetch[0]();
                        bufferFetch.shift();
                    }, reqDelay);
                }
                return res.text();
            })
            .then(res => console.log('Resubmit:', outId));
            console.log('Successfully retrieved:', outId);
            return res.text();
        })
        .then(res => mkdirp(`src/outputs/${folder}`, () => {
            if(res.includes('Next Activity')) {
                console.log('Gotcha!', urlParamsToObj(form.entries()));
                gotcha = true;
            };
            fs.writeFile(`src/outputs/${folder}/out-${outId}.html`, res, err => {
                if(err) {
                    console.log(err);
                    lock = false; // continue
                }
            });
        })
      );
    }
  }

  const tryAllCombination = (answers, left, { duplicate }) => {
    if(answers.length < questionCount) {
        Array.prototype.forEach.call(left, opt => {
            const next = answers.slice();
            next.push(opt);
            tryAllCombination(next, duplicate ? choices : left.filter(val => val !== opt), { duplicate });
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

  return tryAllCombination;
}

export default runCreator;