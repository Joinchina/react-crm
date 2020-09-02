import { url, checkResponse } from './contextCreator';
import apiActionCreator, { uploadActionCreator } from './apiActionCreator';
import {
  getSystemUser,
  getSystemUserGroup,
  newTaskPool,
  getTask,
  getTaskById,
  transferTask,
  exportTaskList,
  getTaskPool,
  getTaskPoolById,
  downloadExportedTaskList,
  taskQuickActivation,
  updateTaskPool,
  deleteTaskPool,
  handleTaskFromPool,
  processTask,
  createUserGroup,
  getUserGroupById,
  updateUserGroupById,
  getTaskRecords,
  getTaskHistory,
  newProcessTask,


} from './crm';
import { getTaskType, getTaskAnswerStatusForTaskType } from './sys';
import {
  getWeixinBindPatients,
  getWeixinBindByPatient,
  getWeixinBindByPatientAndApp,
  getWeixinInfo,
  bindWeixinWithPatient,
  getInsuranceDiseases,
  getEnquiryList,
} from './weixin';
import { getLoginState } from './call';
import path from 'path';

import {
  getGroupInsuranceList,
  cancelGroupInsurance,
  confirmGroupInsurance,
  getGroupInsuranceInfo,
  getGroupInsuranceOrderList,
  createGroupInsurance,
  createPatientInsurance,
  getInsuracePackage,
  checkIdCardWithPublicSecurity,
  insuranceAccountInfo,
  updateGroupInsurance,
  getInsuranceOrderList,
  getDiseaseInquiries,
  exportGroupInsuranceZip,
  getInsuranceOrderDetails,
  getInsuranceOrderInfo,
  getHistoryPatientInfo,
  checkPatientIdCard,
  checkInsuranceCode,
  getUserInsuranceList,
  getActiveList,
  removeCode,
  getChannelCode,
  getMedicalExaminationCards,
  getMember,
  checkMemberStatus,
  getInsuranceProductList,
  getInsuranceCompany,
  getOrderDrafts,
} from './insurance';

import {
  saveCcvdAssessment,
  savePrePhysicalQuestionnaire,
  checkIsService,
  getInsuranceInquiries,
} from './check';

export {
  saveCcvdAssessment,
  savePrePhysicalQuestionnaire,
  checkIsService,
  getInsuranceInquiries,
};
export { url, checkResponse };
export { apiActionCreator, uploadActionCreator };
export {
  getSystemUser,
  getSystemUserGroup,
  newTaskPool,
  getTask,
  getTaskById,
  transferTask,
  exportTaskList,
  getTaskPool,
  getTaskPoolById,
  downloadExportedTaskList,
  taskQuickActivation,
  updateTaskPool,
  deleteTaskPool,
  handleTaskFromPool,
  processTask,
  createUserGroup,
  getUserGroupById,
  updateUserGroupById,
  getTaskRecords,
  getTaskHistory,
  newProcessTask,
};
export { getTaskType, getTaskAnswerStatusForTaskType };
export {
  getWeixinBindPatients,
  getWeixinBindByPatient,
  getWeixinBindByPatientAndApp,
  getWeixinInfo,
  bindWeixinWithPatient,
  getInsuranceDiseases,
  getEnquiryList,
};
export { getLoginState };

export {
  getGroupInsuranceList,
  cancelGroupInsurance,
  confirmGroupInsurance,
  getGroupInsuranceInfo,
  getGroupInsuranceOrderList,
  createGroupInsurance,
  updateGroupInsurance,
  createPatientInsurance,
  getInsuracePackage,
  checkIdCardWithPublicSecurity,
  insuranceAccountInfo,
  getInsuranceOrderList,
  getDiseaseInquiries,
  exportGroupInsuranceZip,
  getInsuranceOrderDetails,
  getInsuranceOrderInfo,
  getHistoryPatientInfo,
  checkPatientIdCard,
  checkInsuranceCode,
  getUserInsuranceList,
  getActiveList,
  removeCode,
  getChannelCode,
  getMedicalExaminationCards,
  getMember,
  checkMemberStatus,
  getInsuranceProductList,
  getInsuranceCompany,
  getOrderDrafts,
};

export async function checkPotentialMatching(ctx, params) {
  return ctx.get('/patient/potential/matching', params);
}
export async function searchPatientCount(ctx, params) {
  return ctx.get('/patient', params);
}

export async function searchPatient(ctx, id, keyWord) {
  const params = {
    where: JSON.stringify({
      search: keyWord,
    }),
    permissions: 'patient.edit,patient.admin',
    logical: 'or',
    limit: 11,
  };
  return ctx.get('/patient', params);
}

/* 搜索全部签约会员和话务资料 */
export async function searchPatientAll(ctx, id, keyWord) {
  const params = {
    where: JSON.stringify({
      search: keyWord,
    }),
    flag: true,
    permissions: 'patient.edit,patient.admin',
    logical: 'or',
    limit: 11,
  };
  return ctx.get('/patient', params);
}

export async function searchPatientByContact(ctx, params) {
  return ctx.get('/patient', params);
}

export async function searchPatientByIdCard(ctx, idCard) {
  const params = {
    where: JSON.stringify({
      idCard,
    }),
    limit: 10,
  };
  return ctx.get('/patient', params);
}

export async function getDoctor(ctx, requestId, value, requestParams) {
  const params = {
    where: JSON.stringify({
      hospitalId: requestParams.hospitalId,
      isDisabled: 0,
      isCooperate: 0,
    }),
  };
  return ctx.get('/doctors', params);
}

export async function getDoctorsByHospitalId(ctx, hospitalId) {
  const params = {
    where: JSON.stringify({
      hospitalId,
      isDisabled: 0,
      doctorType: { $in: [1, 2] },
    }),
  };
  return ctx.get('/doctors', params);
}

export async function getOrderCancelReasons(ctx) {
  return ctx.get('/cfg/enum/orderCancelReasonCRM', { flag: 2 });
}

export async function putDrugTip(ctx, patientId, drugRequirementId) {
  return ctx.put(
    `/patient/${patientId}/drugRequirements/${drugRequirementId}`,
    { isTooltip: 0 }
  );
}

export async function getPatientDrugPrompt(ctx, patientId) {
  return ctx.get(`/patient/${patientId}/drugPrompt`);
}

export async function getTagsByType(ctx) {
  const params = {
    where: JSON.stringify({
      tagType: 2,
    }),
  };
  return ctx.get('/sys/conf/tags', params);
}

export async function getTags(ctx, dataRange) {
  const params = {
    where: JSON.stringify({
      tagType: 2,
    }),
    dataRange,
  };
  return ctx.get('/sys/conf/tags', params);
}

export async function getTagsForQuery(ctx, params) {
  return ctx.get('/sys/conf/tags', params);
}

export async function getRegisterSource(ctx) {
  return ctx.get('sys/enum/registerSource');
}

export async function getDisease(ctx) {
  return ctx.get('sys/enum/disease');
}

export async function getHdDiseases(ctx) {
  return ctx.get('hdDiseases');
}

export async function getChronicDisease(ctx, params) {
  return ctx.get('sys/enum/disease/chronicDisease', params);
}

export async function getGrading(ctx, chronicDiseaseId) {
  return ctx.get(`sys/enum/chronicDisease/${chronicDiseaseId}/grading`);
}

/*
 *首页相关数据
 */
export async function getUsers(ctx) {
  const users = await ctx.get('/crm/user');
  return users;
}

export async function getWorkload(ctx, userId, start, end) {
  const result = await ctx.get(`/sys/user/${userId}/workload`, { start, end });
  result.taskCount = result.taskTypeCount.reduce(
    (a, b) => a + Number(b.count),
    0
  );
  return result;
}

export async function getUnhandledTask(ctx, skip = 0, limit = 4, userId, name) {
  const params = {
    skip,
    limit,
    count: 1,
  };
  if (userId) {
    params.userId = userId;
  }
  if (name) {
    params.name = name;
  }
  const result = await ctx.get('/crm/taskPool', params);
  return result;
}

export async function getMyTask(ctx, skip = 0, limit = 4, where = null) {
  const params = {
    skip,
    limit,
    count: 1,
  };
  if (where) {
    params.where = where;
  }
  const result = await ctx.get('/crm/task', params);
  return result;
}

/*
 *订单中心相关数据
 */
export async function getOrderCenter(ctx, where, skip, limit, count, order) {
  return ctx.get('/order', {
    where,
    skip,
    limit,
    count,
    order,
  });
}

export async function applyLianouOrderApi(ctx, orderId) {
  const result = await ctx.post(`/orders/${orderId}/lianou_order`);
  return result;
}

// 撤销订单
export async function postCancelOrder(ctx, id) {
  const result = await ctx.post(`/order/${id}/cancel`);
  return result;
}

// 延期订单
export async function postPostponeOrder(ctx, id) {
  const result = await ctx.post(`/order/${id}/postpone`);
  return result;
}

/*
 *订单详情
 */
export async function getOrderDetails(ctx, id) {
  const result = await ctx.get(`/order/${id}`);
  return result;
}

// 未完成订单
export async function loadUncompeletedOrders(ctx, patientId, ids) {
  return ctx.get(`/patient/${patientId}/orders`, {
    where: {
      orderId: {
        $in: ids,
      },
    },
  });
}

export async function getOrdersByPatient(ctx, params) {
  return ctx.get('/order', params);
}

/*
 *快捷搜索
 */
export async function getCustomerQuick(ctx, where, skip, limit, count, order) {
  const result = await ctx.get('/patient', {
    where,
    flag: false,
    skip,
    limit,
    count,
    order,
  });
  return {
    list:
      (result.list &&
        result.list.filter((patient) => patient.patientType === 1)) ||
      [],
  };
}

/*
 *会员中心
 */
export async function getCustomer(ctx, where, skip, limit, count, order) {
  const result = await ctx.get('/patient/es_search', {
    where,
    flag: false,
    skip,
    limit,
    count,
    order,
  });
  return {
    list:
      (result.list &&
        result.list.filter((patient) => patient.patientType === 1)) ||
      [],
  };
}

/*
 *话务资料
 */
export async function getPotentialCustomer(ctx, where, skip, limit, count) {
  const result = await ctx.get('/patient/potential', {
    where,
    skip,
    limit,
    count,
  });
  return result;
}

/*
 *会员详情
 */
export async function getPatient(ctx, id) {
  const result = await ctx.get(`/patient/${id}`);
  return result;
}
export async function getThirdPartyOrders(ctx, idcard) {
  const result = await ctx.get(`/thirdPartyOrders`, { idcard });
  return result;
}
// 更新会员详情
export async function putPatient(ctx, id, data) {
  const result = await ctx.put(`/patient/${id}`, data);
  return result;
}

/*
 *话务资料详情
 */
export async function getPotentialCustome(ctx, id) {
  const result = await ctx.get(`/patient/potential/${id}`);
  return result;
}

export const getPotentialPatient = getPotentialCustome;

// 检查话务资料匹配情况
export async function getPotentialCustomMatching(ctx, id, params) {
  let result;
  if (params) {
    result = await ctx.get('/patient/potential/matching', params);
  } else {
    result = await ctx.get('/patient/potential/matching');
  }
  return result;
}

// 更新会员卡号状态
export async function putPatientStatus(ctx, id, data) {
  const result = await ctx.put(`/patients/${id}/memberInfo`, data);
  return result;
}

// 更新话务资料
export async function putPotentialCustome(ctx, id, data) {
  const result = await ctx.put(`/patient/potential/${id}`, data);
  return result;
}

export const putPotentialPatient = putPotentialCustome;

// 健康档案
export async function getHealthRecords(ctx, id) {
  const result = await ctx.get(`/patient/${id}/medicalRecord`);
  return result;
}

// 更新健康档案
export async function putHealthRecords(ctx, id, data) {
  const result = await ctx.put(`/patient/${id}/medicalRecord`, data);
  return result;
}

// 用药需求
export async function getDrugRequirements(
  ctx,
  patientId,
  pageSize,
  pageNumber
) {
  const params = {
    patientId,
    skip: pageSize * (pageNumber - 1),
    limit: pageSize,
    count: 1,
  };
  return ctx.get('/patient/drugRequirements', params);
}

// 提交用药需求
export async function postDrugRequirements(ctx, patientId, data) {
  return ctx.post(`/patient/${patientId}/drugRequirements`, { data });
}

// 编辑用药需求
export async function putDrugRequirements(
  ctx,
  patientId,
  drugRequirementId,
  data
) {
  return ctx.put(
    `/patient/${patientId}/drugRequirements/${drugRequirementId}`,
    { ...data, isTooltip: 0 }
  );
}

// 用药记录
export async function getDrugRecord(
  ctx,
  skip = 0,
  limit = 10,
  customerId,
  baseDrugId
) {
  const params = {
    skip,
    limit,
    count: 1,
  };
  if (baseDrugId) {
    params.baseDrugId = baseDrugId;
  }
  const result = await ctx.get(`/patient/${customerId}/drugRecord`, params);
  return result;
}

// 联系人
export async function getContacts(ctx, customerId) {
  const result = await ctx.get(`/patient/${customerId}/contacts`);
  return result;
}

export async function getProvinces(ctx) {
  return ctx.get('sys/enum/province');
}

export async function getCities(ctx, provinceId) {
  return ctx.get(`sys/enum/province/${provinceId}/city`);
}

export async function getAreas(ctx, provinceId, cityId) {
  return ctx.get(`sys/enum/province/${provinceId}/city/${cityId}/area`);
}

export async function getAllHospital(ctx) {
  const params = {
    order: JSON.stringify([{ spelling: 'asc' }]),
    permissions: 'patient.edit,patient.admin',
    logical: 'or',
    where: JSON.stringify({ status: 0 }),
  };
  return ctx.get('/hospitals', params);
}

export async function get1Hospital(ctx) {
  const params = {
    order: JSON.stringify([{ spelling: 'asc' }]),
    permissions: 'patient.edit,patient.admin',
    logical: 'or',
    where: JSON.stringify({ status: 0, hospitalSignage: 1 }),
  };
  return ctx.get('/hospitals', params);
}

export async function get3Hospital(ctx) {
  const params = {
    order: JSON.stringify([{ spelling: 'asc' }]),
    permissions: 'patient.edit,patient.admin',
    logical: 'or',
    where: JSON.stringify({ status: 0, hospitalSignage: 3 }),
  };
  return ctx.get('/hospitals', params);
}

export async function getAvailableHospital(ctx) {
  const params = {
    order: JSON.stringify([{ spelling: 'asc' }]),
    permissions: 'patient.edit,patient.admin',
    logical: 'or',
    where: JSON.stringify({ status: 0 }),
  };
  return ctx.get('/hospitals', params);
}

export async function getHospital(ctx, dataRange, logical, where) {
  const params = {
    order: JSON.stringify([{ spelling: 'asc' }]),
    permissions: dataRange,
    logical,
  };
  if (where) {
    params.where = JSON.stringify(where);
  }
  return ctx.get('/hospitals', params);
}

export async function getHospitalById(ctx, hospitalId) {
  return ctx.get(`/hospitals/${hospitalId}`);
}

export async function getHospitalPaymentType(ctx, hospitalId) {
  return ctx.get(`/hospitals/${hospitalId}/paymentType`);
}
// 查询规律订药
export async function getRegularMedication(ctx, patientId) {
  return ctx.get(`/patient/${patientId}/regularMedicationInfo`);
}

// 提交规律订药
export async function postRegularMedication(ctx, patientId, data) {
  return ctx.put(`/patient/${patientId}/regularMedicationInfo`, data);
}

// 删除规律取药药品记录
export async function deleteRegularMedication(ctx, patientId, id) {
  return ctx.delete(`/patient/${patientId}/estimatedDrugs/${id}`);
}

export async function getMedicine(
  ctx,
  value,
  skip,
  limit,
  hospitalId,
  patientId
) {
  if (value) {
    const where = {
      search: value,
    };
    if (hospitalId) {
      where.hospitalId = hospitalId;
    }
    if (patientId) {
      where.patientId = patientId;
    }
    const params = {
      where: JSON.stringify(where),
      skip,
      limit,
      count: 1,
    };
    return ctx.get('/drug', params);
  }
  return undefined;
}

export async function getRecommandDrugs(ctx, drugIds, hospitalId) {
  const params = {
    hospitalId,
    drugIds,
  };
  return ctx.get('/drugReplacement', params);
}

export async function getInsurance(ctx) {
  return ctx.get('/sys/enum/insurance');
}

export async function checkIdCardNo(ctx, idCardNo) {
  const params = {
    idCard: idCardNo,
  };
  return ctx.get('/patient/available', params);
}

export async function checkPhoneNo(ctx, phoneNo) {
  const params = {
    phone: phoneNo,
  };
  return ctx.get('/patient/available', params);
}

export async function checkContractNo(ctx, contractNo) {
  const params = {
    contractNumber: contractNo,
  };
  return ctx.get('/patient/available', params);
}

export async function checkMemberCardNo(ctx, memberCard) {
  const params = {
    memberCard,
  };
  return ctx.get('/patient/available', params);
}

export async function checkBusinessCode(ctx, businessCode) {
  return ctx.get(`/patient/businessCode/${businessCode}`);
}

export async function checkPhoneNumber(ctx, phoneNumber) {
  const params = {
    where: JSON.stringify({
      phone: phoneNumber,
    }),
    limit: 1,
    count: 1,
  };
  return ctx.get('/patient', params);
}

export async function checkIdCard(ctx, idCard) {
  const params = {
    where: JSON.stringify({
      idCard,
    }),
    limit: 1,
    count: 1,
  };
  return ctx.get('/patient', params);
}

export async function checkAccountNo(ctx, accountNo) {
  const params = {
    where: JSON.stringify({
      accountNo,
    }),
    limit: 1,
    count: 1,
  };
  return ctx.get('/patient', params);
}

export async function checkMemberCard(ctx, memberCard) {
  const params = {
    memberCard,
  };
  return ctx.get('/patient/available', params);
}

export async function postCustomerInfo(ctx, data) {
  return ctx.post('/patient', data);
}

export async function postPotentialCustomerInfo(ctx, data) {
  return ctx.post('/patient/potential', data);
}

export async function postOrder(ctx, data) {
  return ctx.post('/orders', data);
}

export async function postOrderForStore(ctx, data) {
  return ctx.post('/completeOrders', data);
}

export async function putOrder(ctx, orderId, data) {
  return ctx.put(`/orders/${orderId}`, data);
}

export async function cancelOrder(ctx, orderId, reasonId, remarks) {
  return ctx.post(`/orders/${orderId}/cancel`, {
    reasonId,
    remarks,
  });
}

export async function getBillingReimburse(ctx, orderId) {
  return ctx.get(`/orders/${orderId}/billing/reimburse`);
}

/* 用户组配置 */

// 查询用户组配置
export async function getUserGroupe(ctx, where = {}, skip, limit, count) {
  return ctx.get('crm/userGroup', {
    skip,
    limit,
    count,
    name: where.name,
    status: where.status,
    ownerCompany: where.ownerCompany,
  });
}

// 获取所有机构
export async function getgroupOffices(ctx, where = null) {
  const params = {};
  if (where) {
    params.where = where;
  }
  return ctx.get('/sys/offices', params);
}

// 删除用户组
export async function deleteGroup(ctx, id) {
  return ctx.delete(`/crm/userGroup/${id}`);
}

// 禁用用户组
export async function updateGroup(ctx, id, data) {
  return ctx.put(`/crm/userGroup/${id}`, data);
}

// 更新联系人
export async function putPatientContact(ctx, patientId, data) {
  return ctx.put(`/patient/${patientId}/contacts`, data);
}

// 获取联系人
export async function getPatientContact(ctx, patientId) {
  return ctx.get(`/patient/${patientId}/contacts`);
}

export async function getDrug(ctx) {
  const params = {
    skip: 0,
    limit: 10,
  };
  return ctx.get('/drug', params);
}

export async function getHistoricalDrugs(ctx, patientId) {
  return ctx.get(`/patient/${patientId}/historicalDrgus`);
}

// 获取冻结列表
export async function getFrozen(ctx, where = {}, skip, limit, count) {
  return ctx.get('/enum/hospital/freeze', {
    skip,
    limit,
    count,
    name: where.name,
  });
}

// 删除冻结列表
export async function deleteFrozen(ctx, id) {
  return ctx.delete(`/enum/hospital/freeze/${id}`);
}

// 获取冻结列表详情
export async function getFrozenById(ctx, id) {
  return ctx.get(`/enum/hospital/freeze/${id}`);
}

// 编辑冻结
export async function updateFrozenById(ctx, id, data) {
  return ctx.put(`/enum/hospital/freeze/${id}`, data);
}

// 创建冻结
export async function createFrozen(ctx, data) {
  return ctx.post('/enum/hospital/freeze', data);
}

// 查找账号配置
export async function getAccountConfiguration(
  ctx,
  where = {},
  skip,
  limit,
  count
) {
  return ctx.get('/crm/accountConfiguration', {
    skip,
    limit,
    count,
    loginName: where.loginName,
  });
}

// 删除账号配置
export async function deleteAccountConfiguration(ctx, id) {
  return ctx.delete(`/crm/accountConfiguration/${id}`);
}

// 获取账号配置详情
export async function getAccountConfigurationById(ctx, id) {
  return ctx.get(`/crm/accountConfiguration/${id}`);
}

// 创建账号
export async function createAccount(ctx, data) {
  return ctx.post('/crm/accountConfiguration', data);
}

// 编辑账号
export async function updateAccountById(ctx, id, data) {
  return ctx.put(`/crm/accountConfiguration/${id}`, data);
}

// 查询备用金列表
export async function getspareMoneyList(ctx, where = {}, skip, limit, count) {
  return ctx.get('/billing/spareMoney', {
    skip,
    limit,
    count,
    doctorHospitalName: where.doctorHospitalName,
  });
}

// 备用金申领
export async function applySpareMoney(ctx, data) {
  return ctx.post('/billing/spareMoney/application', data);
}

// 备用金详情
export async function getspareMoneyDetail(ctx, where, skip, limit, count) {
  return ctx.get('/billing/spareMoney/journal', {
    where,
    skip,
    limit,
    count,
  });
}

// 备用金申领单列表
export async function getspareMoneyApplication(ctx, where, skip, limit, count) {
  return ctx.get('/billing/spareMoney/application', {
    where,
    skip,
    limit,
    count,
  });
}

export async function exportSpareMoneyApplication(ctx, where) {
  const count = await ctx.get('/spare-money-table', where);
  return {
    ...where,
    limit: count,
  };
}

export async function downloadSpareMoneyApplicationFile(ctx, where) {
  window.open(ctx.url('/spare-money-table/download', where));
}

// 申领单详情
export async function getApplicationDetail(ctx, id) {
  return ctx.get(`/billing/spareMoney/application/${id}`);
}

export async function getUserInfo(ctx) {
  let data = ctx.get('/user/info');
  return data;
}

export async function verifyOrder(ctx, order) {
  return ctx.get('/order/verify', { ...order, subCategory: 2 });
}

export async function getVersion(ctx) {
  return ctx.get('/sys/versionIns/latest', {
    subCategory: 2,
  });
}

export async function postVersion(ctx, versionId) {
  return ctx.post(`/sys/versionIns/${versionId}`);
}

export async function getCustomerLog(ctx, customerId, data) {
  return ctx.get(`/patient/${customerId}/logs`, data);
}

export async function getCommunicationRecored(ctx, query) {
  return ctx.get('/crm/communicationRecord', query);
}

export async function getCommunicationDetail(ctx, id) {
  return ctx.get(`/crm/communicationRecord/${id}`);
}

export async function createRecord(ctx, data) {
  return ctx.post('/crm/communicationRecord', data);
}

export async function updateRecord(ctx, id, data) {
  return ctx.put(`/crm/communicationRecord/${id}`, data);
}

export async function deleteRecord(ctx, id) {
  return ctx.delete(`/crm/communicationRecord/${id}`);
}

export async function getPhysicalRecord(ctx, patientId, skip, limit) {
  const r = await ctx.get(`/patient/${patientId}/physicalExamination`, {
    skip,
    limit,
  });
  return {
    list: r,
  };
}

export async function deletePhysicalRecord(ctx, patientId, id) {
  return ctx.delete(`/patient/${patientId}/physicalExamination/${id}`);
}

export async function getPhysicalRecordDetail(ctx, patientId, orderId) {
  return ctx.get(`/patient/${patientId}/physicalExamination/${orderId}`);
}

export async function editPhysicalExamination(ctx, patientId, orderId, data) {
  return ctx.put(`/patient/${patientId}/physicalExamination/${orderId}`, {
    data,
  });
}

export async function postNewPhysicalRecord(ctx, patientId, data) {
  return ctx.post(`/patient/${patientId}/physicalExamination`, { data });
}

export async function getReceiverAddress(ctx, patientId) {
  return ctx.get(`/patient/${patientId}/receiverAddress`);
}

// 获取绿A会员自提地址
export async function getAselfAddress(ctx, data) {
  return ctx.get(`/hospitals`, data);
}

export async function getFreight(ctx, patientId, data) {
  return ctx.get(`/patient/${patientId}/freight`, { ...data });
}

export async function postReceiverAddress(ctx, patientId, data) {
  return ctx.post(`/patient/${patientId}/receiverAddress`, data);
}

export async function putReceiverAddress(ctx, patientId, data, id) {
  return ctx.post(`/patient/${patientId}/receiverAddress/${id}`, data);
}

export async function deleteReceiverAddress(ctx, patientId, id) {
  return ctx.delete(`/patient/${patientId}/receiverAddress/${id}`);
}

export async function getMessageTemplate(ctx, patientId, params) {
  return ctx.get(`/patients/${patientId}/messageTemplate`, params);
}

export async function getOrderFills(ctx, where, skip, limit, count, order) {
  return ctx.get('/orderfills', {
    where,
    skip,
    limit,
    count,
    order,
  });
}

export async function getOrderFill(ctx, id) {
  return ctx.get(`/orderfills/${id}`);
}

// 获取报销金额
export async function getRefundMoney(ctx, data, patientId) {
  return ctx.get(`/patients/${patientId}/welfare`, data);
}
export async function getExpressFlow(ctx, orderId) {
  return ctx.get(`/orders/${orderId}/expressRouteInfo`);
}
export async function checkQuickActivateInactivePatients(
  ctx,
  start,
  end,
  companyId
) {
  return ctx.get('/patient/inactivePatients', {
    start,
    end,
    companyId,
    count: 1,
    limit: 1,
  });
}

export async function quickActivateInactivePatients(
  ctx,
  start,
  end,
  companyId
) {
  const r = await ctx.post('/crm/task/quickActivation', {
    start,
    end,
    companyId,
    limit: 10,
  });
  return {
    ...r,
    count: 10,
  };
}

/* 会员预约 */
export async function getReservationRecord(ctx, where, pageIndex, pageSize) {
  const skip = pageIndex ? pageSize * (pageIndex - 1) : 0;
  const res = await ctx.get('/patients/reservationRecord', {
    where,
    skip,
    limit: pageSize + 1 || 6,
  });
  return {
    count: skip + (res ? res.length : 0),
    list: res.splice(0, pageSize),
    pageIndex,
    pageSize,
  };
}

export async function postReservationRecord(ctx, data) {
  return ctx.post('/patients/reservationRecord', data);
}

export async function getReservationRecordById(ctx, recordId) {
  return ctx.get(`/patients/reservationRecord/${recordId}`);
}

export async function putReservationRecordById(ctx, recordId, data) {
  return ctx.put(`/patients/reservationRecord/${recordId}`, data);
}

export async function getDoctorSchedules(ctx, params) {
  return ctx.get('/doctorSchedules', params);
}

export async function getReservation(ctx, where, skip, limit) {
  const result = await ctx.get('/patients/reservationRecord', {
    where,
    skip,
    limit,
  });
  return {
    list: result,
  };
}

export async function operateReservation(ctx, id, data) {
  return ctx.put(`/patients/reservationRecord/${id}`, data);
}

export async function updateAppointmentTime(ctx, id, data) {
  return ctx.put(
    `/patients/reservationRecord/${id}/updateAppointmentTime`,
    data
  );
}

export async function getReservationDetail(ctx, id) {
  const r = await ctx.get(`/patients/reservationRecord/${id}`);
  return r;
}

export async function getReservationCancelReason(ctx) {
  return ctx.get('/patients/reservationRecord/cancleReason');
}

export function downloadReservationTable(ctx, where) {
  window.open(ctx.url('/download/reservation', { where }));
}

export async function getIncomes(ctx, where, skip, limit) {
  const result = await ctx.get('/billing/income/detail', {
    ...where,
    skip,
    limit,
  });
  return {
    list: result,
  };
}

export async function getIncomesSum(ctx, params) {
  return ctx.get('/billing/income/detail/sum', params);
}

export function downloadIncomeTable(ctx, where) {
  window.open(ctx.url('/download/income', where));
}

export async function getInsuranceRevokeOrder(ctx, params) {
  return await ctx.get(`/insurance_order/${params}/revoke`);
}

export async function getRevokeOrderDetails(ctx, params) {
  return await ctx.get(`/insurance_order/${params}/revoke/detail`);
}

export async function subRevokeOrder(ctx, params) {
  const res = await ctx.post(`/insurance_order/${params.orderId}/revoke`, {
    specialApply: params.ischeck ? 'seriousDisease' : null,
  });
  return res;
}

export async function getInsuranceList(ctx) {
  const res = await ctx.get(``);
  return res;
}

// 消息中心
export async function getMessageList(ctx, where = {}, skip, limit) {
  let messageList = await ctx.get('/message_center', {
    ...where,
    skip,
    limit,
  });
  messageList = await Promise.all(
    messageList.map(async (d) => {
      const message = await ctx.get(`/message_center/${d.id}/detail`);
      return {
        ...d,
        message,
      };
    })
  );
  return messageList;
}

export async function getMessageCount(ctx, status = 0) {
  return ctx.get('/message_center/count', {
    status,
    types: '2,4,5',
  });
}
export async function getMessageInfo(ctx, messageId) {
  return ctx.get(`/message_center/${messageId}/detail`);
}

export async function readMessage(ctx, messageIds) {
  return Promise.all(
    messageIds.map((messageId) => {
      ctx.post(`/message_center/${messageId}/read`);
    })
  );
}
export async function deleteMessage(ctx, messageIds) {
  return Promise.all(
    messageIds.map((messageId) => {
      ctx.delete(`/message_center/${messageId}`);
    })
  );
}

export async function getLevel(ctx) {
  const res = ctx.get(`/patientGradeConfig`);
  return res;
}

/** 健康档案 start*/
export async function getDiseaseTree(ctx) {
  const r = await ctx.get('/health/sys/enum/disease');
  return r.map((d) => {
    if (!d.chronicDiseases || d.chronicDiseases.length === 0) {
      return {
        id: d.id,
        name: d.name,
        key: d.key,
        chronicDiseases: [],
      };
    }
    const children = d.chronicDiseases.filter((cd) => cd.status !== 0);
    const chronicDiseases = children.map((cd) => {
      const { chronicDiseaseGrades } = cd;
      return {
        id: cd.id,
        name: cd.name,
        key: cd.code,
        levels: chronicDiseaseGrades
          ? chronicDiseaseGrades.map((g) => ({
              id: g.id,
              name: g.grade,
              key: g.key,
            }))
          : [],
      };
    });
    return {
      id: d.id,
      name: d.name,
      key: d.key,
      chronicDiseases: chronicDiseases || [],
    };
  });
}
//查询会员就诊记录
export async function getPatientDiagnoseRecords(ctx, patientId) {
  const r = await ctx.get(`/health/patients/medical/${patientId}`);
  return r.map((item) => ({
    id: item.medicalId,
    date: item.medicalDate,
    complaint: item.complaint,
    otherSymptomsDescribe: item.otherSymptomsDescribe,
    symptoms: (item.list || []).map((sym) => ({
      symptom: `${sym.symptomsType}`,
      description: sym.symptomsDescribe,
    })),
    nonDrugTherapy: item.nonDrugTherapy,
    drugTherapy: item.drugTherapy
      ? item.drugTherapy.map((dt) => ({
          ...dt,
          frequency: stringOrNull(dt.frequency),
          useAmount: stringOrNull(dt.useAmount),
          amount: stringOrNull(dt.amount),
        }))
      : [],
  }));
}

function stringOrNull(val) {
  if (val === null || val === undefined) {
    return null;
  }
  return `${val}`;
}
//查询药品
export async function getDrugList(ctx, queryData) {
  return ctx.get('/health/drugs', queryData);
}
//更新会员就诊记录
export async function updateDiagnoseRecord(ctx, recordId, record) {
  const {
    date,
    complaint,
    symptoms,
    otherSymptomsDescribe,
    nonDrugTherapy,
    drugTherapy,
  } = record;
  return ctx.put(`/health/patients/medical/${recordId}`, {
    medicalDate: date,
    complaint,
    otherSymptomsDescribe,
    medicalHistorys: symptoms.map((sym) => ({
      symptomsType: sym.symptom,
      symptomsDescribe: sym.description,
    })),
    nonDrugTherapy,
    drugTherapy:
      drugTherapy &&
      drugTherapy.map((dt) => ({
        ...dt,
        amount: numberOrNull(dt.amount),
        useAmount: numberOrNull(dt.useAmount),
      })),
  });
}

function numberOrNull(val) {
  if (val === null || val === undefined || val === '') {
    return null;
  }
  const num = Number(val);
  if (Number.isNaN(num)) {
    return null;
  }
  return num;
}

//新增会员就诊记录
export async function createDiagnoseRecord(ctx, patientId, record) {
  const {
    date,
    complaint,
    symptoms,
    otherSymptomsDescribe,
    nonDrugTherapy,
    drugTherapy,
  } = record;
  const r = await ctx.post('/health/patients/medical', {
    patientId,
    medicalDate: date,
    complaint,
    otherSymptomsDescribe,
    medicalHistorys: symptoms.map((sym) => ({
      symptomsType: sym.symptom,
      symptomsDescribe: sym.description,
    })),
    nonDrugTherapy,
    drugTherapy,
  });
  return r.medicalId;
}
//删除会员就诊记录
export function removeDiagnoseRecord(ctx, patientId, recordId) {
  return ctx.delete(`/health/patients/medical/${recordId}`);
}
//患者慢病记录
export async function getPatientDiseaseInfo(ctx, patientId) {
  const r = await ctx.get(`/health/patient/${patientId}/chronic_disease`);
  const {
    allergy,
    pastMedicalHistory,
    homeMedicalHistories,
    chronicDiseases,
  } = r;
  return {
    allergies: allergy,
    pastMedicalHistory,
    familyDiseases: homeMedicalHistories.map((h) => ({
      id: h.id,
      relationship: h.relationValue,
      diseaseId: h.diseaseId,
      diagnoseAge: h.age,
      outcome: h.lapseToId,
    })),
    chronicDiseases: chronicDiseases.map((d) => {
      const dateMatch = /(\d\d\d\d)-\d\d-\d\d/.exec(d.date);
      return {
        id: d.id,
        diseaseId: d.diseaseId,
        chronicDiseaseId: d.chronicDiseaseId,
        levelId: d.chronicDiseaseGradeId,
        date: Number(dateMatch && dateMatch[1]),
      };
    }),
  };
}
//修改患者慢病记录
export async function updateDiseaseInfo(ctx, patientId, diseaseInfo) {
  const {
    allergies,
    pastMedicalHistory,
    familyDiseases,
    chronicDiseases,
  } = diseaseInfo;
  const r = await ctx.put(`/health/patient/${patientId}/chronic_disease`, {
    allergy: allergies,
    pastMedicalHistory: pastMedicalHistory || '',
    chronicDiseases: (chronicDiseases || []).map((cd) => ({
      id: cd.id,
      diseaseId: cd.diseaseId,
      chronicDiseaseId: cd.chronicDiseaseId,
      chronicDiseaseGradeId: cd.levelId,
      date: cd.date && `${cd.date}-01-01 00:00:00`,
    })),
    homeMedicalHistories: (familyDiseases || []).map((fd) => ({
      id: fd.id,
      relationValue: fd.relationship,
      diseaseId: fd.diseaseId,
      age: fd.diagnoseAge,
      lapseToId: fd.outcome,
    })),
  });
  return {
    chronicDiseaseIds: r.chronicDiseases && r.chronicDiseases.map((d) => d.id),
    familyDiseaseIds:
      r.homeMedicalHistories && r.homeMedicalHistories.map((fd) => fd.id),
  };
}

//删除患者慢病记录
export async function removeDiseaseInfo(ctx, patientId, diseaseInfo) {
  const { familyDiseases, chronicDiseases } = diseaseInfo;
  return ctx.post(`/health/patient/${patientId}/delete_chronic_disease`, {
    chronicDiseases:
      chronicDiseases &&
      chronicDiseases.map((cd) => ({
        id: cd.id,
        diseaseId: cd.diseaseId,
        chronicDiseaseId: cd.chronicDiseaseId,
        chronicDiseaseGradeId: cd.levelId,
      })),
    homeMedicalHistories: familyDiseases,
  });
}
//format function
function getClientHealthRecord(serverRecord) {
  return {
    id: `${serverRecord.id}`,
    date: serverRecord.physicalExaminationDate,
    smoke: `${serverRecord.smok}`,
    exercise: `${serverRecord.isExercise}`,
    drink: `${serverRecord.drink}`,
    taste: `${serverRecord.appetite}`,
    height: numberOrNull(serverRecord.height),
    weight: numberOrNull(serverRecord.weight),
    waistline: numberOrNull(serverRecord.waistline),
    heartRate: numberOrNull(serverRecord.heartRate),
    systolicBloodPressure: numberOrNull(serverRecord.SBP),
    diastolicBloodPressure: numberOrNull(serverRecord.DBP),
    fastingBloodGlucose: numberOrNull(serverRecord.FBG),
    postPrandialBloodGlucose: numberOrNull(serverRecord.PBG),
    lowDensityLipoproteinCholesterol: numberOrNull(serverRecord.LDL),
    dailyActivities: `${serverRecord.dailyWork}`,
    sleepQuality: `${serverRecord.sleep}`,
    snap: `${serverRecord.snore}`,
    constipation: `${serverRecord.constipation}`,
    nutrition: `${serverRecord.nutrition}`,
    auscultationCheck: serverRecord.auscultation,
    eyeCheck: serverRecord.fundoscopy,
    mouthCheck: serverRecord.oralExamination,
    footCheck: serverRecord.footExamination,
    glycatedHemoglobin: numberOrNull(serverRecord.HBALC),
    triglyceride: numberOrNull(serverRecord.TG),
    totalCholesterol: numberOrNull(serverRecord.TCHO),
    highDensityLipoproteinCholesterol: numberOrNull(serverRecord.HDL),
    serumCreatinine: numberOrNull(serverRecord.Scr),
    serumCreatinineUnit: `${serverRecord.scrUnit}`,
    uricAcid: numberOrNull(serverRecord.uricAcid),
    plasmaHomocysteine: numberOrNull(serverRecord.Hcy),
    ALT: numberOrNull(serverRecord.ALT),
    AST: numberOrNull(serverRecord.AST),
    bloodSodium: numberOrNull(serverRecord.serumNa),
    bloodPotassium: numberOrNull(serverRecord.serumKalium),
    urinaryMicroprotein: numberOrNull(serverRecord.MAU),
    pictures: serverRecord.picUrls,
  };
}
//患者慢病档案查询
export async function getPatientHealthCheckRecords(ctx, patientId) {
  const records = await ctx.get('/health/patient/physicalExamination', {
    where: {
      patientId,
    },
  });
  return records.map(getClientHealthRecord);
}

function getServerHealthRecord(record) {
  return {
    id: record.id,
    physicalExaminationDate: record.date,
    smok: record.smoke,
    isExercise: record.exercise,
    drink: record.drink,
    appetite: record.taste,
    height: record.height,
    weight: record.weight,
    waistline: record.waistline,
    heartRate: record.heartRate,
    SBP: record.systolicBloodPressure,
    DBP: record.diastolicBloodPressure,
    FBG: record.fastingBloodGlucose,
    PBG: record.postPrandialBloodGlucose,
    LDL: record.lowDensityLipoproteinCholesterol,
    dailyWork: record.dailyActivities,
    sleep: record.sleepQuality,
    snore: record.snap,
    constipation: record.constipation,
    nutrition: record.nutrition,
    auscultation: record.auscultationCheck,
    fundoscopy: record.eyeCheck,
    oralExamination: record.mouthCheck,
    footExamination: record.footCheck,
    HBALC: record.glycatedHemoglobin,
    TG: record.triglyceride,
    TCHO: record.totalCholesterol,
    HDL: record.highDensityLipoproteinCholesterol,
    Scr: record.serumCreatinine,
    scrUnit: record.serumCreatinineUnit,
    uricAcid: record.uricAcid,
    Hcy: record.plasmaHomocysteine,
    ALT: record.ALT,
    AST: record.AST,
    serumNa: record.bloodSodium,
    serumKalium: record.bloodPotassium,
    MAU: record.urinaryMicroprotein,
    picUrls: record.pictures,
  };
}
export async function createHealthCheckRecord(ctx, patientId, record) {
  return ctx.post(
    `/health/patient/${patientId}/physicalExamination`,
    getServerHealthRecord(record)
  );
}
export async function updateHealthCheckRecord(
  ctx,
  patientId,
  recordId,
  record
) {
  return ctx.put(
    `/health/patient/physicalExamination/${recordId}`,
    getServerHealthRecord(record)
  );
}
export async function getUserMedicationDemand(ctx, patientId) {
  return ctx.get(`/health/patients/${patientId}/drugRequirements`);
}

export async function uploadImageToOss(ctx, file) {
  const extname = path.extname(file.name.toLowerCase());
  if (['.jpg', '.jpeg', '.png', '.gif'].indexOf(extname) < 0) {
    const error = new Error('请上传图片格式的文件');
    error.validate = false;
    throw error;
  }
  const config = await ctx.get('/health/upload/signature');
  if (file.size && file.size > config.limit) {
    const error = new Error(
      `文件大小超出${Math.round(config.limit / 1024 / 1024)}MB限制`
    );
    error.validate = false;
    throw error;
  }
  const formData = new FormData();
  const uid =
    Date.now().toString(36).substr(-4) + Math.random().toString(36).substr(-4);
  const filename = uid + extname;
  formData.append('name', filename);
  formData.append('key', config.dir + filename);
  formData.append('policy', config.policy);
  formData.append('OSSAccessKeyId', config.accessid);
  formData.append('success_action_status', '200');
  formData.append('signature', config.signature);
  formData.append('file', file);

  const resp = await fetch(config.host, {
    method: 'POST',
    body: formData,
  });
  if (resp.status !== 200) {
    throw new Error('上传失败');
  }
  await resp.text();
  return {
    uid,
    url: `${config.host}/${config.dir}${filename}`,
  };
}

async function getUploadSignature() {
  return this.get('/health/upload/signature');
}

/** 健康档案 end*/

export async function uploadFile(ctx, param) {
  return this.post('/uploadImages', param);
}

export async function handAuditConfirmation(ctx, orderId) {
  return this.post(`/orders/${orderId}/doctorConfirmation`);
}

export async function getIntegal(ctx, data) {
  return ctx.get(`/patient/${data.where.patientId}/rewardpoints/record`, {
    skip: data.skip,
    limit: data.limit,
  });
}

const SmartComponentApi = {
  getDisease,
  getChronicDisease,
  getGrading,
  getHospital,
  getAllHospital,
  get1Hospital,
  get3Hospital,
  getAvailableHospital,
  getTagsByType,
  getMedicine,
  getTaskType: (ctx) => getTaskType(ctx, 1),
  getDoctor,
  getRegisterSource,
  searchPatient,
  searchPatientAll,
  searchPatientCount,
  getDrug,
  getRegularMedication,
  postRegularMedication,
  deleteRegularMedication,
  getReceiverAddress,
};

export async function callSmartComponentApi(ctx, name, ...rest) {
  return SmartComponentApi[name](ctx, ...rest);
}
