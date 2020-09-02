import { combineReducers } from 'redux';
import createCCVDCheck from './createCCVDCheck';
import newQuestionnairePreCheck from './newQuestionnairePreCheck'

export default combineReducers({
    createCCVDCheck,
    newQuestionnairePreCheck
})
