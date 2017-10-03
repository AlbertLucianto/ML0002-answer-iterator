# ML0002 Answer Iterator

## Setup
1. Run `npm install`
2. Remove `.template` extension for credentials and settings configuration
3. Set `credentials.json` cookie accordingly
4. Set `settings.json` based on the question
5. Run `npm run start`

## Instant Next Activity
Place this on the url bar:
```javascript
https://lams.ntu.edu.sg/lams/tool/laasse10/learning/finish.do?sessionMapID=sessionMapID-{sessionMapID}&mode=learner&toolSessionID={toolSessionID}
```
* `sessionMapID` can be found by opening developer console on Chrome, select element of the `<form>` and check the attribute `action`.
* `toolSessionID` can be found on url bar (if it's not there, try reloading the page).