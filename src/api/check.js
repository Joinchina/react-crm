export async function saveCcvdAssessment(ctx, patientId, data) {
    return ctx.post(`/patients/${patientId}/ccvdAssessment`, data);;
}

export async function savePrePhysicalQuestionnaire(ctx, patientId, data) {
    return ctx.post(`/patients/${patientId}/prePhysicalQuestionnaire`, data);;
}


export async function checkIsService(ctx, patientId) {
    return ctx.get(`/patient/${patientId}/insurance_order/inservice`)
}

// 查询服务包是否需要问询
export async function getInsuranceInquiries(ctx, packageId) {
    return ctx.get(`/insurance_package/${packageId}/inquiries`);
}
