import React from 'react';
import Button from '@wanhu/antd-legacy/lib/button';
import { healthRecordRendererPropTypes } from '@wanhu/business';

export default function HealthRecordSaveBar(props) {
    const print = () => {
        window.print();
    };
    const {
        viewState,
    } = props;
    const disabled = (viewState === 'init' || viewState === 'loading' || viewState === 'loadError');
    return (
        <Button size="small" onClick={print} style={{ marginLeft: '10px' }} disabled={disabled}>
            打印
        </Button>
    );
}


HealthRecordSaveBar.propTypes = healthRecordRendererPropTypes;
