import MainRenderer from './main-renderer';
import SaveBarRenderer from './save-bar-renderer';
import { withHealthRecordBusiness } from '@wanhu/business';
import api from '../../../../api/api';

function createDecorator(patientId, patientInfo) {
    return withHealthRecordBusiness({
        patientId,
        getPatientInfo: () => patientInfo || api.getPatient(patientId),
        getDiseaseList: () => api.getDiseaseTree(),
        getPatientDiagnoseRecords: async (patientId) => {
            const r = await api.getPatientDiagnoseRecords(patientId);
            const baseDrugIds = [];
            for (const record of r) {
                if (record.drugTherapy) {
                    for (const drug of record.drugTherapy) {
                        if (baseDrugIds.indexOf(drug.baseDrugId) < 0) {
                            baseDrugIds.push(drug.baseDrugId);
                        }
                    }
                }
            }
            if (baseDrugIds.length > 0) {
                const patientInfo = await api.getPatient(patientId);
                const hospitalId = patientInfo.hospital.id;
                const drugs = await api.getDrugList({
                    where: {
                        hospitalId,
                        baseDrugIds,
                    },
                });
                const drugMap = {};
                drugs.forEach((drug) => {
                    drugMap[drug.baseDrugId] = drug;
                });
                for (const record of r) {
                    if (record.drugTherapy) {
                        for (let i = 0; i < record.drugTherapy.length; i += 1) {
                            const dt = record.drugTherapy[i];
                            const drug = drugMap[dt.baseDrugId];
                            if (drug) {
                                record.drugTherapy[i] = {
                                    ...drug,
                                    amount: dt.amount,
                                    useAmount: dt.useAmount,
                                    frequency: dt.frequency,
                                    medicationInstructions: dt.medicationInstructions,
                                };
                            }
                        }
                    }
                }
            }
            return r.map((record) => {
                if (record.otherSymptomsDescribe) {
                    return {
                        ...record,
                        symptoms: [
                            ...record.symptoms,
                            {
                                symptom: '__other',
                                description: record.otherSymptomsDescribe,
                            },
                        ],
                    };
                }
                return record;
            });
        },
        updateDiagnoseRecord: (patientId, recordId, record) => {
            const { symptoms } = record;
            const actualSymptoms = symptoms.filter(sym => sym.symptom !== '__other');
            const others = symptoms.find(sym => sym.symptom === '__other');
            const otherSymptomsDescribe = others && others.description;
            return api.updateDiagnoseRecord(recordId, {
                ...record,
                symptoms: actualSymptoms,
                otherSymptomsDescribe,
            });
        },
        createDiagnoseRecord: (patientId, record) => {
            const { symptoms } = record;
            const actualSymptoms = symptoms.filter(sym => sym.symptom !== '__other');
            const others = symptoms.find(sym => sym.symptom === '__other');
            const otherSymptomsDescribe = others && others.description;
            return api.createDiagnoseRecord(patientId, {
                ...record,
                symptoms: actualSymptoms,
                otherSymptomsDescribe,
            });
        },
        removeDiagnoseRecord: (...args) => api.removeDiagnoseRecord(...args),
        getPatientDiseaseInfo: patientId => api.getPatientDiseaseInfo(patientId),
        updateDiseaseInfo: (...args) => api.updateDiseaseInfo(...args),
        removeDiseaseInfo: (...args) => api.removeDiseaseInfo(...args),
        getPatientHealthCheckRecords: patientId => api.getPatientHealthCheckRecords(patientId),
        createHealthCheckRecord: (...args) => api.createHealthCheckRecord(...args),
        updateHealthCheckRecord: (...args) => api.updateHealthCheckRecord(...args),
    });
}

export {
    MainRenderer,
    SaveBarRenderer,
    createDecorator,
};
