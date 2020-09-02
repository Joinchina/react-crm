import React, { Component } from 'react'
import { Form, Icon, Input, Button ,Select,DatePicker,TimePicker ,Spin,Table,Modal,Progress , message} from 'antd';
import moment from 'moment'
import Page from '../../common/zcomponents/Pagination'
import './index.scss'
import {GetRequest} from '../../common/getURl'
import { requestGet,requestPost,uploadFiles} from '../../../createRequest.js'
import HasPermission, { testPermission } from '../../common/HasPermission';
const { Option } = Select;
export default class index extends Component {
    constructor(props){
        super(props)
        console.log('哦是props',props)
        this.state={
            page:0,
            pageSize:10,
            count:0,
            tableData:[],
            report:false,
            reportInfo:{},
            progress:0,
            progressIndex:0,
        }
    }
    componentDidMount(){
        const urlObj=GetRequest()
        //判断路由中是否有搜索条件有就检索没有跳过
        if(Object.keys(urlObj).length>0){
            console.log(urlObj)
            let page=this.state.page
            if(page===1){
                page=0
            }
            this.getdata(urlObj)
        }else{
            this.getdata({skip:this.state.page,limit:this.state.pageSize+1})
        }

    }
    //获取数据
    getdata(obj){
        requestGet('_api/hd/medicalExaminationCards/report',obj).then(res=>{
            this.setState({
                count:res.length===this.state.pageSize+1?res.length-1:res.length,
                tableData:res.length===this.state.pageSize+1?res.slice(0,res.length-1):res,
            },()=>{
            })
        })
    }
    pageChange=(index)=>{
        console.log("当前点击了多少页",index)
        this.setState({
            page:index
        },()=>{
            this.getdata({skip:(this.state.page-1)*this.state.pageSize,limit:this.state.pageSize+1})
        })
    }
    currentChange=(index)=>{
        console.log("每页展示多少条改变了",index)
        this.setState({
            page:0,
            pageSize:index,
            count:0,
        },()=>{
            this.getdata({skip:this.state.page,limit:this.state.pageSize+1})
        })
    }
    
    
    //上传
    customRequest(e){
        const files = e.target.files;
        let file=[];
        for (const key in files) {
            const ele = files[key];
            if(typeof ele =='object'){
                console.log('看看类型',ele.type)
                if(ele.type==='application/pdf'){
                    file.push(ele)
                }else{
                    message.error("请检查导入得格式必须为pdf")
                    return
                }
                
            }
        }
        uploadFiles('_api/hd/medicalExaminationCards/uploadReport',file,(progress=>{
            this.setState({
                progress:progress
            })
        })).then(res=>{
            if(res.code!=0){
                //失败了
                console.log("失败",res)
                message.error(res.message)
            }
            if(res.code===0){
                //导入成功
                console.log("成功",res)
                this.setState({
                    report:true,
                    reportInfo:res.data
                })
                this.getdata({skip:this.state.page,limit:this.state.pageSize+1})
            }
        }).catch(err=>{
            console.log("导入错误 ",err)
            message.error(err.message)
        })
    }
    //查看失败文件
    view(data){
        console.log(data)
        data.errorMessage=data.result
        this.setState({
            report:true,
            reportInfo:data
        })
    }
    //表单
    columns = [
        {
            title: '导入人',
            dataIndex: 'createByName',
        },
        {
            title: '导入时间',
            dataIndex: 'createDate',
        },
        {
            title: '失败文件',
            render: item => {
                if(testPermission('hd:medicalexaminationcard:reportimport')){
                    return <a onClick={()=>this.view(item)}>查看</a>
                }else{
                    return ''
                }
            },
        },
    ];
    render() {
        const {page,pageSize,count,tableData,report,reportInfo,progressIndex,progress}=this.state
        console.log("分页信息",count,page)
        const paginationProps = {
            showSizeChanger:true,
            total: count === pageSize ? pageSize*(page+1) + 1 : (count===0?pageSize*page:pageSize*(page-1)+count),
            showTotal: () => `第 ${page===0?1:page} 页`,
            pageSizeOptions: ['10', '20', '50', '100'],
            current: page,
            pageSize: pageSize,
            onChange:(current)=>this.pageChange(current),
            onShowSizeChange: (current,pageSize) => this.currentChange(pageSize),
        }
        return (
            <div className="medical_box">
                <div className="files_box">
                    {
                        testPermission('hd:medicalexaminationcard:reportimport')?<div>
                            <Button type="primary" style={{marginRight:'16PX'}}>体检报告批量导入</Button>
                            <input type="file" multiple="multiple" name="file" id="file" onChange={(e)=>this.customRequest(e)}/>
                            {
                                progress!=0&&progress!=100?<div>
                                <p>正在上传报告,进度{progress}%</p>
                                <Progress percent={progress} size="small" showInfo={false}/>
                                </div>:null
                            }
                        </div>:null
                    }
                </div> 
                <div className="medical_table">
                    <Spin spinning={false}>
                        <Table
                        columns={this.columns}
                        dataSource={tableData}
                        pagination={paginationProps} />
                    </Spin>
                </div>
                <Modal
                    title='导入失败文件'
                    visible={report}
                    onCancel={()=>this.setState({report:false})}
                    footer={<Button type="primary" onClick={()=>this.setState({report:false})}>确定</Button>}
                >
                    <p>导入成功{reportInfo.success}个文件，导入失败{reportInfo.error}个文件</p>
                    <div>
                        {reportInfo.errorMessage}
                    </div>

                </Modal>
                
            </div>
        )
    }
}
