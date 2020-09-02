import { combineReducers } from 'redux';

import createGroup from './createGroup'
import groupList from './groupList'
import account from './account'
import newAccount from './newAccount'

export default combineReducers({
    createGroup,
    groupList,
    account,
    newAccount,
});
