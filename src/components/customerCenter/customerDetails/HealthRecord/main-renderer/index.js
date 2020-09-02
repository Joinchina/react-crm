import React, { Component } from 'react';
import Alert from '@wanhu/antd-legacy/lib/alert';
import Spin from '@wanhu/antd-legacy/lib/spin';
import propTypes from 'prop-types';
import DiagnoseRecordsEdit from './diagnose-records-edit';
import TherapyEdit from './diagnose-records-edit/therapy-edit';
import DiseaseInfoEdit from './disease-info-edit';
import HealthCheckRecordsEdit from './health-check-records-edit';
import { healthRecordRendererPropTypes } from '@wanhu/business';
import './index.less';

export default class HealthyRecordRenderer extends Component {
    static propTypes = {
        ...healthRecordRendererPropTypes,
        globalHorizontalScroll: propTypes.bool,
        scrollXPadding: propTypes.number,
    }

    static defaultProps = {
        globalHorizontalScroll: false,
        scrollXPadding: 0,
    }

    componentDidMount() {
        const { globalHorizontalScroll } = this.props;
        if (globalHorizontalScroll) {
            const listener = () => {
                const newScrollX = window.document.documentElement.scrollLeft;
                this.setScrollX(newScrollX, true);
            };
            window.addEventListener('scroll', listener, { passive: true });
            this.scrollPosX = window.document.documentElement.scrollLeft;
            this.removeScrollListener = () => {
                window.removeEventListener('scroll', listener);
            };
        } else {
            const { scrollView } = this;
            const onScroll = () => {
                const newScrollX = scrollView.scrollLeft;
                this.setScrollX(newScrollX);
            };
            scrollView.addEventListener('scroll', onScroll, { passive: true });
            this.scrollPosX = scrollView.scrollLeft;
            this.removeScrollListener = () => {
                scrollView.removeEventListener('scroll', onScroll);
            };
        }
    }

    componentWillUnmount() {
        if (this.removeScrollListener) {
            this.removeScrollListener();
        }
    }

    setScrollX(newScrollX, parentSticky) {
        if (this.scrollPosX !== newScrollX) {
            this.scrollPosX = newScrollX;
            if (!parentSticky) {
                if (this.healthCheckRecordsEdit) {
                    this.healthCheckRecordsEdit.setScrollXPosition(newScrollX);
                }
                if (this.diagnoseSection) {
                    this.diagnoseSection.style.transform = `translateX(${newScrollX}px)`;
                }
                if (this.diseaseInfoSection) {
                    this.diseaseInfoSection.style.transform = `translateX(${newScrollX}px)`;
                }
            } else if (this.healthCheckRecordsEdit) {
                this.healthCheckRecordsEdit.setScrollXPosition(newScrollX, true);
            }
        }
    }

    refDiagnoseSection = (ref) => {
        this.diagnoseSection = ref;
    }

    refDiseaseInfoSection = (ref) => {
        this.diseaseInfoSection = ref;
    }

    refHealthCheckRecordsEdit = (ref) => {
        this.healthCheckRecordsEdit = ref;
    }

    refScrollView = (ref) => {
        this.scrollView = ref;
    }

    renderDiagnoseRecords() {
        const {
            diagnoseRecords,
            setDiagnoseRecordField,
            removeDiagnoseRecord,
            selectedDiagnoseRecord,
            setSelectedDiagnoseRecordByDate,
        } = this.props;
        return (
            <section
                ref={this.refDiagnoseSection}
                key="diagnose-section"
                className="diagnose-section"
            >
                <DiagnoseRecordsEdit
                    diagnoseRecords={diagnoseRecords}
                    selectedDiagnoseRecord={selectedDiagnoseRecord}
                    setSelectedDiagnoseRecordByDate={setSelectedDiagnoseRecordByDate}
                    setDiagnoseRecordField={setDiagnoseRecordField}
                    removeDiagnoseRecord={removeDiagnoseRecord}
                />
            </section>
        );
    }

    renderTherapyEdit() {
        const {
            selectedDiagnoseRecord,
            setDiagnoseRecordField,
            patientInfo,
            patientId,
        } = this.props;
        return (
            <section
                key="therapy-section"
                className="therapy-section"
            >
                <TherapyEdit
                    patientId={patientId}
                    patientInfo={patientInfo}
                    diagnoseRecord={selectedDiagnoseRecord}
                    setDiagnoseRecordField={setDiagnoseRecordField}
                />
            </section>
        );
    }

    renderDiseaseInfo() {
        const {
            patientId, diseaseList, diseaseInfo, setDiseaseInfo,
        } = this.props;
        return (
            <section
                ref={this.refDiseaseInfoSection}
                key="disease-section"
                className="disease-section"
            >
                <DiseaseInfoEdit
                    patientId={patientId}
                    diseaseList={diseaseList}
                    diseaseInfo={diseaseInfo}
                    setDiseaseInfo={setDiseaseInfo}
                />
            </section>
        );
    }

    renderHealthCheckRecords() {
        const {
            healthCheckRecords,
            addHealthCheckRecord,
            removeHealthCheckRecord,
            setHealthCheckRecordFields,
            patientInfo,
            scrollXPadding,
        } = this.props;
        return (
            <section key="healthcheck-section" className="healthcheck-section">
                <HealthCheckRecordsEdit
                    ref={this.refHealthCheckRecordsEdit}
                    patientInfo={patientInfo}
                    healthCheckRecords={healthCheckRecords}
                    addHealthCheckRecord={addHealthCheckRecord}
                    removeHealthCheckRecord={removeHealthCheckRecord}
                    setHealthCheckRecordFields={setHealthCheckRecordFields}
                    scrollXPadding={scrollXPadding}
                />
            </section>
        );
    }

    render() {
        const { viewState, patientInfoLoadError } = this.props;
        let content;
        if (viewState === 'init' || viewState === 'loading') {
            content = <Spin spinning />;
        } else if (viewState === 'loadError') {
            content = (
                <Alert
                    message="加载会员信息出错"
                    description={patientInfoLoadError.message}
                    type="error"
                    showIcon
                />
            );
        } else {
            content = [
                this.renderDiagnoseRecords(),
                this.renderDiseaseInfo(),
                this.renderHealthCheckRecords(),
                this.renderTherapyEdit(),
            ];
        }
        return (
            <div className="health-record" ref={this.refScrollView}>
                { content }
            </div>
        );
    }
}
