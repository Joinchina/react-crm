export async function getTaskType(ctx, groupType) {
    return await ctx.get('sys/enum/taskType', {
        groupType: groupType ? groupType : undefined
    });
}

export async function getTaskAnswerStatusForTaskType(ctx, taskType) {
    const r = await ctx.get(`sys/enum/taskAnswerStatus/${taskType}`);
    return {
        answerStatus: r.answerStatus && r.answerStatus.map(a => {
            if (a.value === '1' || a.value === '2') {
                return {
                    allowDeal: true,
                    hideDeal: r.dealStatus && r.dealStatus.length === 1,
                    ...a,
                };
            }
            return a;
        }),
        dealStatus: r.dealStatus && r.dealStatus.map(a => {
            let needRemarks;
            if (taskType === 4 && a.id === '3'){ //回收任务，拒绝
                needRemarks = true;
            }
            if ((taskType === 0 || taskType === 10 || taskType === 11 || taskType === 15 || taskType === 16)
                && a.id === '3') {
                //签约邀请，激活邀请，续订通知，预警干预，流失挽回, 拒绝
                needRemarks = '13';
            }
            if (a.id === '2') {
                return {
                    taskResultType: Array.isArray(a.taskResult) && a.taskResult.length > 0 ? 'delay' : 'delayNoReason',
                    ...a,
                }
            }
            if ((taskType === 0 || taskType === 10 || taskType === 15 || taskType === 16)
                && a.id === '1') {
                //续订通知，激活邀请，预警干预，流失挽回，同意
                return {
                    taskResultType: 'addOrder',
                    ...a,
                }
            }

            if (Array.isArray(a.taskResult) && a.taskResult.length > 0){
                return {
                    needRemarks,
                    taskResultType: 'choice',
                    ...a,
                }
            }
            if (needRemarks) {
                return {
                    needRemarks,
                    ...a,
                }
            }
            return a;
        })
    }
}
