import React from 'react';
import { Button } from 'antd';
import Tooltip from '@wanhu/antd-legacy/lib/tooltip';

import { healthRecordRendererPropTypes } from '@wanhu/business';

export default function HealthRecordSaveBar(props) {
    const {
        viewState,
        autoSaveStatus,
        autoSaveWarnings,
        autoSaveErrors,
        save,
        reset,
    } = props;
    if (viewState === 'loadError') {
        return (
            <Button size="small" onClick={reset}>
                重试
            </Button>
        );
    }
    if (autoSaveStatus === 'init') {
        if (autoSaveWarnings) {
            return (
                <Tooltip trigger="hover" placement="bottomRight" title="部分字段验证错误，更正后会自动保存">
                    <Button size="small" icon="warning">
                        保存
                    </Button>
                </Tooltip>
            );
        }
        return (
            <Button size="small">
                保存
            </Button>
        );
    }
    if (autoSaveStatus === 'pending') {
        return (
            <Button size="small" loading icon={autoSaveWarnings ? 'warning' : null}>
                正在保存
            </Button>
        );
    }
    if (autoSaveStatus === 'success') {
        if (autoSaveWarnings) {
            return (
                <Tooltip trigger="hover" placement="bottomRight" title="部分字段验证错误，未保存这些字段">
                    <Button size="small" icon="warning">
                        保存成功
                    </Button>
                </Tooltip>
            );
        }
        return (
            <Button size="small" type="primary">
                保存成功
            </Button>
        );
    }
    if (autoSaveStatus === 'error') {
        const errors = autoSaveErrors.length === 1
            ? autoSaveErrors[0].message
            : autoSaveErrors.map((e, i) => `${i + 1}. ${e.message}`).join('\n');

        return (
            <Tooltip
                trigger="hover"
                placement="bottomRight"
                title={(
                    <pre>
                        {errors}
                    </pre>
                )}
            >
                <Button size="small" type="danger" icon="close-circle" onClick={save}>
                    保存失败，点击此处重试
                </Button>
            </Tooltip>
        );
    }
    return null;
}

HealthRecordSaveBar.propTypes = healthRecordRendererPropTypes;
