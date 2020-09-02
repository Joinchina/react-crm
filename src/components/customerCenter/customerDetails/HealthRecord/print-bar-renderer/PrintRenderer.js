/* eslint-disable react/prop-types */
import React from 'react';
import moment from 'moment';
import { frequencies } from '@wanhu/business/lib/create-order/constants';
import { PrintOnly } from './Printable';
import './PrintRenderer.less';
import {
    symptoms, relationships, outcomes, smokeOptions,
    exerciseOptions, drinkOptions, tasteOptions, dailyActivitiesOptions,
    sleepQualityOptions, snapOptions, constipationOptions,
    nutritionOptions, serumCreatinineUnits,
} from '@wanhu/business/lib/health-record/constants';

export default function PrintRenderer(props) {
    const {
        patientInfo, selectedDiagnoseRecord, diseaseInfo,
        diseaseList, healthCheckRecords, viewState,
    } = props;
    if (viewState === 'init' || viewState === 'loading' || viewState === 'loadError') {
        return null;
    }
    const {
        name, birthday, doctor, hospital,
    } = patientInfo;
    let age;
    if (moment(birthday).isValid()) {
        age = moment().diff(birthday, 'year');
    }

    /** 日期 */
    const date = selectedDiagnoseRecord && selectedDiagnoseRecord.date
        ? selectedDiagnoseRecord.date.value : '';

    /** selectedDiagnoseRecord.symptoms 现病史 */
    const selectedSymptoms = selectedDiagnoseRecord && selectedDiagnoseRecord.symptoms
        ? selectedDiagnoseRecord.symptoms.value : [];

    const selectedSymptomsLength = selectedSymptoms ? selectedSymptoms.length : 0;
    const symptomsList = selectedSymptoms ? selectedSymptoms.map((item, index) => {
        const symptomId = item.symptom ? item.symptom.value : '';
        let symptom;
        if (symptomId) {
            symptom = symptoms.find(e => e.id === symptomId);
        }

        let symptomItem = symptom ? symptom.name : '';
        if (symptomId === '__other') {
            symptomItem = '其他';
        }
        const description = item.description ? item.description.value : '';
        if (description) {
            symptomItem += `-${description}`;
        }
        const key = `${index}${symptomId}`;
        return (
            <p key={key}>
                {symptomItem}
                {index + 1 === selectedSymptomsLength ? '' : '；'}
            </p>
        );
    }) : [];

    /** chronicDiseases 慢病情况 */
    const chronicDiseases = diseaseInfo && diseaseInfo.chronicDiseases
        ? diseaseInfo.chronicDiseases.value : [];
    const chronicDiseasesLength = chronicDiseases.length;
    const chronicDiseasesList = chronicDiseases ? chronicDiseases.map((item, index) => {
        const diseaseId = item.diseaseId ? item.diseaseId.value : '';
        const chronicDiseaseId = item.chronicDiseaseId ? item.chronicDiseaseId.value : '';
        const levelId = item.levelId ? item.levelId.value : '';
        const date = item.date ? item.date.value : '';
        let diseaseDetail;
        let disease;
        if (diseaseId) {
            disease = diseaseList.find(e => e.id === diseaseId);
            diseaseDetail = disease ? `${disease.name}` : '';
        }
        const chronicDiseases = disease ? disease.chronicDiseases : [];
        let chronicDisease;
        if (chronicDiseaseId) {
            chronicDisease = chronicDiseases.find(e => e.id === chronicDiseaseId);
            diseaseDetail += chronicDisease ? `-${chronicDisease.name}` : '';
        }
        if (levelId && chronicDisease) {
            const level = chronicDisease.levels.find(e => e.id === levelId);
            diseaseDetail += level ? `-${level.name}` : '';
        }
        if (date) {
            const formateDate = moment(date).toNow(true);
            diseaseDetail += formateDate ? `  确诊${formateDate}` : '';
        }
        diseaseDetail += index === chronicDiseasesLength - 1 ? '' : '；';
        return diseaseDetail;
    }) : '';

    /** pastMedicalHistory 即往史 */
    const pastMedicalHistory = diseaseInfo && diseaseInfo.pastMedicalHistory
        ? diseaseInfo.pastMedicalHistory.value : '';

    /** familyDiseases 家庭史 */
    const familyDiseases = diseaseInfo && diseaseInfo.familyDiseases
        ? diseaseInfo.familyDiseases.value : [];
    const familyDiseasesLength = familyDiseases.length;
    const familyDiseaseList = familyDiseases.map((item, index) => {
        const diseaseId = item.diseaseId || '';
        const relationshipId = item.relationship || '';
        const diagnoseAge = item.diagnoseAge || '';
        const outcomeId = item.outcome || '';
        let familyDiseaseDetail;
        if (relationshipId && relationshipId.value) {
            const relationship = relationships.find(e => e.id === relationshipId.value);
            familyDiseaseDetail = relationship ? `${relationship.name}` : '';
        }
        if (diseaseId && diseaseId.value) {
            const disease = diseaseList.find(e => e.id === diseaseId.value);
            familyDiseaseDetail += disease ? `-${disease.name}` : '';
        }
        familyDiseaseDetail += diagnoseAge && diagnoseAge.value ? `-${diagnoseAge.value}岁患病` : '';
        if (outcomeId && outcomeId.value) {
            const outcome = outcomes.find(e => e.id === outcomeId.value);
            familyDiseaseDetail += outcome ? `-${outcome.name}` : '';
        }
        familyDiseaseDetail += index === familyDiseasesLength - 1 ? '' : '；';
        return familyDiseaseDetail;
    });

    /** allergies 过敏史 */
    const allergies = diseaseInfo && diseaseInfo.allergies
        ? diseaseInfo.allergies.value : '';

    /** healthCheckRecords 相关检查 */
    let healthCheckRecordsDetail = '';
    let checkDate = '';

    const getValue = (data, options) => {
        if (data && data.value) {
            if (options) {
                const opt = options.find(e => e.id === data.value);
                return opt ? opt.name : '';
            }
            return data.value;
        }
        return '';
    };

    if (healthCheckRecords && healthCheckRecords.length > 0) {
        const checkRecords = healthCheckRecords.concat();
        checkRecords.sort((a, b) => {
            const aDate = a.date.value;
            const bDate = b.date.value;
            return moment(bDate).diff(moment(aDate));
        });
        const CheckRecord = checkRecords[0];
        const {
            date, smoke, exercise, drink, taste, height, weight,
            waistline, heartRate, systolicBloodPressure, diastolicBloodPressure,
            fastingBloodGlucose, postPrandialBloodGlucose, lowDensityLipoproteinCholesterol,
            dailyActivities, sleepQuality, snap, constipation, nutrition, auscultationCheck,
            eyeCheck, mouthCheck, footCheck, glycatedHemoglobin, triglyceride, totalCholesterol,
            highDensityLipoproteinCholesterol, serumCreatinine, serumCreatinineUnit, egfr,
            uricAcid, plasmaHomocysteine, ALT, AST, bloodSodium, bloodPotassium,
            urinaryMicroprotein,
        } = CheckRecord;
        checkDate = `检查时间：${getValue(date)}`;
        if (getValue(smoke, smokeOptions)) healthCheckRecordsDetail += `吸烟：${getValue(smoke, smokeOptions)}；`;
        if (getValue(exercise, exerciseOptions)) healthCheckRecordsDetail += `运动：${getValue(exercise, exerciseOptions)}；`;
        if (getValue(drink, drinkOptions)) healthCheckRecordsDetail += `饮酒：${getValue(drink, drinkOptions)}；`;
        if (getValue(taste, tasteOptions)) healthCheckRecordsDetail += `口味轻重：${getValue(taste, tasteOptions)}；`;
        if (getValue(height)) healthCheckRecordsDetail += `身高（m）：${getValue(height)}；`;
        if (getValue(weight)) healthCheckRecordsDetail += `体重（Kg）：${getValue(weight)}；`;
        if (getValue(height) && getValue(weight)) {
            const BMI = getValue(weight) / getValue(height) / getValue(height);
            healthCheckRecordsDetail += `BMI：${BMI.toFixed(2)}；`;
        }
        if (getValue(waistline)) healthCheckRecordsDetail += `腰围（cm）：${getValue(waistline)}；`;
        if (getValue(heartRate)) healthCheckRecordsDetail += `心率（次/分钟）：${getValue(heartRate)}；`;
        let bloodPressure;
        if (getValue(systolicBloodPressure)) bloodPressure = `收缩压（mmHg）：${getValue(systolicBloodPressure)}；`;
        if (getValue(diastolicBloodPressure)) bloodPressure += `舒张压（mmHg）：${getValue(diastolicBloodPressure)}；`;
        if (bloodPressure) healthCheckRecordsDetail += bloodPressure;
        if (getValue(fastingBloodGlucose)) healthCheckRecordsDetail += `空腹血糖（mmol/L）：${getValue(fastingBloodGlucose)}；`;
        if (getValue(postPrandialBloodGlucose)) healthCheckRecordsDetail += `餐后2h血糖（mmol/L）：${getValue(postPrandialBloodGlucose)}；`;
        if (getValue(lowDensityLipoproteinCholesterol)) healthCheckRecordsDetail += `低密度脂蛋白胆固醇（mmol/L）：${getValue(lowDensityLipoproteinCholesterol)}；`;
        if (getValue(dailyActivities, dailyActivitiesOptions)) healthCheckRecordsDetail += `日常活动或活动量：${getValue(dailyActivities, dailyActivitiesOptions)}；`;
        if (getValue(sleepQuality, sleepQualityOptions)) healthCheckRecordsDetail += `睡眠质量：${getValue(sleepQuality, sleepQualityOptions)}；`;
        if (getValue(snap, snapOptions)) healthCheckRecordsDetail += `打鼾：${getValue(snap, snapOptions)}；`;
        if (getValue(constipation, constipationOptions)) healthCheckRecordsDetail += `便秘：${getValue(constipation, constipationOptions)}；`;
        if (getValue(nutrition, nutritionOptions)) healthCheckRecordsDetail += `饮食营养：${getValue(nutrition, nutritionOptions)}；`;
        if (getValue(auscultationCheck)) healthCheckRecordsDetail += `听诊（颈动脉/甲状腺/双肺/心脏查体（心率/心音等）/腹部查体等）：${getValue(auscultationCheck)}；`;
        if (getValue(eyeCheck)) healthCheckRecordsDetail += `眼底检查结果：${getValue(eyeCheck)}；`;
        if (getValue(mouthCheck)) healthCheckRecordsDetail += `口腔检查（牙周病程度等）：${getValue(mouthCheck)}；`;
        if (getValue(footCheck)) healthCheckRecordsDetail += `足部检查（两侧对照：足背动脉/胫后动脉等）：${getValue(footCheck)}；`;
        if (getValue(glycatedHemoglobin)) healthCheckRecordsDetail += `糖化血红蛋白（%）：${getValue(glycatedHemoglobin)}；`;
        if (getValue(triglyceride)) healthCheckRecordsDetail += `甘油三酯（mmol/L）：${getValue(triglyceride)}；`;
        if (getValue(totalCholesterol)) healthCheckRecordsDetail += `总胆固醇（mmol/L）：${getValue(totalCholesterol)}；`;
        if (getValue(highDensityLipoproteinCholesterol)) healthCheckRecordsDetail += `高密度脂蛋白胆固醇（mmol/L）：${getValue(highDensityLipoproteinCholesterol)}；`;
        const serumCreatinineUnitOpt = getValue(serumCreatinineUnit, serumCreatinineUnits);
        if (getValue(serumCreatinine)) healthCheckRecordsDetail += `血肌酐：${getValue(serumCreatinine)}${serumCreatinineUnitOpt}；`;
        if (egfr) healthCheckRecordsDetail += `eGFR（ml/min/1.73m^2）：${egfr.toFixed(2)}；`;
        if (getValue(uricAcid)) healthCheckRecordsDetail += `尿酸（μmol/L）：${getValue(uricAcid)}；`;
        if (getValue(plasmaHomocysteine)) healthCheckRecordsDetail += `血浆同型半胱氨酸（μmol/L）：${getValue(plasmaHomocysteine)}；`;
        if (getValue(ALT)) healthCheckRecordsDetail += `ALT：${getValue(ALT)}；`;
        if (getValue(AST)) healthCheckRecordsDetail += `AST：${getValue(AST)}；`;
        if (getValue(bloodSodium)) healthCheckRecordsDetail += `血钠（mmol/L）：${getValue(bloodSodium)}；`;
        if (getValue(bloodPotassium)) healthCheckRecordsDetail += `血钾（mmol/L）：${getValue(bloodPotassium)}；`;
        if (getValue(urinaryMicroprotein)) healthCheckRecordsDetail += `尿微量白蛋白（mg/L）：${getValue(urinaryMicroprotein)}；`;
    }
    healthCheckRecordsDetail = healthCheckRecordsDetail ? healthCheckRecordsDetail.substr(0, healthCheckRecordsDetail.length - 1) : '';
    const isBr = healthCheckRecordsDetail ? <br /> : null;
    checkDate = healthCheckRecordsDetail ? checkDate : null;

    /** drugTherapy 药物治疗 */
    let drugTherapy = selectedDiagnoseRecord && selectedDiagnoseRecord.drugTherapy
        ? selectedDiagnoseRecord.drugTherapy.value : [];
    const drugTherapyLength = drugTherapy ? drugTherapy.length : 0;
    const br = <br />;
    const drugTherapyList = [];
    drugTherapy = drugTherapy ? drugTherapy.map((item, index) => {
        let drug;
        let name = item.commonName;
        if (item.productName) {
            name += `（${item.productName}）`;
        }
        drug = name;
        const standard = item.standard
            ? item.standard
            : `${item.preparationUnit}*${item.packageSize}${item.minimumUnit}/${item.packageUnit}`;
        drug += standard ? `  ${standard}` : '';

        const useAmount = item.useAmount && item.useAmount.value ? `${item.useAmount.value}${item.minimumUnit}` : '';
        drug += useAmount ? `  每次${useAmount}` : '';

        const frequency = item.frequency && item.frequency.value
            ? frequencies.find(e => e.id.toString() === item.frequency.value) : null;
        drug += frequency && frequency.name ? `  ${frequency.name}` : '';

        const amount = item.amount && item.amount.value ? `${item.amount.value}${item.packageUnit}` : '';
        drug += amount ? `  ${amount}` : '';

        const medicationInstructions = item.medicationInstructions
            && item.medicationInstructions.value
            ? item.medicationInstructions.value : '';
        drug += medicationInstructions ? `  ${medicationInstructions}` : '';
        drugTherapyList.push(drug);
        if (index + 1 !== drugTherapyLength) {
            drugTherapyList.push(br);
        }
        return item;
    }) : null;

    /** nonDrugTherapy 非药物治疗 */
    const nonDrugTherapy = selectedDiagnoseRecord && selectedDiagnoseRecord.nonDrugTherapy
        ? selectedDiagnoseRecord.nonDrugTherapy.value : '';
    return (
        <PrintOnly>
            <div className="printRender">
                <h1 className="font-song">
                    {hospital.name}
                    治疗记录
                </h1>
                <h2 className="font-song">
                    <span style={{ marginRight: '5mm' }}>
                        姓名：
                        {name}
                    </span>
                    <span style={{ marginRight: '5mm' }}>
                        年龄：
                        {age}
                        岁
                    </span>
                    <span style={{ marginRight: '5mm' }}>
                        医生：
                        {doctor.name}
                    </span>
                    <span>
                        日期：
                        {date}
                    </span>
                </h2>
                <div className="firstTable">
                    <section className="first">
                        <span>
                            主诉
                        </span>
                        <article>
                            {selectedDiagnoseRecord && selectedDiagnoseRecord.complaint
                                ? selectedDiagnoseRecord.complaint.value : null}
                        </article>
                    </section>
                    <section>
                        <span>
                            现病史
                        </span>
                        <article>
                           {symptomsList}
                        </article>
                    </section>
                    <section>
                        <span>
                            慢病情况
                        </span>
                        <article>
                            {chronicDiseasesList}
                        </article>
                    </section>
                    <section>
                        <span>
                            既往史
                        </span>
                        <article>
                            {pastMedicalHistory}
                        </article>
                    </section>
                    <section>
                        <span>
                            家族史
                        </span>
                        <article>
                            {familyDiseaseList}
                        </article>
                    </section>
                    <section>
                        <span>
                            过敏史
                        </span>
                        <article>
                            {allergies}
                        </article>
                    </section>
                    <section className="middle">
                        <span>
                            相关检查
                        </span>
                        <article>
                            {healthCheckRecordsDetail ? `${checkDate}` : null}
                            {isBr}
                            {healthCheckRecordsDetail}
                        </article>
                    </section>
                    <h3>
                        治疗措施
                    </h3>
                    <section>
                        <span>
                            药物治疗方案
                        </span>
                        <article>
                            {drugTherapyList}
                        </article>
                    </section>
                    <section className="last">
                        <span>
                            非药物治疗方案
                        </span>
                        <article>
                            {nonDrugTherapy}
                        </article>
                    </section>
                </div>
            </div>
            {/* { JSON.stringify(props, null, '  ') } */}
        </PrintOnly>
    );
}
