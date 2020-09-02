import React, { Component } from 'react';
import { Spin } from 'antd';
import MedicationOrder from './reservationDetails';
import AlertError from '../../common/AlertError';
import { connectRouter } from '../../../mixins/router';
import { connect as connectOrderDetail } from '../../../states/reservationRecord/reservationDetails';
/* eslint-disable import/no-cycle */
import NavigatorBreadcrumb from '../../common/NavigatorBreadcrumb';
import PropTypes from '../../../helpers/prop-types';

class ReservationDetail extends Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.object,
        }).isRequired,
        searchReservationDetail: PropTypes.func.isRequired,
        reservationDetail: PropTypes.asyncResult(
            PropTypes.shape({}),
        ).isRequired,
    };

    constructor(props) {
        super(props);
        const { match, searchReservationDetail } = this.props;
        this.reservationId = match.params.reservationId || '';
        searchReservationDetail(this.reservationId);
    }

    componentWillReceiveProps(nextProps) {
        const { match, searchReservationDetail } = this.props;
        if (match.params.reservationId !== nextProps.match.params.reservationId) {
            searchReservationDetail(nextProps.match.params.reservationId);
        }
    }

    render() {
        const { reservationDetail } = this.props;
        const data = reservationDetail.status === 'fulfilled' ? reservationDetail.payload : {};
        const defaultNavigateStack = [
            { label: '会员预约管理', url: '/customerReservationManagement' },
            { label: '预约详情' },
        ];
        return (
            <Spin
                spinning={reservationDetail.status === 'pending'}
            >
                <div>
                    <NavigatorBreadcrumb defaultNavigateStack={defaultNavigateStack} className="breadcrumb-box" />
                    <div className="block">
                        <MedicationOrder data={data} />
                    </div>
                    <AlertError
                        status={reservationDetail.status}
                        payload={reservationDetail.result}
                    />
                </div>
            </Spin>
        );
    }
}

export default connectRouter(connectOrderDetail(ReservationDetail));
