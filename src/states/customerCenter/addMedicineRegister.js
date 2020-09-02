import { apiActionCreator, putDrugTip, getPatientDrugPrompt, postOrder, putOrder, getPatient, getPatientByIdCard,
    getHistoricalDrugs, verifyOrder, getOrderDetails, loadUncompeletedOrders, getRegularMedication, getThirdPartyOrders, postOrderForStore } from '../../api'
import { reduceAsyncAction, resetMiddleware } from '../../helpers/reducers';

const RENEW_FORM_DATA = 'customerCenter.addMedicineRegister.renewFormData'
const POST_ORDER = 'customerCenter.addMedicineRegister.postOrder'
const POST_ORDER_FOR_SRORE = 'customerCenter.addMedicineRegister.postOrderForStore'
const GET_PATIENT = 'customerCenter.addMedicineRegister.getPatient'
const GET_HISTORICAL_DrugS = 'customerCenter.addMedicineRegister.getHistoricalDrugs'
const GET_PATIENT_BY_ID_CARD = 'customerCenter.addMedicineRegister.getPatientByIdCard'
const SET_ORDER_RESULT = 'customerCenter.addMedicineRegister.setOrderResult'
const VERIFY = 'customerCenter.addMedicineRegister.verify'
const GET_DUPLICATE_ORDERS = 'customerCenter.addMedicineRegister.getDuplicateOrders';
const RESET_VERIFY_RESULT = 'customerCenter.addMedicineRegister.resetVerifyResult';
const RESET_STATE = 'customerCenter.addMedicineRegister.resetState'
const GET_PATIENT_DRUG_PROMPT = 'customerCenter.addMedicineRegister.getPatientDrugPrompt'
const PUT_DRUG_TIP = 'customerCenter.addMedicineRegister.putDrugTip'
const GET_RegularMedication = 'customerCenter.addMedicineRegister.regularMedication.getRegularMedication'


const GET_ORDERINFO = 'customerCenter.addMedicineRegister.getOrderInfo'
const GET_THIRD_PARTY_ORDERS = 'customerCenter.addMedicineRegister.getThirdPartyOrders'

const initialState = {
  formData:{},
  postFormResult:{},
  checkPhoneNumber:{},
  getPatientResult: {},
  getPatientByIdCardResult:{},
  getRegularMedicationResult:{},
  getHistoricalDrugsResult:{},
  verifyResult: {},
  duplicateOrders: {},
  orderResult:{},
  drugPromptReslut:{},
  putDrugTipResult:{},
  getOrderInfoResult:{},
  getThirdPartyOrdersResult:[],
}

const verifyResultReducer = resetMiddleware(RESET_VERIFY_RESULT)(reduceAsyncAction(VERIFY, { keepPreviousPayloadWhilePending: true }));

const reduceDuplicateOrdersAsync = reduceAsyncAction(GET_DUPLICATE_ORDERS, { keepPreviousPayloadWhilePending: true });

function reduceDuplicateOrders(state = {}, action) {
    if (action.type === GET_DUPLICATE_ORDERS) {
        const oldPatientId = state.params ? state.params.patientId : null;
        const oldIds = state.params ? state.params.ids : [];
        if (oldPatientId !== action.params.patientId || action.params.ids.some(value => oldIds.indexOf(value) < 0)) {
            state = undefined;
        }
    }
    return reduceDuplicateOrdersAsync(state, action);
}

export default function addMedicineRegister(state = initialState, action){
  if(action.type === RENEW_FORM_DATA){
    state = { ...state, formData: {...state.formData, ...action.fields} }
  }else if(action.type === POST_ORDER){
    state = { ...state, postFormResult: action }
  }else if(action.type === POST_ORDER_FOR_SRORE){
    state = { ...state, postFormResult: action }
  }else if(action.type === RESET_STATE){
    state = { ...initialState, orderResult: state.orderResult }
  }else if(action.type === GET_PATIENT){
    state = { ...state, getPatientResult: action }
  }else if(action.type === GET_PATIENT_BY_ID_CARD){
    state = { ...state, getPatientByIdCardResult: action }
  }else if(action.type === GET_HISTORICAL_DrugS){
    state = { ...state, getHistoricalDrugsResult: action }
  }else if(action.type === GET_PATIENT_DRUG_PROMPT){
    state = { ...state, drugPromptReslut: action}
  }else if(action.type === PUT_DRUG_TIP){
    state = { ...state, putDrugTipResult: action}
  }else if(action.type === SET_ORDER_RESULT){
    state = { ...state, orderResult: action.orderData }
  } else if (action.type === VERIFY || action.type === RESET_VERIFY_RESULT) {
    state = {
      ...state,
      verifyResult: verifyResultReducer(state.verifyResult, action),
    }
  } else if (action.type === GET_DUPLICATE_ORDERS) {
    state = {
      ...state,
      duplicateOrders: reduceDuplicateOrders(state.duplicateOrders, action),
    }
  }else if(action.type === GET_RegularMedication){
    state = {
        ...state,
        getRegularMedicationResult: {
            params: action.params,
            status: action.status,
            payload: action.status === 'pending' ? (state.getRegularMedicationResult && state.getRegularMedicationResult.payload) : action.payload,
        }
    }
  }else if(action.type === GET_ORDERINFO){
    state = { ...state, getOrderInfoResult: action }
  }else if(action.type === GET_THIRD_PARTY_ORDERS){
    state = { ...state, getThirdPartyOrdersResult: action }
  }
  return state
}

export function renewFormDataAction(fields){
  return {type: RENEW_FORM_DATA, fields}
}

export function resetStateAction(fields){
  return {type: RESET_STATE, fields}
}

export function setOrderResult(orderData){
  return { type: SET_ORDER_RESULT, orderData }
}

export const getRegularMedicationAction = apiActionCreator(GET_RegularMedication, getRegularMedication, { mapArgumentsToParams: (patientId)=>{ return {patientId}} })
export const putDrugTipAction = apiActionCreator(PUT_DRUG_TIP, putDrugTip, { mapArgumentsToParams: (patientId, drugId)=>{ return {patientId, drugId} } })
export const getDrugPromptAction = apiActionCreator(GET_PATIENT_DRUG_PROMPT, getPatientDrugPrompt, { mapArgumentsToParams: (patientId)=>{ return {patientId} } })
export const getPatientByIdCardAction = apiActionCreator(GET_PATIENT, getPatientByIdCard, { mapArgumentsToParams: (patientId)=>{ return {patientId} } })
export const getPatientAction = apiActionCreator(GET_PATIENT, getPatient, {mapArgumentsToParams: (patientId)=>{ return {patientId} } })
export const getOrderInfoAction = apiActionCreator(GET_ORDERINFO, getOrderDetails, {mapArgumentsToParams: (orderId)=>{ return {orderId} } })
export const getThirdPartyOrdersAction = apiActionCreator(GET_THIRD_PARTY_ORDERS, getThirdPartyOrders, {mapArgumentsToParams: (idcard)=>{ return {idcard} } })
export const getHistoricalDrugsAction = apiActionCreator(GET_HISTORICAL_DrugS, getHistoricalDrugs, {mapArgumentsToParams: (patientId)=>{ return {patientId} } })
export const postOrderAction = apiActionCreator(POST_ORDER, async (ctx, data) => {
    const verifyOrderData = {...data, pictures: undefined}
    const verifyData = await verifyOrder(ctx, verifyOrderData) || [];
    const r = verifyData.filter(w => w.level === 'forbidden');
    if (r.length) {
        const err = new Error(r.map((w, i) => w.message).join('\n'));
        err.code = 'EVERIFYFAILED';
        throw err;
    }
    const fr = verifyData.filter(w => w.level === 'further_information');
    if ((fr.length || data.pharmacistUpdate) && !data.pictures && !data.electronicPrescription) {
        let errorMessage = fr.map((w, i) => w.message).join('\n');
        if(data.pharmacistUpdate){
          errorMessage = errorMessage + "\n药师驳回，需补充或重新上传处方信息";
        }
        const err = new Error(errorMessage);
        err.code = 'EVERIFYFAILED';
        throw err;
    }
    if(data.orderId){
      return await putOrder(ctx, data.orderId, data);
    }
    return await postOrder(ctx, data);
}, { mapArgumentsToParams: (data, actionType)=>{ return {data, actionType} }})

export const postOrderForStoreAction = apiActionCreator(POST_ORDER_FOR_SRORE, async (ctx, data) => {
    return await postOrderForStore(ctx, data);
}, { mapArgumentsToParams: (data, actionType)=>{ return {data, actionType} }})

const Trash = {};
export const verify = apiActionCreator(VERIFY, async (ctx, data) => {
    data.pictures = undefined;
    const r = (await verifyOrder(ctx, data) || [])
            .filter(w => w.level === 'warning' || w.level === 'forbidden' || w.level === 'further_information'|| w.level === 'manual_review');
    const verifyWarnings = [];
    const disallowSubmitByVerify = r.filter(w => w.level === 'forbidden'|| w.level === 'further_information');
    let isRequiredFile = false;
    const rf = r.filter(w => w.level === 'further_information');
    if(rf && rf.length > 0){
      isRequiredFile = true;
    }
    const verifyDrugWarnings = {};
    const verifyDrugMaxAmount = {
        forbidden: {},
        warning: {},
    };
    const verifyDrugMaxUseAmount = {
        forbidden: {},
        warning: {},
    };
    const verifyDrugAllowFrequencies = {
        forbidden: {},
        warning: {},
    };
    for (const w of r) {
        if (w.objectMap && w.objectMap.drugId) {
            const drugId = w.objectMap.drugId;
            if (w.objectMap.maxAmount !== undefined) {
                const config = verifyDrugMaxAmount[w.level] || Trash;
                config[drugId] = w.objectMap.maxAmount;
            }
            if (w.objectMap.maxUseAmount !== undefined) {
                const config = verifyDrugMaxUseAmount[w.level] || Trash;
                config[drugId] = w.objectMap.maxUseAmount;
            }
            if (w.objectMap.allowFrequencies !== undefined) {
                const config = verifyDrugAllowFrequencies[w.level] || Trash;
                config[drugId] = w.objectMap.allowFrequencies.map(i => `${i}`);
            }
            verifyDrugWarnings[drugId] = verifyDrugWarnings[drugId] || [];
            verifyDrugWarnings[drugId].push(w);
        } else {
            verifyWarnings.push(w);
        }
    }
    return {
        verifyWarnings,
        disallowSubmitByVerify,
        verifyDrugWarnings,
        verifyDrugMaxAmount,
        verifyDrugMaxUseAmount,
        verifyDrugAllowFrequencies,
        isRequiredFile,
    }
}, { throttle: 1000 });

export const getDuplicateOrders = apiActionCreator(GET_DUPLICATE_ORDERS, async (ctx, patientId, ids) => {
    return await loadUncompeletedOrders(ctx, patientId, ids)

}, {
    mapArgumentsToParams: (patientId, ids) => ({ patientId, ids })
})

export const resetVerifyResult = resetMiddleware.actionCreator(RESET_VERIFY_RESULT);
