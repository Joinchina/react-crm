import { Component } from 'react'

export default class BaseComponent extends Component {

    constructor(props) {
        super(props)
        this.props = props
    }

    result(reducerName) {
        const reducer = this.props[reducerName]
        const status = reducer.status
        //const result = reducer.result || {}
        //return { loading: this._checkStatus(status, result), data: result.data }
        const updateState = reducer.updateState
        const updateResult = reducer.updateResult
        return {
            loading: this._checkStatus(status, reducer.result), data: reducer.result, params: reducer.params,
            updateResult: updateResult, updateState: updateState
        }
    }

    results(reducerName) {
        const reducer = this.props[reducerName]
        return (resultName) => {
            let result = reducer[resultName] || {}
            const status = result.status
            //result = result.result || {}
            //return { loading: this._checkStatus(status, result), data: result.data }
            return { loading: this._checkStatus(status, result.result), data: result.result }
        }
    }

    orderStatus(num) {
        num = isNaN(parseInt(num, 10)) ? num : parseInt(num, 10)
        switch (num) {
            case 10: return '初始订单';
            case 20: return '患者已确认';
            case 30: return '医生已确认';
            case 35: return '药师已确认';
            case 40: return '备药中';
            case 45: return '配送中';
            case 50: return '待取药';
            case 60: return '完成';
            case 70: return '完成';
            case 97: return '已驳回';
            case 98: return '撤单';
            case 99: return '完成';
            default: return num
        }
    }
    prescriptionStatus(num) {
        num = isNaN(parseInt(num, 10)) ? num : parseInt(num, 10)
        switch (num) {
            case 10: return '无处方';
            case 20: return '待接诊';
            case 30: return '开具中';
            case 40: return '申请失败';
            case 50: return '被拒开';
            case 60: return '有处方';
            default: return num
        }
    }
    sex(num) {
        switch (num) {
            case 0: return '女';
            case 1: return '男';
            default: return num;
        }
    }

    isDisabled(num) {
        switch (num) {
            case 0: return '正常';
            case 1: return '禁用';
            default: return num;
        }
    }

    isPay(num) {
        switch (num) {
            case 0: return '未支付';
            case 1: return '已支付';
            default: return '未支付';
        }
    }

    addListId(data) {
        if (Array.isArray(data)) {
            return data.map((item, index) => {
                item.id = index
                return item
            })
        }
        return data
    }

    _checkStatus(status, result) {
        let loading = true
        if (status === 'fulfilled') {
            loading = false
        }
        if (status === 'rejected') {
            const error = result || {}
            console.error(`
        status: ${error.status},
        code: ${error.code},
        message: ${error.message}`)
        }
        return loading
    }
}
