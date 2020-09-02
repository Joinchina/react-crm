import React from 'react';
import IconRegist from '../../images/hearderMenuRegist.png';
import { connect as connectModal } from '../../mixins/modal';

const styles = {
    menuItemImg: {
        width: 15,
        height: 15,
        verticalAlign: 'middle',
    },
    a: {
        marginLeft: 8,
        cursor: 'pointer',
    },
};

export const CreateOrderLink = connectModal((props) => {
    const {
        style, currentModal, currentModalParam, openModal, closeModal, patientId, ...restProps
    } = props;
    const newStyle = style ? {
        ...styles.a,
        ...style,
    } : styles.a;
    return (
        /* eslint-disable */
        <a style={newStyle} onClick={() => openModal('createOrder', patientId)} {...restProps}>
            <img style={styles.menuItemImg} src={IconRegist} alt="登记用药" title="登记用药"/>
        </a>
    );
});

export default CreateOrderLink;
