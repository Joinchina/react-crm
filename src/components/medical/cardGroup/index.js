import React, { Component } from 'react'
import { Form, Icon, Input, Button ,Select,DatePicker,TimePicker ,Spin,Table,Modal,Upload, message} from 'antd';
import moment from 'moment'
import Page from '../../common/zcomponents/Pagination'
import './index.scss'
import {GetRequest} from '../../common/getURl'
import { requestGet,requestPost,uploadFile} from '../../../createRequest.js'
import HasPermission, { testPermission } from '../../common/HasPermission';
const { Option } = Select;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const cardStatus = [
    {
        key:1,
        item:'未绑定'
    },
    {
        key:2,
        item:'已绑定'
    },
    {
        key:3,
        item:'已使用'
    },
    {
        key:4,
        item:'待回收'
    },
    {
        key:5,
        item:'已回收'
    },
    {
        key:6,
        item:'已失效'
    }
]

class cardGroup extends Component {
    constructor(props){
        super(props)
        console.log('哦是props',props)
        this.state={
            page:0,
            pageSize:10,
            count:0,
            tableData:[],
            modelData:{
                visible:false,
                title:''
            },
            selectedRows:[],
            report:false,
            reportInfo:'',
            allreport:false,
            allreportInfo:{},
            nodatavisible:false,
            selectedRowKeys:[],
        }
    }
    componentDidMount(){
        const {setFieldsValue}=this.props.form;
        setFieldsValue({'type':'1'});
        const urlObj=GetRequest()
        //判断路由中是否有搜索条件有就检索没有跳过
        // if(Object.keys(urlObj).length>0){
        //     console.log(urlObj)
        //     this.getdata(urlObj)
        // }
    }
    //监听回车
    mouseeVENT(e){
        console.log(e.which)
        if(e.which===13){
            this.handleSubmit()
        }
    }
    async handleSubmit(number){
        console.log(number)
        if(number){
            this.state.page=0;
            this.setState({
                page:0,
            })
        }
        this.props.form.validateFieldsAndScroll((err, values) => {
            //获取列表数据
            let obj={
                cardNo:values.cardId,
                status:values.status,
                expirationTimeStart:values.resultTime&&values.resultTime.length>0?moment(values.resultTime[0]).format('YYYY-MM-DD'):null,
                expirationTimeEnd:values.resultTime&&values.resultTime.length>0?moment(values.resultTime[1]).format('YYYY-MM-DD'):null,
                createDateStart:values.importTime&&values.importTime.length>0?moment(values.importTime[0]).format('YYYY-MM-DD'):null,
                createDateEnd:values.importTime&&values.importTime.length>0?moment(values.importTime[1]).format('YYYY-MM-DD'):null,
                limit:this.state.pageSize+1,
                skip:this.state.page===0?0:(this.state.page-1)*this.state.pageSize,
                orderByType:1,
            }
            //兼容后端接口
            for (const key in obj) {
                if(!obj[key]&&key!='skip'){
                    delete obj[key]
                }
            }
            console.log('我是最后得数据',obj)
            //获取数据
            this.getdata(obj);
            this.addRouter(obj)
        });

    }
    //将数据放置到url中，方便刷新回退时有数据
    addRouter(obj){
        //这一步将数据添加到路由到回得时候保证又数据
        let routerStr='';
        for (const key in JSON.parse(JSON.stringify(obj))) {
            routerStr+=`&${key}=${obj[key]}`
        }
        routerStr=routerStr.substring(1,routerStr.length)
        this.props.history.push(`/medicalcard?${routerStr}`)
    }
    //获取数据
    getdata(obj){
        //获取数据
        if(obj.skip==1){
            obj.skip=0
        }
        console.log("woshi obj",obj)
        requestGet('_api/hd/medicalExaminationCards',obj).then(res=>{
            this.setState({
                count:res.length===this.state.pageSize+1?res.length-1:res.length,
                tableData:res.length===this.state.pageSize+1?res.slice(0,res.length-1):res
            })
        }).catch(err=>{
            console.log("出错了",err)
        })
    }
    onChangeresultTime=(date, dateString)=>{
        this.props.form.setFieldsValue({'resultTime':`${dateString}`})
        console.log( dateString)
    }
    onChangeimportTime=(date, dateString)=>{
        this.props.form.setFieldsValue({'importTime':dateString})
        console.log( dateString)
    }
    columns = [
        {
            title: '体检卡号',
            dataIndex: 'cardNo',
        },
        {
            title: '体检卡状态',
            dataIndex: 'status',
            render: status => {
                switch (status) {
                    case 1:
                        return '未绑定'
                        break;
                    case 2:
                        return '已绑定'
                        break;
                    case 3:
                        return '已使用'
                        break;
                    case 4:
                        return '待回收'
                        break;
                    case 5:
                        return '已回收'
                        break;
                    case 6:
                        return '已失效'
                        break;
                    default:
                        break;
                }
            },
        },
        {
            title: '有效期',
            // dataIndex: 'expirationTime',
            render:item=>{
                return item.expirationTime.substring(0,10)
            }
        },
        {
            title: '适用性别',
            dataIndex: 'gender',
        },
        {
            title: '适用年龄',
            render: item => {
                if(item.minAge==null){
                    return '通用'
                }else{
                    return `${item.minAge}-${item.maxAge}`
                }
            },
        },
        {
            title: '体检套餐',
            dataIndex: 'packageTitle',
        },
        {
            title: '导入人',
            dataIndex: 'createByName',
        },
        {
            title: '导入时间',
            dataIndex: 'createDate',
        },
    ];
    pageChange=(index)=>{
        console.log("当前点击了多少页",index)
        this.setState({
            page:index,
            selectedRowKeys:[]
        },()=>{
            this.handleSubmit()
        })
    }
    currentChange=(index)=>{
        console.log("每页展示多少条改变了",index)
        this.setState({
            page:1,
            pageSize:index,
            count:0,
            selectedRowKeys:[]
        },()=>{
            this.handleSubmit()
        })
    }
    //回收
    recycling=()=>{
        const {selectedRows}=this.state
        let obj={
            title:'体检卡回收确认',
            visible:true
        }
        let ids=[];
        for (let index = 0; index < selectedRows.length; index++) {
            let data=selectedRows[index];
            if(data.status===4){
                ids.push(data.id)
            }
        };
        if(ids.length!=0){
            this.setState({
                modelData:obj
            })
        }else{
            this.setState({
                nodatavisible:true
            })
        }
    }
    //体检卡回收接口
    medicalRecyle(){
        let ids=[];
        for (let index = 0; index < this.state.selectedRows.length; index++) {
            let data=this.state.selectedRows[index];
            if(data.status===4){
                ids.push(data.id)
            }
        };
        requestPost(`_api/hd/medicalExaminationCards/recycle?ids=[${ids}]`,{}).then(res=>{
            this.handleCancel()
            this.handleSubmit()
        }).catch(err=>{
            console.log("出错了",err)
        })
    }
    handleOk(str){
        console.log(str)
        if(str==='体检卡回收确认'){
            console.log("回收的数据",this.state.selectedRows)
            this.setState({
                selectedRowKeys:[],
                selectedRows:[]
            })
            this.medicalRecyle()
        }
    }
    handleCancel(){
        let obj={
            title:'',
            visible:false
        }
        this.setState({
            modelData:obj,
            selectedRows:[],

        })

    }
    //上传
    customRequest(info){
        console.log("上传得信息",info)
        uploadFile('_api/hd/medicalExaminationCards/import',info.file,(progress=>{
            console.log("上传进度",progress)
        })).then(res=>{
            if(res.code!=0){
                //失败了
                this.setState({
                    report:true,
                    reportInfo:res.message
                })
            }
            if(res.code===0){
                //导入成功
                this.setState({
                    allreport:true,
                    allreportInfo:res.data
                })
                this.handleSubmit()
            }
        }).catch(err=>{
            console.log("导入错误 ",err)
        })
    }
    //设置体检卡号
    setCardId(value){
        const {setFieldsValue}=this.props.form
        console.log(value.target.value)
        setFieldsValue({'cardId':value.target.value})
    }
    //设置体检卡状态
    setSelected(value){
        console.log(value)
        const {setFieldsValue}=this.props.form
        setFieldsValue({'status':value})
    }
    //导出体检卡
    export(){
        const urlObj=GetRequest()
        //判断路由中是否有搜索条件有就检索没有跳过
        if(Object.keys(urlObj).length>0){
            //删除掉对象中得limit: "11" orderByType: "1" skip: "0"
            delete urlObj.limit
            delete urlObj.orderByType
            delete urlObj.skip
            let str=''
            for (const key in urlObj) {
                let par=urlObj[key]
                str+=`${key}=${par}&`
            }
            str=str.substring(0,str.length-1)
            console.log(str)
            window.open(`/_api/hd/medicalExaminationCards/export?${str}`,'_blank')
        }
    }
    //导出模板
    exportTemplate(){
        window.open('_api/hd/download/template')
    }
    onSelectChange = (selectedRowKeys,selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys,selectedRows);

        this.setState({
            selectedRowKeys,
            selectedRows
        })
    };
    render() {
        const {getFieldDecorator}=this.props.form
        const {page,pageSize,count,tableData,modelData,report,reportInfo,allreport,allreportInfo,nodatavisible,selectedRowKeys}=this.state
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
        const rowSelection= {
            selectedRowKeys,
            onChange:this.onSelectChange
        };
        return (
            <div className="medical_box">
                <div className="medical_hearder">
                <Form layout="inline">
                    <Form.Item>
                        {getFieldDecorator('type')(
                            <Select style={{ minWidth: 100 }} placeholder="请选择类型">
                                <Option value="1">体检卡号</Option>
                            </Select>,
                        )}
                    </Form.Item>
                    <Form.Item >
                        {getFieldDecorator('cardId')(
                            <Input
                            type="text"
                            placeholder="请输入体检卡号"
                            onChange={(e)=>this.setCardId(e)}
                            onKeyPress={(e)=>this.mouseeVENT(e)}
                            />,
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('status')(
                            <Select style={{ minWidth: 140 }}  placeholder="请选择体检卡状态" onChange={(value)=>this.setSelected(value)} allowClear={true}>
                                {cardStatus.map(item=>{
                                    return (
                                        <Option value={`${item.key}`} key={item.key}>{item.item}</Option>
                                    )
                                })}
                            </Select>,
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('resultTime')(
                            <RangePicker onChange={this.onChangeresultTime} placeholder={['有效期开始时间','有效期结束时间']}/>
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('importTime')(
                            <RangePicker onChange={this.onChangeimportTime} placeholder={['导入时间开始时间','导入时间结束时间']}/>
                        )}
                    </Form.Item>
                    <Button type="primary" onClick={()=>this.handleSubmit(1)} style={{marginRight:'16PX'}}>查询</Button>
                    {
                        testPermission('hd:medicalexaminationcard:import')?<Button type="primary" onClick={this.recycling}>回收</Button>:null
                    }
                </Form>
                </div>
                <div className="medical_table">
                    <Spin spinning={false}>
                        <Table
                        rowSelection={rowSelection}
                        columns={this.columns}
                        dataSource={tableData}
                        pagination={paginationProps} />
                    </Spin>
                </div>
                <div className="medical_footer">
                     <div className="left">
                         <Button type="primary" style={{marginRight:'16PX'}} onClick={()=>this.exportTemplate()}>模板下载</Button>
                         {
                            testPermission('hd:medicalexaminationcard:import')?<Upload
                                multiple={false}
                                showUploadList={false}
                                customRequest={(info)=>this.customRequest(info)}
                            >
                                <Button type="primary" style={{marginRight:'16PX'}}>导入体检卡</Button>
                            </Upload>:null
                         }

                         {
                             testPermission('hd:medicalexaminationcard:export')?<Button type="primary" style={{marginRight:'16PX'}} onClick={()=>this.export()}>导出体检卡</Button>:null
                         }
                         <span style={{color:"red"}}>备注：请确保导入的数据全部为文本格式</span>
                     </div>
                </div>
                <Modal
                    title='体检卡回收确认'
                    visible={nodatavisible}
                    footer={<Button type="primary" onClick={()=>this.setState({nodatavisible:false})}>确定</Button>}
                    onCancel={()=>this.setState({nodatavisible:false})}
                >
                    <p>请选择可回收体检卡进行回收！</p>
                </Modal>
                <Modal
                    title={modelData.title}
                    visible={modelData.visible}
                    onOk={()=>this.handleOk(modelData.title)}
                    onCancel={()=>this.handleCancel()}
                >
                    {
                       modelData.title&&modelData.title==='体检卡回收确认'?<p>已选中的“可回收”状态的体检卡，将被回收</p>:<div>
                           <p>共计{modelData.title}张体检卡，含</p>
                           <p>新卡导入{modelData.title}张</p>
                           <p>更新导入{modelData.title}张</p>
                           <p>已绑定而无法导入{modelData.title}张</p>
                           </div>
                    }
                </Modal>
                <Modal
                    title='体检卡导入失败提示'
                    visible={report}
                    onCancel={()=>this.setState({report:false})}
                    footer={<Button type="primary" onClick={()=>this.setState({report:false})}>确定</Button>}
                >
                    <p>体检卡导入失败</p>
                    <div>
                        <p>{reportInfo}</p>
                    </div>

                </Modal>
                <Modal
                    title='体检卡批量导入确认'
                    visible={allreport}
                    onCancel={()=>this.setState({allreport:false})}
                    footer={<Button type="primary" onClick={()=>this.setState({allreport:false})}>确定</Button>}
                >
                    <p>共计{allreportInfo.amount}张体检卡，含：</p>
                    <div>
                        <p>新卡导入{allreportInfo.add}张</p>
                        <p>更新导入{allreportInfo.update}张</p>
                        <p>已绑定而无法导入{allreportInfo.error}张</p>
                    </div>

                </Modal>
            </div>
        )
    }
}
const cardGroupDom = Form.create()(cardGroup);
export default cardGroupDom
