import { combineReducers } from 'redux';
import spareMoneyList from './spareMoneyList'
import newSpareMoney from './newSpareMoney'
import spareMoneyDetail from './spareMoneyDetail'
import applicationDetail from './applicationDetail'
import incomeList from './incomeList';

export default combineReducers({
    spareMoneyList,
    newSpareMoney,
    spareMoneyDetail,
    applicationDetail,
    incomeList,
})
