import React, { Component } from 'react';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Form from '@wanhu/antd-legacy/lib/form';
import Input from '@wanhu/antd-legacy/lib/input';
import { Icon } from 'antd';
import { diseaseList, diseaseInfo, func } from '@wanhu/business/lib/health-record/prop-types';
import ChronicDiseaseTable from './chronic-diseases-table';
import FamilyDiseasesTable from './family-diseases-table';
// import { toastErrorCaptureThrows } from '../../../../../Toast';
import api from '../../../../../../api/api';
import './index.less';

const FormItem = Form.Item;

const autosizeConfig = { minRows: 2 };

export default class DiseaseInfoEdit extends Component {
    static propTypes = {
        patientId: propTypes.string.isRequired,
        diseaseList: diseaseList.isRequired,
        diseaseInfo: diseaseInfo.isRequired,
        setDiseaseInfo: func.isRequired,
    }

    state = {
        userMedicationDemand: [],
    }

    // @toastErrorCaptureThrows
    async componentDidMount() {
        const { patientId } = this.props;
        const userMedicationDemand = await api.getUserMedicationDemand(patientId);
        this.setState({ userMedicationDemand });
    }

    setAllergies = (evt) => {
        const { setDiseaseInfo } = this.props;
        setDiseaseInfo({
            allergies: evt.target.value,
        });
    }

    setPastMedicalHistory = (evt) => {
        const { setDiseaseInfo } = this.props;
        setDiseaseInfo({
            pastMedicalHistory: evt.target.value,
        });
    }

    setChronicDiseases = (data) => {
        const { setDiseaseInfo } = this.props;
        setDiseaseInfo({
            chronicDiseases: data,
        });
    }

    setFamilyDiseases = (data) => {
        const { setDiseaseInfo } = this.props;
        setDiseaseInfo({
            familyDiseases: data,
        });
    }

    render() {
        const pathname = window.location.pathname;
        const search = window.location.search;
        const url = pathname.replace('/CreateHealthRecords','/MedicationDemand') + search;
        const { patientId, diseaseList, diseaseInfo } = this.props;
        const { userMedicationDemand } = this.state;
        const chronicDiseases = diseaseInfo.chronicDiseases.value;
        const familyDiseases = diseaseInfo.familyDiseases.value;
        let userMedicationDemandView;
        if (userMedicationDemand && userMedicationDemand.length) {
            userMedicationDemandView = userMedicationDemand.map(d => (
                <li key={d.drugRequirementId}>
                    {d.commonName}
                    {d.productName ? `（${d.productName}）` : null}
                </li>
            ));
        } else {
            userMedicationDemandView = (
                <li className="no-drug-demand">
                    暂无当前用药信息
                </li>
            );
        }
        return (
            <div className="disease-info-edit">
                <FormItem
                    colon={false}
                    label="慢病情况"
                    className="no-validator"
                >
                    <ChronicDiseaseTable
                        diseaseList={diseaseList}
                        value={chronicDiseases}
                        onChange={this.setChronicDiseases}
                    />
                </FormItem>
                <FormItem
                    colon={false}
                    label="当前用药"
                >
                    <ul className="drug-demand">
                        { userMedicationDemandView }
                    </ul>
                    <div className="drug-demand-link">
                        <Icon type="exclamation-circle" theme="outlined" />
                        “当前用药”内容请在
                        <Link to={url}>
                        <span style={{color: 'red'}}>【用药需求】</span>
                        </Link>
                        模块中编辑
                    </div>
                </FormItem>
                <FormItem
                    colon={false}
                    label="既往史"
                    validateStatus={diseaseInfo.pastMedicalHistory.validateStatus}
                    help={diseaseInfo.pastMedicalHistory.help}
                >
                    <Input.TextArea
                        value={diseaseInfo.pastMedicalHistory.value}
                        onChange={this.setPastMedicalHistory}
                        autosize={autosizeConfig}
                        maxLength={200}
                    />
                </FormItem>
                <FormItem
                    colon={false}
                    label="家族病史"
                >
                    <FamilyDiseasesTable
                        diseaseList={diseaseList}
                        value={familyDiseases}
                        onChange={this.setFamilyDiseases}
                    />
                </FormItem>
                <FormItem
                    colon={false}
                    label="过敏史"
                    validateStatus={diseaseInfo.allergies.validateStatus}
                    help={diseaseInfo.allergies.help}
                    required
                >
                    <Input.TextArea
                        value={diseaseInfo.allergies.value}
                        onChange={this.setAllergies}
                        autosize={autosizeConfig}
                        maxLength={200}
                        placeholder="输入其他过敏药物或者过敏食物"
                    />
                </FormItem>
            </div>
        );
    }
}
