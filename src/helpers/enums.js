export const sex = {
    map: {
        0: '女',
        1: '男'
    },
    options: [{
        value: '0',
        label: '女'
    }, {
        value: '1',
        label: '男'
    }]
};

export const taskStatus = {
    map: {
        0: '待处理',
        1: '处理中',
        2: '已完成',
        3: '系统关闭',
        4: '已关闭'
    },
    options: [
        {
            value: '0',
            label: '待处理',
        },{
            value: '1',
            label: '处理中',
        },{
            value: '2',
            label: '已完成',
        },{
            value: '4',
            label: '已关闭',
        },{
            value: '3',
            label: '系统关闭',
        }
    ],
    editable: {
        0: true,
        1: true
    }
}

export const orderStatus = generateMapFromOptions({
    options: [
        { value: '10', label: '初始订单' },
        { value: '20', label: '患者已确认' },
        { value: '30', label: '医生已确认' },
        { value: '35', label: '药师已确认' },
        { value: '40', label: '备药中' },
        { value: '45', label: '配送中' },
        { value: '50', label: '待取药' },
        { value: '60', label: '完成' },
        { value: '70', label: '完成'},
        { value: '97', label: '已驳回'},
        { value: '98', label: '撤单' },
        { value: '99', label: '完成' },
    ]
});

function generateMapFromOptions(obj) {
    obj.map = {};
    for (const opt of obj.options) {
        obj.map[opt.value] = opt.label;
    }
    return obj;
}

export const physicalType = {
    map: {
        1: '患者并发症及合并疾病',
        2: '2型糖尿病患者',
        3: '高血压患者',
    },
    options: [
        { value: 1, label: '患者并发症及合并疾病' },
        { value: 2, label: '2型糖尿病患者'},
        { value: 3, label: '高血压患者' },
    ]
}
