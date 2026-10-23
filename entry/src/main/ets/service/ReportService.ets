import { getLegalBasis } from '../data/SampleData';
import { AnalysisResult, Contract, RiskItem } from '../model/Models';

export function buildReport(contract: Contract, analysis: AnalysisResult, acceptedIds: string[], currentScore: number): string {
  let text: string = '# 租房合同风险报告\n\n';
  text += '合同：' + contract.name + '\n';
  text += '分析时间：' + analysis.analyzedAt + '\n';
  text += '综合风险分：' + currentScore + '/100（分析时 ' + analysis.overallScore + '/100）\n';
  text += '高风险：' + analysis.highCount + ' 条    中风险：' + analysis.mediumCount + ' 条    低风险：' + analysis.lowCount + ' 条\n\n';
  text += '## 总体结论\n' + analysis.summary + '\n\n';
  text += '## 风险清单\n';

  for (let index = 0; index < analysis.risks.length; index++) {
    const risk: RiskItem = analysis.risks[index];
    const accepted: boolean = acceptedIds.indexOf(risk.id) >= 0;
    text += '\n### ' + (index + 1) + '. ' + risk.title + '（' + risk.clauseTitle + '）\n';
    text += '风险等级：' + risk.level + '    类型：' + risk.riskType + (accepted ? '    状态：已接受修改' : '    状态：未修改') + '\n';
    text += '原文：' + risk.clauseText + '\n';
    text += '风险说明：' + risk.reason + '\n';
    text += '可能后果：' + risk.consequence + '\n';
    text += '修改建议：' + risk.suggestion + '\n';
    text += '建议条款：' + risk.revisedClause + '\n';
    text += '法律依据：\n';
    for (const basisId of risk.legalBasisIds) {
      const basis = getLegalBasis(basisId);
      text += '- ' + basis.law + basis.article + '：' + basis.text + '\n';
    }
    text += '谈判话术：\n';
    for (const script of risk.negotiation) {
      text += '- [' + script.tone + '] ' + script.text + '\n';
    }
  }

  text += '\n---\n';
  text += '本报告由「合同雷达」生成，仅用于合同风险提示，不构成法律意见。正式签约前建议咨询专业律师。\n';
  return text;
}