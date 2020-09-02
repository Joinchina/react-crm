import React, {Component} from 'react'
import moment from 'moment'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {Form, Select, Row, Col, Spin} from 'antd'
import SelectPlaceholder from '../common/SelectPlaceholder';
import { sex, orderStatus, taskStatus } from '../../helpers/enums';
import connectRouter from '../../mixins/router';
import SelectSingleTaskType from '../common/SelectSingleTaskType';
import card from './iscard.png'

const Option = Select.Option

import { search, reset } from '../../states/searchForm'

const colStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}
class Search extends Component {

    state = {
        searchType: 'customer'
    }

    handleSearch = value => {
        this.props.search(this.state.searchType, value);
        this.setState({
            keyword: value
        });
    }

    handleOnSelectSearchType = (value, option) => {
        this.setState({ searchType: value, keyword: '' })
        this.props.search(value, '');
    }

    handleOnSelect = (id) => {
        const type = this.state.searchType;
        if (type === 'customer') {
            this.props.router.push(`/customerDetails/${id}`)
        } else if (type === 'order') {
            this.props.router.push(`/orderDetails/${id}`)
        } else if (type === 'task') {
            this.props.router.push(`/taskDetail/${id}`)
        }
        this.setState({ keyword: '' })
        this.props.reset();
    }

    renderOptions() {
        if (!this.state.keyword) {
            return null;
        }
        let keyword;
        const type = this.state.searchType;
        if (type === 'customer') {
            keyword = '会员';
        } else if (type === 'order') {
            keyword = '订单';
        } else if (type === 'task') {
            keyword = '任务';
        }
        switch (this.props.result.status) {
            case 'fulfilled':
                if (!this.props.result.payload.list) {
                    return null;
                }
                if (this.props.result.payload.list.length === 0) {
                    return <Select.Option className="more" value={null} disabled>未查询到与“{this.props.result.params}”匹配的{keyword}</Select.Option>
                }
                return this.props.result.payload.list.map((item, i) => {
                    if (i === 10) {
                        return <Select.Option key="" className="more" value={null} disabled>搜索结果过多，请尝试输入全名或其他信息</Select.Option>
                    }
                    if (type === 'customer') {
                        return this.renderCustomer(item, i);
                    } else if (type === 'order') {
                        return this.renderOrder(item, i);
                    } else if (type === 'task') {
                        return this.renderTask(item, i);
                    }
                    return null;
                })
            case 'pending':
            case 'rejected':
                let errorTip
                if (this.props.result.payload && this.props.result.payload.status == '403') {
                    errorTip = '权限不足，请联系管理员'
                }
                return <Select.Option value={null} disabled><SelectPlaceholder keyword={keyword} status={this.props.result.status} errorTip={errorTip}/></Select.Option>;
            default:
                return null;
        }
    }

    colorfulStrIfEqual = (str) => {
      let searchText = this.props.result.params
      return str == searchText ? <span style={{color:'red'}}>{str}</span> : str
    }

    colorfulStr(str){
      let searchText = this.props.result.params
      let regex = new RegExp(searchText, 'g')
      let str1 = str.replace(regex, '|^^^|')
      let opt = []
      let optSplit = str1.split('|')
      optSplit.forEach((row, index) => {
        if(row === '^^^'){
          opt.push(<span key={index} style={{color:'red'}}>{searchText}</span>)
        }else if(row !== ''){
          opt.push(<span key={index}>{row}</span>)
        }
      })
      return opt
    }

    renderCustomer(p, i){
        let searchText = this.props.result.params
        const b = moment(p.birthday);
        const age = moment().year() - b.year();
        return <Select.Option key={p.id} value={p.id}>
          <Row>
            <Col style={colStyle} span={3} title={p.name}>{this.colorfulStr(p.name)}</Col>
            <Col style={colStyle} span={2} title={p.name}><img src={p.levelIcon} style={{ maxHeight: 30, marginTop: 5 }} /></Col>
            <Col style={colStyle} span={2} title={p.name}><img src={p.isCertification ? card : ''} style={{ width: 32, marginTop: 5 }} /></Col>
            <Col style={colStyle} span={6} title={`（${sex.map[p.sex]}/${age}岁/${p.idCard}）`}>（{sex.map[p.sex]}/{age}岁/{this.colorfulStrIfEqual(p.idCard)}）</Col>
            <Col style={colStyle} span={5} title={`${p.phone ? p.phone : ''}${p.phone && p.machineNumber ? '/' : ''}${p.machineNumber ? p.machineNumber : ''}`}>{p.phone ? this.colorfulStrIfEqual(p.phone) : ''}{p.phone && p.machineNumber ? '/' : ''}{p.machineNumber ? this.colorfulStrIfEqual(p.machineNumber) : ''}</Col>
            <Col style={colStyle} span={6} title={p.hospitalName}>{p.hospitalName}</Col>
          </Row>
        </Select.Option>
    }

    renderOrder(o, i){
        return <Select.Option key={o.id} value={o.id}>
          <Row>
            <Col style={colStyle} span={3} title={o.patientName}>{this.colorfulStr(o.patientName)}</Col>
            <Col style={colStyle} span={9} title={`${o.orderNo}（${o.orderDate}）`}>{this.colorfulStrIfEqual(o.orderNo)}（{o.orderDate}）</Col>
            <Col style={colStyle} span={4} title={orderStatus.map[o.status]}>{orderStatus.map[o.status]}</Col>
            <Col style={colStyle} span={8} title={o.hospitalName}>{o.hospitalName}</Col>
          </Row>
        </Select.Option>
    }

    renderTask(t, i){
        let taskType = <SelectSingleTaskType.Viewer value={{id:t.taskType}}/>
        return <Select.Option key={t.id} value={`${t.id}`}>
          <Row>
            <Col style={colStyle} span={6} title={t.company ? `${t.contactsName}（${t.company}）` : t.contactsName}>{this.colorfulStr(t.contactsName)}{ t.company ?`（${t.company}）` : null}</Col>
            <Col style={colStyle} span={4}>{taskType}</Col>
            <Col style={colStyle} span={10} title={t.updateDate}>{t.updateDate}</Col>
            <Col style={colStyle} span={4} title={taskStatus.map[t.taskStatus]}>{taskStatus.map[t.taskStatus]}</Col>
          </Row>
        </Select.Option>;
    }

    render() {
        const type = this.state.searchType;
        let placeholder;
        if (type === 'customer') {
            placeholder = '请输入会员姓名/身份证号/手机号/其他联系方式/会员卡号';
        } else if (type === 'order') {
            placeholder = '请输入会员姓名/身份证号/订单编号';
        } else if (type === 'task') {
            placeholder = '请输入会员姓名/主题/负责人';
        }
        return (
            <Form style={{
                marginTop: 12
            }} className='search-box'>
                <Row>
                    <Col span={4}>
                        <Form.Item style={{
                            marginRight: 5
                        }}>
                            <Select value={this.state.searchType} onSelect={this.handleOnSelectSearchType}>
                                <Option value='customer'>会员</Option>
                                <Option value='order'>订单</Option>
                                <Option value='task'>任务</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={20} id='globalSearchInput'>
                        <Form.Item >
                            <Select
                                dropdownClassName="global-search-dropdown"
                                //dropdownAlign={{ points: ['br', 'tr'] }}
                                //getPopupContainer={()=>document.getElementById('globalSearchInput')}
                                //dropdownStyle={{width: 600}}
                                value={this.state.keyword}
                                mode="combobox"
                                filterOption={false}
                                showSearch={true}
                                dropdownMatchSelectWidth={false}
                                // notFoundContent={emptyContent}
                                showArrow={false}
                                onSearch={this.handleSearch}
                                onSelect={this.handleOnSelect}
                                placeholder={placeholder}>
                                { this.renderOptions() }
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        )
    }
}

function select(state) {
    return { result: state.searchForm }
}

function mapDispachToProps(dispatch) {
    return bindActionCreators({
        search, reset
    }, dispatch)
}

export default connectRouter(connect(select, mapDispachToProps)(Search));
