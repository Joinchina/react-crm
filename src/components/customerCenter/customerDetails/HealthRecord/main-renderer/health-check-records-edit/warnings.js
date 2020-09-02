import {
    smokeOptions, drinkOptions, exerciseOptions, tasteOptions,
    sleepQualityOptions, constipationOptions, nutritionOptions,
    snapOptions, dailyActivitiesOptions,
} from '@wanhu/business/lib/health-record/constants';

function range(min, max) {
    return (val) => {
        if (val === undefined || val === null || val === '') return null;
        if (val < min) return 'arrow-down';
        if (val > max) return 'arrow-up';
        return null;
    };
}

function oneOf(values) {
    return val => (values.indexOf(val) >= 0 ? 'exclamation' : null);
}

function sex(sexMap) {
    return (val, patientInfo) => {
        if (!patientInfo) return null;
        const { sex } = patientInfo;
        if (sexMap[sex]) {
            return sexMap[sex](val, patientInfo);
        }
        return null;
    };
}

export default {
    smoke: oneOf([smokeOptions[1].id]),
    drink: oneOf([drinkOptions[2].id]),
    exercise: oneOf([exerciseOptions[0].id]),
    taste: oneOf([tasteOptions[2].id]),
    dailyActivities: oneOf([dailyActivitiesOptions[0].id, dailyActivitiesOptions[3].id]),
    sleepQuality: oneOf([
        sleepQualityOptions[1].id,
        sleepQualityOptions[2].id,
        sleepQualityOptions[3].id,
    ]),
    snap: oneOf([snapOptions[1].id]),
    constipation: oneOf([constipationOptions[1].id]),
    nutrition: oneOf([nutritionOptions[1].id, nutritionOptions[2].id]),
    bmi: range(18, 24),
    waistline: sex({
        0: range(-Infinity, 85),
        1: range(-Infinity, 90),
    }),
    systolicBloodPressure: range(90, 140),
    diastolicBloodPressure: range(60, 90),
    heartRate: range(50, 80),
    fastingBloodGlucose: range(3.9, 7),
    postPrandialBloodGlucose: range(3.9, 9.999),
    glycatedHemoglobin: range(-Infinity, 6.5),
    triglyceride: range(-Infinity, 1.7),
    totalCholesterol: range(-Infinity, 4.5),
    highDensityLipoproteinCholesterol: range(1, Infinity),
    lowDensityLipoproteinCholesterol: range(-Infinity, 2.599),
    urinaryMicroprotein: range(-Infinity, 15),
    egfr: range(90, Infinity),
    ALT: range(-Infinity, 40),
    AST: range(-Infinity, 50),
    plasmaHomocysteine: range(-Infinity, 15),
    uricAcid: range(-Infinity, 356.999),
    bloodPotassium: range(3.5, 5.5),
    bloodSodium: range(135, 145),
};
