import React, { Component } from 'react'
import { Row, Col ,Button,Select,Input ,Table,DatePicker,Modal,message,Spin } from 'antd';
import './active.scss'
import api from '../../../api/api';
import history from '../../../history'
import HasPermission, { testPermission } from '../../common/HasPermission';
const { Option } = Select;
const { Column } = Table;
const { RangePicker } = DatePicker;
export default class activelist extends Component {
    constructor(props){
        super(props)
        this.state={
            activeList:[],
            nameValue:'',
            chooseTime:[],
            visible:false,
            page:1,
            pageSize:10,
            nowCode:'',
            count:0,
            spinning:false
        }
    }
    componentDidMount(){
        //获取一个local如果又就直接请求数据
        let data=JSON.parse(window.localStorage.getItem('localCode'))
        console.log('缓存中的',data)
        if(data){
            this.setState({
                nameValue:data.nameValue,
                startDate:data.startDate,
                endDate:data.endDate,
                page:data.page,
                pageSize:data.pageSize
            },()=>{
                this.getList(data)
            })
            
        }
    }
    //获取选择得日期
    getChooseData(data,string){
        this.setState({
            chooseTime:string
        })
    }
    //获取输入得姓名
    setName(e){
        this.setState({
            nameValue:e.target.value
        })
    }
    //监听回车
    mouseeVENT(e){
        console.log(e.which)
        if(e.which===13){
            this.getList()
        }
    }
    // 获取数据
    async getList(code){
        this.setState({
            spinning:true
        })
        let param={}
        if(code){
            if(code.nameValue){
                param.code=code.nameValue
            }
            if(code.startDate){
                param.startDate=code.startDate
            }
            if(code.endDate){
                param.endDate=code.endDate
            }
            param.skip=code.page*code.pageSize-code.pageSize
            param.limit=code.pageSize
        }else{
            if(this.state.nameValue){
                param.code=this.state.nameValue
            }
            if(this.state.chooseTime[0]){
                param.startDate=this.state.chooseTime[0]
            }
            if(this.state.chooseTime[1]){
                param.endDate=this.state.chooseTime[1]
            }
            param.skip=this.state.page*this.state.pageSize-this.state.pageSize
            param.limit=this.state.pageSize
        }
        try {
            //这里经过重置判断
            if(param.code || this.state.chooseTime[0] || this.state.chooseTime[1]){
                param.skip=0
            }
            //存储一个local，
            window.localStorage.setItem('localCode',JSON.stringify({
                code:param.code,
                startDate:param.startDate,
                endDate:param.endDate,
                page:this.state.page,
                pageSize:this.state.pageSize
            }))
            const list = await api.getActiveList(param);
            this.setState({
                activeList:list,
                count:list.length,
                spinning:false
            },()=>{
                
            })
        } catch (error) {
            console.log(error)
            message.error('获取列表失败！');
        }
    
    }
    //查看订单
    view(text){
        history.push(`/patientInsuranceDetail/${text.insurOrderId}`);
    }
    //移除激活码
    async removeCode(text){
        this.setState({
            visible: true,
            nowCode:text.code
        });
        console.log(text)
    }
    //分页
    handleTableChange(page){
        this.setState({
            page:page
        },()=>{
            this.getList()
        })
        console.log(page)
    }
    changePageSize(pageSize,current){
        this.setState({
          pageSize: pageSize,
        },()=>{
            this.getList()
        });
    }
    //弹窗
    handleOk= async ()=>{
        try {
            const success = await api.removeCode({code:this.state.nowCode});
            if(success===null){
                this.getList()
            }
        } catch (error) {
            console.log(error)
            message.error('激活码移除失败！');
        }
        this.setState({
            visible: false,
        });
    }
    handleCancel=()=>{
        this.setState({
            visible: false,
        });
    }
    render() {
        const {activeList,page,nameValue,count,pageSize,spinning}=this.state;
        const paginationProps = {
            showSizeChanger:true,
            total: count === pageSize ? pageSize*page + 1 : (count===0?pageSize*page:pageSize*(page-1)+count),
            showTotal: () => `第 ${page} 页`,
            pageSizeOptions: ['10', '20', '50', '100'],
            current: page,
            pageSize: pageSize,
            onChange:(current)=>this.handleTableChange(current),
            onShowSizeChange: (current,pageSize) => this.changePageSize(pageSize,current),
          }
        return (
            <div className="active_code_box">
                <div className="options_box">
                    <Row>
                        <Col span={2} style={{marginRight:'10px'}}>
                            <Select defaultValue="激活码" >
                                <Option value="激活码">激活码</Option>
                            </Select>
                        </Col>
                        <Col span={3} style={{marginRight:'10px'}}>
                            <Input placeholder="请输入激活码" value={nameValue} onChange={(e)=>this.setName(e)} onKeyPress={(e)=>this.mouseeVENT(e)}/>
                        </Col>
                        <Col span={4} style={{marginRight:'10px'}}>
                            <RangePicker
                                onChange={(data,dataString)=>this.getChooseData(data,dataString)}
                                format={'YYYY-MM-DD'}
                            />
                        </Col>
                        <Col span={2} style={{marginRight:'10px'}}>
                            <Button style={{ width: '100%', 'minWidth': 0 }} type="primary" onClick={()=>this.getList()}>查询</Button>
                        </Col>
                    </Row>
                </div>
                <Spin spinning={spinning}>
                    <div className="table_box">
                    <Table dataSource={activeList} pagination={paginationProps}>
                        <Column title="批次" dataIndex="num"  />
                        <Column title="激活码" dataIndex="code"  />
                        <Column title="服务单编号" dataIndex="insurOrderNo"  />
                        <Column
                        title="服务包"
                        dataIndex="packageName"
                        
                        />
                        <Column
                        title="服务包编码"
                        dataIndex="packageCode"
                        
                        />
                        <Column title="激活码状态" dataIndex="status" render={(status)=>{
                                if(status===0){
                                    return <span>待使用</span>
                                }else if(status===1){
                                    return <span>已使用</span>
                                }else if(status===2){
                                    return <span>已废弃</span>
                                }

                        }}/>
                        <Column title="使用时间" dataIndex="useDate" />
                        <Column title="操作" render={(text) => {
                            if(text.status===1){
                                return <span onClick={()=>this.view(text)}>查看订单</span>
                            }else if(text.status===0 && testPermission('insurance:activation:cancel')){
                                return <span onClick={()=>this.removeCode(text)}>作废</span>
                            }else if(text.status===2){
                                return ''
                            }
                        }}
                        />
                    </Table>
                    </div>
                </Spin >
                <Modal
                    title=''
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    >
                    <p>作废则激活码不可使用，确定要作废吗？</p>
                </Modal>
            </div>
        )
    }
}
