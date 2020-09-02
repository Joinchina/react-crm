import { combineReducers, bindActionCreators } from 'redux'
import { connect as reduxConnect } from 'react-redux'
import { createReducer, apiActionCreator as tableApiActionCreator } from '../../components/common/table-page';
import {
    apiActionCreator,
    getspareMoneyDetail,
    getspareMoneyApplication,
    exportSpareMoneyApplication,
    downloadSpareMoneyApplicationFile
} from '../../api'
import { reduceAsyncAction, resetMiddleware } from '../../helpers/reducers';

const SEARCH_JOURNAL = 'toolcase.spareMoneyDetail.SEARCH_JOURNAL'
const SEARCH_APPLICATION = 'toolcase.spareMoneyDetail.SEARCH_APPLICATION'
const RESET = 'toolcase.spareMoneyDetail.RESET'
const EXPORT = 'toolcase.spareMoneyDetail.EXPORT'
const RESET_EXPORT = 'toolcase.spareMoneyDetail.RESET_EXPORT'

export default resetMiddleware(RESET)(combineReducers({
    spareMoneyDetail: createReducer(SEARCH_JOURNAL),
    spareMoneyApplication: createReducer(SEARCH_APPLICATION),
    exportResult: resetMiddleware(RESET_EXPORT)(reduceAsyncAction(EXPORT))
}))

export const searchSpareMoneyJournal = tableApiActionCreator(SEARCH_JOURNAL, getspareMoneyDetail)
export const searchSpareMoneyApplication = tableApiActionCreator(SEARCH_APPLICATION, getspareMoneyApplication)

export const resetSpareMoneyDetail = resetMiddleware.actionCreator(RESET);

export const exportExcel = apiActionCreator(EXPORT, exportSpareMoneyApplication);
export const resetExportResult = resetMiddleware.actionCreator(RESET_EXPORT);
export const downloadExportResult = apiActionCreator(RESET_EXPORT, downloadSpareMoneyApplicationFile);

export const connect = reduxConnect(
    state => ({
        ...state.toolcase.spareMoneyDetail,
    }),
    dispatch => bindActionCreators({
        searchSpareMoneyJournal,
        searchSpareMoneyApplication,
        resetSpareMoneyDetail,
        exportExcel,
        resetExportResult,
        downloadExportResult,
    }, dispatch)
)
