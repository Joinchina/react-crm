export async function getWeixinBindPatients(ctx, openid, appid) {
    return ctx.get(`/weixin/bind/wx-user/${appid}/${openid}`);
}

export async function getWeixinBindByPatient(ctx, patientId) {
    return ctx.get(`/weixin/bind/patient/${patientId}`);
}

export async function getWeixinBindByPatientAndApp(ctx, appid, patientId) {
    return ctx.get(`/weixin/bind/patient/${appid}/${patientId}`);
}

export async function getWeixinInfo(ctx, openid, appid) {
    return ctx.get(`/weixin/wx-user/${appid}/${openid}`);
}

export async function bindWeixinWithPatient(ctx, appid, openid, patientId) {
    return ctx.put(`/weixin/bind/patient/${appid}/${patientId}`, {
        single: 1,
        openid
    });
}

export async function getInsuranceDiseases(ctx, insuranceId) {
    return ctx.get(`/weixin/insurance/disease/${insuranceId}`);
}

// 获取问询
export async function getEnquiryList(ctx, inquiryId) {
    return ctx.get(`/weixin/getenquiry/${inquiryId}`);
}
