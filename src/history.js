import { createBrowserHistory as createHistory } from 'history';
import {createHashHistory} from 'history';
let createLegacyHistory = createHashHistory.createLegacyHistory;

const usePushState = window.history.pushState;

let history;
if (usePushState) {
  history = createHistory();
  const match = /#!(.*)/.exec(location.hash);
  if (match) {
    history.replace(match[1]);
  }
} else {
  if (location.pathname !== '/') {
    location.href = `${location.origin}/#!${location.pathname}`;
    throw new Error('Location changed');
  } else {
    history = createLegacyHistory({
      hashType: 'hashbang',
    });
  }
}

export default history;
