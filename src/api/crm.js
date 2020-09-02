import moment from 'moment';
import { testPermission } from '../helpers/permission';

export async function getSystemUser(ctx, query) {
    const r = testPermission('crm.user.view') ? await ctx.get('crm/user', query) : [];
    return r;
}

export async function getSystemUserGroup(ctx, query) {
    return ctx.get('crm/userGroup', query);
}

export async function newTaskPool(ctx, data) {
    return ctx.post('crm/taskPool', {
        name: data.name,
        users: data.users,
        userGroup: data.userGroup,
        filters: data.filters,
        effectiveRule: data.effectiveRule,
        startDate: data.startDate,
        endDate: data.endDate,
        acceptRule: data.acceptRule,
        returnRule: data.returnRule,
        remarks: data.remarks,
    });
}


export async function getTask(ctx, where, skip, limit, count, order) {
    return ctx.get('crm/task', {
        where, skip, limit, count, order,
    });
}

export async function exportTaskList(ctx, query) {
    return ctx.post('_async/task-table', query);
}

export async function downloadExportedTaskList(ctx, query) {
    window.open(ctx.url('task-table', query));
}

export async function getTaskPool(ctx, where = {}, skip, limit, count, order) {
    return ctx.get('crm/taskPool', {
        skip,
        limit,
        count,
        order,
        name: where.name,
        remarks: where.remarks,
        createByName: where.createByName,
        status: where.status,
        userId: where.userId,
        effective: where.effective,
    });
}

export async function getTaskPoolById(ctx, id) {
    return ctx.get(`crm/taskPool/${id}`);
}

export async function getTaskById(ctx, id) {
    return ctx.get(`crm/task/${id}`);
}

export async function updateTaskPool(ctx, id, data) {
    return ctx.put(`crm/taskPool/${id}`, data);
}

export async function deleteTaskPool(ctx, id) {
    return ctx.delete(`crm/taskPool/${id}`);
}

export async function taskQuickActivation(ctx, start, end, companyId) {
    return ctx.post('/_async/quick-activation', {
        start: start && moment(start).format('YYYY-MM-DD'),
        end: end && moment(end).format('YYYY-MM-DD'),
        companyId,
    });
}

export async function handleTaskFromPool(ctx, taskPoolId) {
    return ctx.post(`/crm/taskPool/${taskPoolId}/receiving`);
}

export async function transferTask(ctx, taskId, userId) {
    return ctx.post(`/crm/task/${taskId}/transfer/${userId}`);
}

export async function processTask(ctx, taskId, data) {
    const {
        taskStatus, answerStatus, dealStatus, resultStatus, remarks, freeze, delayTime, templateId,
    } = data;
    return ctx.post(`/crm/task/${taskId}/processing`, {
        taskStatus,
        dealStatus,
        resultStatus,
        remarks,
        freeze,
        delayTime,
        templateId,
        answerStatus: answerStatus && {
            name: answerStatus.name,
            id: answerStatus.id,
            value: answerStatus.value,
        },
    });
}

export async function newProcessTask(ctx, data) {
    return ctx.post('/crm/task', data);
}

export async function createUserGroup(ctx, data) {
    return ctx.post('crm/userGroup', data);
}

export async function getUserGroupById(ctx, id) {
    return ctx.get(`crm/userGroup/${id}`);
}

export async function updateUserGroupById(ctx, id, data) {
    return ctx.put(`crm/userGroup/${id}`, data);
}

export async function getTaskHistory(ctx, id) {
    return ctx.get(`/crm/task/${id}/historyRecord`);
}

export async function getTaskRecords(ctx, id) {
    return ctx.get(`/crm/task/${id}/record`);
}
