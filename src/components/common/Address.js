import React, { Component } from 'react';
import { Breadcrumb, Cascader, Row, Col, Input } from 'antd';
import { connect } from '../../states/components/address';
import { EditorSupports } from './form';

class Address extends Component {

    componentWillMount() {
        this.loadValue(this.props, { reloadIfReject: true });
    }

    loadData = (options) => {
        if (options.length === 1 && !options[0].children) {
            this.props.getCities(options[0].value);
        } else if (options.length === 2 && !options[1].children) {
            this.props.getAreas(options[0].value, options[1].value);
        }
    }

    componentWillReceiveProps(props) {
        this.loadValue(props,  { reloadIfReject: false })
    }

    loadValue(props, { reloadIfReject }){
        const list = this.props.list;
        if (!list || !list.provinces || (reloadIfReject && list.provinces.status === 'rejected')) {
            this.props.getProvinces();
        }
        const value = props.value;
        if (value) {
            const provinceId = value.liveProvinces || value.provincesId;
            if (provinceId) {
                const cityList = list && list.cities && list.cities[provinceId];
                if (!cityList || (reloadIfReject && cityList.status === 'rejected')) {
                    this.props.getCities(provinceId);
                }

                const cityId = value.liveCity || value.cityId;
                if (cityId) {
                    const areaList = list && list.areas && list.areas[cityId];
                    if (!areaList || (reloadIfReject && areaList.status === 'rejected')) {
                        this.props.getAreas(provinceId, cityId);
                    }
                }
            }
        }
    }

    onChangeSelection = (options) => {
        if (!this.props.onChange) return;
        const r = {};
        if (options.length > 0) {
            const provinceId = options[0];
            const province = this.props.tree.find(o => o.value === provinceId);
            r.liveProvinces = provinceId;
            r.provinceName = province.label;
            if (options.length > 1) {
                const cityId = options[1];
                const city = province.children.find(o => o.value === cityId);
                r.liveCity = cityId;
                r.cityName = city.label;
                if (options.length > 2) {
                    const areaId = options[2];
                    const area = city.children.find(o => o.value === areaId);
                    r.liveArea = areaId;
                    r.areaName = area.label;
                }
            }
        }
        r.liveStreet = this.props.value ? this.props.value.liveStreet : null;
        if (this.props.onChange) {
            this.props.onChange(r);
        }
    }

    onChangeDetail = (e) => {
        if (!this.props.onChange) return;
        const text = e.target.value;
        const v = this.props.value || {};
        this.props.onChange({
            ...v,
            liveStreet: text
        });
    }

    render() {
        const val = [];
        const value = this.props.value;
        if(value){
            if (value.liveProvinces || value.provincesId) {    
                val.push(value.liveProvinces ? value.liveProvinces : value.provincesId); 
                if (value.liveCity || value.cityId) {
                    val.push(value.liveCity ? value.liveCity : value.cityId);
                    if (value.liveArea || value.areaId) {
                        val.push(value.liveArea ? value.liveArea : value.areaId);
                    }
                }
            }
        }     
        return <Row>
            <Col span={this.props.addressCol}>
                <Cascader
                    value={val}
                    placeholder={this.props.addressPlaceholder}
                    options={this.props.tree}
                    loadData={this.loadData}
                    onChange={this.onChangeSelection}
                  />
            </Col>
            <Col span={this.props.detailCol}>
                <Input placeholder={this.props.detailPlaceholder} maxLength={this.props.maxLength} value={value && value.liveStreet ? value.liveStreet : value.street} onChange={this.onChangeDetail}/>
            </Col>
        </Row>
    }
}

const ConnectedAdderess = connect(Address);

ConnectedAdderess.Viewer = function AddressViewer(props){
    const { value, placeholder, ...otherProps } = props;
    if (!value) {
        return placeholder ? <Breadcrumb {...otherProps}>
            <Breadcrumb.Item>{placeholder}</Breadcrumb.Item>
        </Breadcrumb> : null;
    } else {
        return <Breadcrumb style={{wordWrap:'break-word'}} {...otherProps}>
            { value.provinceName ? <Breadcrumb.Item>{value.provinceName}</Breadcrumb.Item> : null}
            { value.cityName ? <Breadcrumb.Item>{value.cityName}</Breadcrumb.Item> : null}
            { value.areaName ? <Breadcrumb.Item>{value.areaName}</Breadcrumb.Item> : null}
            { value.liveStreet ? <Breadcrumb.Item>{value.liveStreet}</Breadcrumb.Item> : null}
        </Breadcrumb>
    }
}

ConnectedAdderess[EditorSupports.maxLength] = true;
export default ConnectedAdderess;
export { ConnectedAdderess as Address };
