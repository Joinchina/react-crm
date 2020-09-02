import { func } from 'prop-types';

export async function getGroupInsuranceList(ctx, where = {}, skip, limit) {
  return ctx.get(`/team_insurance`, { ...where, skip, limit });
}

export async function getGroupInsuranceInfo(ctx, insurId) {
  return ctx.get(`/team_insurance/${insurId}`);
}
export async function cancelGroupInsurance(ctx, insurId) {
  return ctx.put(`/team_insurance/${insurId}/cancel`);
}

export async function confirmGroupInsurance(
  ctx,
  insurId,
  confirmDate,
  insurOrderNo
) {
  return ctx.put(`/team_insurance/${insurId}/confirm`, {
    confirmDate,
    insurOrderNo,
  });
}

export async function getGroupInsuranceOrderList(ctx, insurId) {
  return ctx.get(`/team_insurance/${insurId}/order`);
}

export async function createGroupInsurance(ctx, data) {
  return ctx.post(`/team_insurance`, data);
}

export async function updateGroupInsurance(ctx, insurId, data) {
  return ctx.put(`/team_insurance/${insurId}`, data);
}

export async function createPatientInsurance(ctx, data) {
  return ctx.post(`/patient/insurance_order`, data);
}

export async function getInsuracePackage(ctx, idCard, poverty) {
  return ctx.get(`/insurance_package`, { idCard, poverty });
}

export async function checkIdCardWithPublicSecurity(
  ctx,
  patientId,
  patientName,
  idCard
) {
  return ctx.put(`/patient/${patientId}/certification`, {
    idCard,
    patientName,
  });
}

export async function insuranceAccountInfo(ctx, patientId) {
  return ctx.get(`/patient/${patientId}/insuranceAccountInfo`);
}
export async function getInsuranceOrderList(ctx, where, skip, limit) {
  where.skip = skip;
  where.limit = limit;
  return ctx.get(`/patient/insurance_order`, { ...where });
}

export async function getDiseaseInquiries(ctx, insurance_package_id) {
  return ctx.get(
    `/insurance_packages/${insurance_package_id}/disease_inquiries`
  );
}

export async function exportGroupInsuranceZip(ctx, insurance_package_id) {
  return ctx.get(`team_insurance/${insurance_package_id}/download`);
}

export async function getInsuranceOrderDetails(ctx, orderId) {
  return ctx.get(`/patients/service_order/${orderId}`);
}

export async function getInsuranceOrderInfo(ctx, orderId) {
  return ctx.get(`/v2/patients/insurance_order/${orderId}`);
}

export async function getHistoryPatientInfo(ctx, patientId) {
  return ctx.get(`/patients/${patientId}/insurance_order/histories`);
}

export async function checkPatientIdCard(ctx, patientId, name, idCard) {
  return ctx.post(`/patients/${patientId}/patientCertification`, {
    idCard,
    name,
  });
}
// 健康中心
export async function getMember(ctx, data) {
  return ctx.get(`/patients/purchase_voucher`, { ...data });
}
// 健康中心审核
export async function checkMemberStatus(ctx, id, status) {
  return ctx.post(`/patients/purchase_voucher/${id}/check`, { status });
}
export async function checkInsuranceCode(ctx, code) {
  return ctx.get(`/insurance_order/fork_code`, { code });
}

export async function getUserInsuranceList(ctx, userId) {
  return ctx.get(`/users/${userId}/insurance_package`);
}
export async function getActiveList(ctx, param) {
  const activeList = ctx.get(`/insurance/activation_code`, param);
  return activeList;
}
export async function removeCode(ctx, code) {
  const data = ctx.post(`/insurance/activation_code/cancel?code=${code.code}`);
  return data;
}
//查询用户渠道码
export async function getChannelCode(ctx, code) {
  const data = ctx.get(`/users/channelCode`);
  return data;
}
//获取体检卡列表
export async function getMedicalExaminationCards(ctx) {
  const data = ctx.get(`/hd/medicalExaminationC`);
  return data;
}
// 获取保险产品列表
export async function getInsuranceProductList(ctx) {
    const data = ctx.get(`/insurance/products`);
    return data
}
// 获取保险公司
export async function getInsuranceCompany(ctx) {
    const data = ctx.get(`/insurance/companies`);
    return data
}
// his查询处方
export async function getOrderDrafts(ctx,query) {
    const data = ctx.get(`/orderDrafts`,{...query});
    return data
}
