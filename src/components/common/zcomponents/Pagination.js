import React, { Component } from 'react'
import { Pagination } from 'antd';
import './all.scss'
export default class index extends Component {
    constructor(props){
        super(props)
        this.state={
            totall:0,
        }
    }

    render() {
        const {count,page,pageSize,pageChange,currentChange}=this.props
        const totall = count === pageSize ? pageSize*(page+1) + 1 : (count===0?pageSize*page:pageSize*(page-1)+count)
        console.log('分页',this.state.totall)
        return (
            <div className="z_pagination">
                <Pagination
                showSizeChanger={true}
                total= {totall}
                showTotal={() => `第 ${page===0?1:page} 页`}
                pageSizeOptions={ ['10', '20', '50', '100']}
                current={ page}
                pageSize= {pageSize}
                onChange={(current)=>pageChange(current)}
                onShowSizeChange= {(current,pageSize) => currentChange(pageSize,current)}
                />
            </div>
        )
    }
}
