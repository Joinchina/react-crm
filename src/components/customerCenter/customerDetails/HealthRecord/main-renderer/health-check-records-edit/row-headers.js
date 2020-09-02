/* eslint-disable react/no-unknown-property, react/jsx-one-expression-per-line */
/* 该文件中的 JSX 语法直接生成DOM节点，而不是React的虚拟DOM */
import React from '../handsontable/jsx-dom';
import example from './example.png';
import view from './viewer';

function viewExample() {
    view([{
        url: example,
        alt: '双手合十示例照片',
    }], {
        navbar: false,
        toolbar: false,
    });
}

export default [
    [() => <div class="header-cell">类别</div>, () => <div class="header-cell">指标</div>],
    [() => <div class="header-cell">风险<wbr />评估</div>, null],
    [() => <div class="header-cell">重点<wbr />关注</div>, () => <div class="header-cell">吸烟</div>],
    [null, () => <div class="header-cell">运动</div>],
    [null, () => <div class="header-cell">饮酒</div>],
    [null, () => <div class="header-cell">口味轻重</div>],
    [null, () => <div class="header-cell">身高<wbr />（m）</div>],
    [null, () => <div class="header-cell">体重<wbr />（Kg）</div>],
    [null, () => <div class="header-cell">BMI</div>],
    [null, () => <div class="header-cell">腰围<wbr />（cm）</div>],
    [null, () => <div class="header-cell">心率<wbr />（次/分钟）</div>],
    [null, () => <div class="header-cell">收缩压<wbr />（mmHg）</div>],
    [null, () => <div class="header-cell">舒张压<wbr />（mmHg）</div>],
    [null, () => <div class="header-cell">空腹血糖<wbr />（mmol/L）</div>],
    [null, () => <div class="header-cell">餐后2h血糖<wbr />（mmol/L）</div>],
    [null, () => <div class="header-cell">低密度脂蛋白胆固醇<wbr />（mmol/L）</div>],
    [() => <div class="header-cell">生活<wbr />习惯</div>, () => <div class="header-cell">日常工作或活动量</div>],
    [null, () => <div class="header-cell">睡眠质量</div>],
    [null, () => <div class="header-cell">打鼾</div>],
    [null, () => <div class="header-cell">便秘</div>],
    [null, () => <div class="header-cell">饮食营养</div>],
    [() => <div class="header-cell">体格<wbr />检查</div>, () => <div class="header-cell">听诊<wbr />（颈动脉<wbr />/甲状腺<wbr />/双肺<wbr />/心脏查体（心律<wbr />/心音等）<wbr />/腹部查体等）</div>],
    [null, () => <div class="header-cell">眼底检查结果</div>],
    [null, () => <div class="header-cell">口腔检查<wbr />（牙周病程度等）</div>],
    [null, () => <div class="header-cell">足部检查<wbr />（两侧对照：<wbr />足背动脉<wbr />/胫后动脉等）</div>],
    [() => <div class="header-cell">血糖</div>, () => <div class="header-cell">糖化血红蛋白<wbr />（%）</div>],
    [() => <div class="header-cell">血脂</div>, () => <div class="header-cell">甘油三酯<wbr />（mmol/L）</div>],
    [null, () => <div class="header-cell">总胆固醇<wbr />（mmol/L）</div>],
    [null, () => <div class="header-cell">高密度脂蛋白胆固醇<wbr />（mmol/L）</div>],
    [() => <div class="header-cell">其他<wbr />血清<wbr />检查</div>, () => <div class="header-cell">血肌酐</div>],
    [null, () => <div class="header-cell">eGFR<wbr />（ml/min/1.73m<sup>2</sup>）</div>],
    [null, () => <div class="header-cell">尿酸<wbr />（μmol/L）</div>],
    [null, () => <div class="header-cell">血浆同型半胱氨酸<wbr />（μmol/L）</div>],
    [null, () => <div class="header-cell">ALT</div>],
    [null, () => <div class="header-cell">AST</div>],
    [() => <div class="header-cell">电解质</div>, () => <div class="header-cell">血钠<wbr />（mmol/L）</div>],
    [null, () => <div class="header-cell">血钾<wbr />（mmol/L）</div>],
    [() => <div class="header-cell">其他</div>, () => <div class="header-cell">尿微量白蛋白<wbr />（mg/L）</div>],
    [
        () => <div class="header-cell">照片</div>,
        () => (
            <div class="header-cell">
                血常规<wbr />/尿常规<wbr />/心电图<wbr />
                {/* eslint-disable-next-line */}
                /<a onClick={viewExample} >双手合十照片</a>
                <wbr />/全身照<wbr />/颜面（含颈部）照片<wbr />/其他实验室检查
            </div>
        ),
    ],
];
