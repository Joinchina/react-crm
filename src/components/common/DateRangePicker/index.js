import React, { Component } from 'react'
import { Row, Col, Input, Select, DatePicker, Button, Table, Modal, Menu, Dropdown, Calendar, Icon } from 'antd'
import CalendarLocale from 'rc-calendar/lib/locale/zh_CN';
import RcCalendar from 'rc-calendar';
import moment from 'moment';
import blacklist from 'blacklist';
import { closest, isTag, hasClass } from '../../../helpers/dom';

import './index.scss';



class DateRangePicker extends Component {
    constructor(props){
        super(props)
    }
    state = {
        visible: false,
    };

    onVisibleChange = (visible) => {
        if (visible) {
            console.log('一餐那个',this.props)
            this.setState({
                visible,
                startDate: this.props.value && this.props.value[0],
                visibleStartDate: this.props.value && this.props.value[0],
                endDate: this.props.value && this.props.value[1],
                visibleEndDate: this.props.value && this.props.value[1],
            });
        } else {
            this.setState({
                visible,
            });
        }
    }

    save = (event) => {
        const r = [];
        if (this.state.startDate) {
            r.push(this.state.startDate);
        }
        if (this.state.endDate) {
            if (r.length === 0) {
                r.push(null)
            }
            r.push(this.state.endDate);
        }
        // console.log(r)
        if (this.props.onChange) {
            this.props.onChange(r);
        }
        console.log(this.props)
        if(this.props.getData){
            // console.log(r)
            this.props.getData(r)
        }
    }

    renderLeftFooter = () => {
        return <div className="wh-daterange-picker-footer">
            <Button size="small" onClick={this.changeStartDateToToday}>今天</Button>
            <Button size="small" onClick={this.changeStartDateToEmpty}>清空</Button>
        </div>
    }

    renderRightFooter = () => {
        return <div className="wh-daterange-picker-footer">
            <Button size="small" onClick={this.changeEndDateToToday}>今天</Button>
            <Button size="small" onClick={this.changeEndDateToEmpty}>清空</Button>
        </div>
    }

    changeStartDate = (moment) => {
        if (this.state.endDate && this.state.endDate.isBefore(moment)) {
            this.setState({
                startDate: moment,
                visibleStartDate: moment,
                endDate: moment,
                visibleEndDate: moment,
            });
        } else {
            this.setState({
                startDate: moment,
                visibleStartDate: moment,
            });
        }
    }

    changeStartDateToToday = () => {
        this.changeStartDate(moment());
    }

    changeStartDateToEmpty = () => {
        this.changeStartDate(null);
    }

    changeEndDate = (moment) => {
        if (this.state.startDate && this.state.startDate.isAfter(moment)) {
            this.setState({
                startDate: moment,
                visibleStartDate: moment,
                endDate: moment,
                visibleEndDate: moment,
            });
        } else {
            this.setState({
                endDate: moment,
                visibleEndDate: moment,
            });
        }
    }

    changeEndDateToToday = () => {
        this.changeEndDate(moment());
    }

    changeEndDateToEmpty = () => {
        this.changeEndDate(null);
    }

    cancelEvent = (e) => {
        const dontStopPropagation = hasClass('hide-popup')(closest(isTag('button'))(e.target));
        if (!dontStopPropagation) {
            e.stopPropagation();
        }
    }

    onVisibleStartDateChange = (date) => {
        this.setState({
            visibleStartDate: this.inSameMonth(this.state.startDate, date) ? this.state.startDate : date,
        });
    }

    syncStartDate = () => {
        this.onVisibleStartDateChange(this.state.startDate);
    }

    onVisibleEndDateChange = (date) => {
        this.setState({
            visibleEndDate: this.inSameMonth(this.state.endDate, date) ? this.state.endDate : date,
        });
    }

    syncEndDate = () => {
        this.onVisibleEndDateChange(this.state.endDate);
    }

    inSameMonth(a, b) {
        if (!a || !b) return false;
        const na = a.year() * 12 + a.month();
        const nb = b.year() * 12 + b.month();
        return na === nb;
    }

    render() {
        const menu = <Menu className="wh-daterange-picker">
            <Menu.Item>
                <div onClick={this.cancelEvent}>
                    <div className="wh-daterange-picker-header">
                        已选择：
                        {
                            this.state.startDate ?
                            <span className="wh-daterange-picker-date clickable" onClick={this.syncStartDate}>{this.state.startDate.format('YYYY-MM-DD')}</span>
                            :
                            <span className="wh-daterange-picker-placeholder">开始时间</span>
                        }
                        <span className="wh-daterange-picker-sep">~</span>
                        {
                            this.state.endDate ?
                            <span className="wh-daterange-picker-date clickable" onClick={this.syncEndDate}>{this.state.endDate.format('YYYY-MM-DD')}</span>
                            :
                            <span className="wh-daterange-picker-placeholder">结束时间</span>
                        }
                        <div className="wh-daterange-picker-op">
                            <Button className="hide-popup" size="small" type="primary" onClick={this.save}>确定</Button>
                            <Button className="hide-popup" size="small" onClick={this.hidePopup}>关闭</Button>
                        </div>
                    </div>
                    <RcCalendar
                        value={ this.state.visibleStartDate } onSelect={this.changeStartDate} onChange={this.onVisibleStartDateChange}
                        className={ this.inSameMonth(this.state.startDate, this.state.visibleStartDate) ? '' : 'wh-daterange-picker-noselect' }
                        locale={CalendarLocale} prefixCls='ant-calendar' showToday={false} renderFooter={this.renderLeftFooter}
                    />
                    <RcCalendar
                        value={ this.state.visibleEndDate } onSelect={this.changeEndDate} onChange={this.onVisibleEndDateChange}
                        className={ this.inSameMonth(this.state.endDate, this.state.visibleEndDate) ? '' : 'wh-daterange-picker-noselect' }
                        locale={CalendarLocale} prefixCls='ant-calendar' showToday={false} renderFooter={this.renderRightFooter}
                    />
                </div>
            </Menu.Item>
        </Menu>;
        let label;
        const value = this.props.value;
        const start = value && value[0] && value[0].format('YYYY-MM-DD');
        const end = value && value[1] && value[1].format('YYYY-MM-DD');
        if (!start && !end) {
            label = '';
        } else if (!start) {
            label = `${end} 以前`;
        } else if (!end) {
            label = `${start} 以后`;
        } else {
            label = `${start} 到 ${end}`;
        }
        return <Dropdown overlay={menu}
            trigger={['click']}
            onVisibleChange={this.onVisibleChange}
            // visible={this.state.visible}
            >
                <Button
                    className="wh-daterange-picker-button"
                    {...blacklist(this.props, 'value', 'onChange', 'placeholder')}
                    style={{ textAlign: 'left' }}
                >
                    { label ? label : <span className="wh-daterange-picker-placeholder">{this.props.placeholder}</span> }
                    <Icon type={this.state.visible ? 'up' : 'down'}/>
                </Button>
          </Dropdown>
    }
}

export default DateRangePicker;
export { DateRangePicker };
