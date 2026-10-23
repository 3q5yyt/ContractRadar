import { common } from '@kit.AbilityKit';
import { promptAction } from '@kit.ArkUI';
import {
  COLOR_AMBER,
  COLOR_AMBER_BG,
  COLOR_BG,
  COLOR_BLUE,
  COLOR_BLUE_BG,
  COLOR_BORDER,
  COLOR_CARD,
  COLOR_GREEN,
  COLOR_GREEN_BG,
  COLOR_MUTED,
  COLOR_NAVY,
  COLOR_RED,
  COLOR_RED_BG,
  COLOR_SECONDARY,
  COLOR_TEXT,
  barColor,
  levelBg,
  levelColor,
  levelLabel,
  scoreColor,
  scoreLabel
} from '../common/Theme';
import { getLegalBasis, SAMPLE_ANALYSIS, SAMPLE_CONTRACT } from '../data/SampleData';
import {
  AnalysisResult,
  CategoryScore,
  Clause,
  Contract,
  DiffSegment,
  HistoryRecord,
  LegalBasis,
  NegotiationScript,
  RiskItem
} from '../model/Models';
import { AiService } from '../service/AiService';
import { copyText } from '../service/ClipboardService';
import { diffText } from '../service/DiffService';
import { HistoryService } from '../service/HistoryService';
import { buildReport } from '../service/ReportService';

enum AppScreen {
  Home,
  Analysis,
  Risk,
  Revision,
  Diff,
  Negotiation,
  Report,
  History
}

function nowText(): string {
  const date = new Date();
  const pad = (value: number): string => {
    if (value < 10) {
      return '0' + value.toString();
    }
    return value.toString();
  };
  return date.getFullYear().toString() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
    ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
}

@Entry
@Component
struct Index {
  @State screen: AppScreen = AppScreen.Home;
  @State contract: Contract = SAMPLE_CONTRACT;
  @State analysis: AnalysisResult = SAMPLE_ANALYSIS;
  @State selectedRiskId: string = '';
  @State acceptedRiskIds: string[] = [];
  @State history: HistoryRecord[] = [];
  @State reportText: string = '';
  @State analyzing: boolean = false;
  @State showAllClauses: boolean = false;

  aboutToAppear(): void {
    this.loadHistory();
  }

  async loadHistory(): Promise<void> {
    const context = getContext(this) as common.UIAbilityContext;
    this.history = await HistoryService.load(context);
  }

  async saveHistory(): Promise<void> {
    const record: HistoryRecord = {
      id: Date.now().toString(),
      contractName: this.analysis.contractName,
      analyzedAt: nowText(),
      score: this.analysis.overallScore,
      highCount: this.analysis.highCount,
      mediumCount: this.analysis.mediumCount,
      lowCount: this.analysis.lowCount
    };
    const next: HistoryRecord[] = [record];
    for (const item of this.history) {
      if (item.id !== record.id) {
        next.push(item);
      }
    }
    this.history = next.slice(0, 20);
    const context = getContext(this) as common.UIAbilityContext;
    await HistoryService.save(context, this.history);
  }

  async clearHistory(): Promise<void> {
    this.history = [];
    const context = getContext(this) as common.UIAbilityContext;
    await HistoryService.clear(context);
  }

  startAnalysis(): void {
    this.acceptedRiskIds = [];
    this.analyzing = true;
    this.screen = AppScreen.Analysis;
    AiService.analyze(this.contract).then((result: AnalysisResult) => {
      this.analysis = result;
      this.analyzing = false;
      this.saveHistory();
    }).catch(() => {
      this.analysis = SAMPLE_ANALYSIS;
      this.analyzing = false;
      this.saveHistory();
    });
  }

  back(): void {
    if (this.screen === AppScreen.Analysis || this.screen === AppScreen.History) {
      this.screen = AppScreen.Home;
    } else if (this.screen === AppScreen.Risk) {
      this.screen = AppScreen.Analysis;
    } else if (this.screen === AppScreen.Revision || this.screen === AppScreen.Diff ||
      this.screen === AppScreen.Negotiation || this.screen === AppScreen.Report) {
      this.screen = AppScreen.Analysis;
    }
  }

  getSelectedRisk(): RiskItem | undefined {
    for (const risk of this.analysis.risks) {
      if (risk.id === this.selectedRiskId) {
        return risk;
      }
    }
    return undefined;
  }

  getRiskForClause(clauseId: string): RiskItem | undefined {
    for (const risk of this.analysis.risks) {
      if (risk.clauseId === clauseId) {
        return risk;
      }
    }
    return undefined;
  }

  openRisk(riskId: string): void {
    this.selectedRiskId = riskId;
    this.screen = AppScreen.Risk;
  }

  openClause(clause: Clause): void {
    const risk = this.getRiskForClause(clause.id);
    if (risk !== undefined) {
      this.openRisk(risk.id);
      return;
    }
    AlertDialog.show({
      title: clause.title,
      message: clause.explanation,
      alignment: DialogAlignment.Bottom,
      confirm: {
        value: '知道了',
        action: () => {
        }
      }
    });
  }

  isAccepted(riskId: string): boolean {
    return this.acceptedRiskIds.indexOf(riskId) >= 0;
  }

  setAccepted(riskId: string, accepted: boolean): void {
    if (accepted) {
      if (this.acceptedRiskIds.indexOf(riskId) < 0) {
        const next = this.acceptedRiskIds.slice();
        next.push(riskId);
        this.acceptedRiskIds = next;
      }
    } else {
      this.acceptedRiskIds = this.acceptedRiskIds.filter((item: string) => item !== riskId);
    }
  }

  acceptAll(): void {
    this.acceptedRiskIds = this.analysis.risks.map((risk: RiskItem) => risk.id);
  }

  getAcceptedRisks(): RiskItem[] {
    return this.analysis.risks.filter((risk: RiskItem) => this.acceptedRiskIds.indexOf(risk.id) >= 0);
  }

  getCurrentScore(): number {
    let score = this.analysis.overallScore;
    for (const risk of this.analysis.risks) {
      if (this.isAccepted(risk.id)) {
        score = score - risk.scoreImpact;
      }
    }
    if (score < 0) {
      return 0;
    }
    return score;
  }

  openDiff(): void {
    if (this.acceptedRiskIds.length === 0) {
      promptAction.showToast({ message: '先接受至少一条修改建议' });
      return;
    }
    this.screen = AppScreen.Diff;
  }

  openReport(): void {
    this.reportText = buildReport(this.contract, this.analysis, this.acceptedRiskIds, this.getCurrentScore());
    this.screen = AppScreen.Report;
  }

  copyToClipboard(text: string): void {
    copyText(text).then(() => {
      promptAction.showToast({ message: '已复制到剪贴板' });
    }).catch(() => {
      promptAction.showToast({ message: '复制失败，请重试' });
    });
  }

  buildDiffHtml(risk: RiskItem): string {
    const segments = diffText(risk.clauseText, risk.revisedClause);
    let html = '<div style="font-size:14px;line-height:1.8;color:#172033;">';
    for (const segment of segments) {
      if (segment.type === 'delete') {
        html += '<span style="color:#D93F3F;text-decoration:line-through;">' + segment.text + '</span>';
      } else if (segment.type === 'insert') {
        html += '<span style="color:#2E7D5B;text-decoration:underline;">' + segment.text + '</span>';
      } else {
        html += segment.text;
      }
    }
    html += '</div>';
    return html;
  }

  build() {
    Column() {
      if (this.screen === AppScreen.Home) {
        this.HomeScreen()
      } else if (this.screen === AppScreen.Analysis) {
        this.AnalysisScreen()
      } else if (this.screen === AppScreen.Risk) {
        this.RiskScreen()
      } else if (this.screen === AppScreen.Revision) {
        this.RevisionScreen()
      } else if (this.screen === AppScreen.Diff) {
        this.DiffScreen()
      } else if (this.screen === AppScreen.Negotiation) {
        this.NegotiationScreen()
      } else if (this.screen === AppScreen.Report) {
        this.ReportScreen()
      } else {
        this.HistoryScreen()
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(COLOR_BG)
  }

  @Builder
  TopBar(title: string, showBack: boolean) {
    Row() {
      if (showBack) {
        Text('←')
          .fontSize(22)
          .fontColor(COLOR_TEXT)
          .width(40)
          .height(40)
          .textAlign(TextAlign.Center)
          .onClick(() => this.back())
      }
      Text(title)
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .fontColor(COLOR_TEXT)
      Blank()
      Text('合同雷达')
        .fontSize(11)
        .fontColor(COLOR_MUTED)
    }
    .width('100%')
    .height(52)
    .padding({ left: 10, right: 16 })
    .alignItems(VerticalAlign.Center)
  }

  @Builder
  SectionTitle(title: string) {
    Text(title)
      .fontSize(15)
      .fontWeight(FontWeight.Medium)
      .fontColor(COLOR_TEXT)
      .margin({ top: 18, bottom: 8 })
  }

  @Builder
  HomeScreen() {
    Scroll() {
      Column() {
        Row() {
          Column() {
            Text('合同雷达')
              .fontSize(28)
              .fontWeight(FontWeight.Bold)
              .fontColor(COLOR_TEXT)
            Text('签前 3 分钟，看清租房合同')
              .fontSize(13)
              .fontColor(COLOR_SECONDARY)
              .margin({ top: 4 })
          }
          .alignItems(HorizontalAlign.Start)
          Blank()
          Text('DEMO')
            .fontSize(10)
            .fontColor('#FFFFFF')
            .backgroundColor(COLOR_NAVY)
            .padding({ left: 8, right: 8, top: 4, bottom: 4 })
            .borderRadius(6)
        }
        .width('100%')
        .alignItems(VerticalAlign.Top)

        Column() {
          Text('AI 合同风险审查')
            .fontSize(22)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FFFFFF')
          Text('标出风险条款 · 解释法律依据 · 生成谈判话术')
            .fontSize(13)
            .fontColor('#B9C9DC')
            .margin({ top: 6 })
          Row() {
            Button('使用示例合同')
              .height(44)
              .fontSize(14)
              .fontColor(COLOR_NAVY)
              .backgroundColor('#FFFFFF')
              .borderRadius(22)
              .onClick(() => this.startAnalysis())
            Button('导入合同')
              .height(44)
              .fontSize(14)
              .fontColor('#FFFFFF')
              .backgroundColor('#00000000')
              .border({ width: 1, color: '#5A7A9A' })
              .borderRadius(22)
              .margin({ left: 10 })
              .onClick(() => {
                promptAction.showToast({ message: 'Demo 版本使用内置示例合同' });
              })
          }
          .margin({ top: 18 })
        }
        .width('100%')
        .alignItems(HorizontalAlign.Start)
        .backgroundColor(COLOR_NAVY)
        .padding(20)
        .borderRadius(20)
        .margin({ top: 20 })

        Column() {
          Row() {
            Text('待分析合同')
              .fontSize(12)
              .fontColor(COLOR_SECONDARY)
            Blank()
            Text('示例')
              .fontSize(10)
              .fontColor(COLOR_BLUE)
              .backgroundColor(COLOR_BLUE_BG)
              .padding({ left: 6, right: 6, top: 2, bottom: 2 })
              .borderRadius(4)
          }
          .width('100%')

          Text(this.contract.name)
            .fontSize(18)
            .fontWeight(FontWeight.Medium)
            .fontColor(COLOR_TEXT)
            .margin({ top: 10 })
          Text(this.contract.parties)
            .fontSize(12)
            .fontColor(COLOR_SECONDARY)
            .margin({ top: 4 })
          Text(this.contract.address)
            .fontSize(12)
            .fontColor(COLOR_MUTED)
            .maxLines(1)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
            .margin({ top: 2 })

          Row() {
            Text(this.contract.clauses.length.toString() + ' 条条款')
              .fontSize(11)
              .fontColor(COLOR_SECONDARY)
            Text('·')
              .fontSize(11)
              .fontColor(COLOR_MUTED)
              .margin({ left: 6, right: 6 })
            Text(this.analysis.risks.length.toString() + ' 个风险点')
              .fontSize(11)
              .fontColor(COLOR_RED)
            Text('·')
              .fontSize(11)
              .fontColor(COLOR_MUTED)
              .margin({ left: 6, right: 6 })
            Text('约 6 分钟')
              .fontSize(11)
              .fontColor(COLOR_SECONDARY)
          }
          .margin({ top: 12 })

          Button('开始分析')
            .width('100%')
            .height(46)
            .fontSize(15)
            .fontColor('#FFFFFF')
            .backgroundColor(COLOR_NAVY)
            .borderRadius(23)
            .margin({ top: 16 })
            .onClick(() => this.startAnalysis())
        }
        .width('100%')
        .alignItems(HorizontalAlign.Start)
        .backgroundColor(COLOR_CARD)
        .padding(16)
        .borderRadius(16)
        .margin({ top: 14 })

        Row() {
          Column() {
            Text('历史记录')
              .fontSize(15)
              .fontWeight(FontWeight.Medium)
              .fontColor(COLOR_TEXT)
            Text('查看已分析合同')
              .fontSize(11)
              .fontColor(COLOR_SECONDARY)
              .margin({ top: 4 })
          }
          .alignItems(HorizontalAlign.Start)
          .layoutWeight(1)
          .onClick(() => {
            this.loadHistory();
            this.screen = AppScreen.History;
          })
          Divider()
            .vertical(true)
            .height(36)
            .color(COLOR_BORDER)
            .margin({ left: 14, right: 14 })
          Column() {
            Text('使用说明')
              .fontSize(15)
              .fontWeight(FontWeight.Medium)
              .fontColor(COLOR_TEXT)
            Text('如何看风险报告')
              .fontSize(11)
              .fontColor(COLOR_SECONDARY)
              .margin({ top: 4 })
          }
          .alignItems(HorizontalAlign.Start)
          .layoutWeight(1)
          .onClick(() => {
            AlertDialog.show({
              title: '使用说明',
              message: '1. 使用示例合同或导入合同。\n2. 查看风险条款、法律依据和修改建议。\n3. 接受修改后生成对比，查看风险分变化。\n4. 复制谈判话术或导出报告。\n\n本工具仅提供风险提示，不构成法律意见。',
              alignment: DialogAlignment.Center,
              confirm: {
                value: '知道了',
                action: () => {
                }
              }
            });
          })
        }
        .width('100%')
        .backgroundColor(COLOR_CARD)
        .padding(16)
        .borderRadius(16)
        .margin({ top: 14 })

        Text('本工具仅提供合同风险提示与谈判参考，不构成正式法律意见。')
          .fontSize(10)
          .fontColor(COLOR_MUTED)
          .lineHeight(16)
          .margin({ top: 18 })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 16, bottom: 28 })
    }
    .width('100%')
    .height('100%')
    .scrollBar(BarState.Off)
  }

  @Builder
  AnalyzingView() {
    Column() {
      LoadingProgress()
        .width(44)
        .height(44)
        .color(COLOR_NAVY)
      Text('正在分析合同条款')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor(COLOR_TEXT)
        .margin({ top: 16 })
      Text('识别风险条款 · 匹配法律依据 · 生成修改建议')
        .fontSize(12)
        .fontColor(COLOR_SECONDARY)
        .margin({ top: 6 })
    }
    .width('100%')
    .layoutWeight(1)
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
  }

  @Builder
  AnalysisScreen() {
    Column() {
      this.TopBar('合同分析', true)
      if (this.analyzing) {
        this.AnalyzingView()
      } else {
        Scroll() {
          Column() {
            Row() {
              Column() {
                Text(this.getCurrentScore().toString())
                  .fontSize(52)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(scoreColor(this.getCurrentScore()))
                Text('综合风险分')
                  .fontSize(12)
                  .fontColor(COLOR_SECONDARY)
                  .margin({ top: 2 })
              }
              .width(110)
              .alignItems(HorizontalAlign.Start)

              Column() {
                Row() {
                  Text(scoreLabel(this.getCurrentScore()))
                    .fontSize(15)
                    .fontWeight(FontWeight.Medium)
                    .fontColor(scoreColor(this.getCurrentScore()))
                  Text(this.analysis.source === 'api' ? 'AI 实时' : '示例')
                    .fontSize(9)
                    .fontColor(this.analysis.source === 'api' ? COLOR_GREEN : COLOR_SECONDARY)
                    .backgroundColor(this.analysis.source === 'api' ? COLOR_GREEN_BG : '#EEF1F4')
                    .padding({ left: 5, right: 5, top: 2, bottom: 2 })
                    .borderRadius(4)
                    .margin({ left: 8 })
                  Blank()
                  Text('分析时 ' + this.analysis.overallScore.toString())
                    .fontSize(10)
                    .fontColor(COLOR_MUTED)
                }
                .width('100%')
                Text(this.analysis.summary)
                  .fontSize(12)
                  .fontColor(COLOR_SECONDARY)
                  .lineHeight(19)
                  .maxLines(3)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })
                  .margin({ top: 6 })
                Row() {
                  Text('高 ' + this.analysis.highCount.toString())
                    .fontSize(10)
                    .fontColor(COLOR_RED)
                    .backgroundColor(COLOR_RED_BG)
                    .padding({ left: 6, right: 6, top: 3, bottom: 3 })
                    .borderRadius(4)
                  Text('中 ' + this.analysis.mediumCount.toString())
                    .fontSize(10)
                    .fontColor(COLOR_AMBER)
                    .backgroundColor(COLOR_AMBER_BG)
                    .padding({ left: 6, right: 6, top: 3, bottom: 3 })
                    .borderRadius(4)
                    .margin({ left: 6 })
                }
                .margin({ top: 8 })
              }
              .layoutWeight(1)
              .alignItems(HorizontalAlign.Start)
              .margin({ left: 14 })
            }
            .width('100%')
            .backgroundColor(COLOR_CARD)
            .padding(18)
            .borderRadius(18)

            Column() {
              Text('风险分布')
                .fontSize(15)
                .fontWeight(FontWeight.Medium)
                .fontColor(COLOR_TEXT)
              ForEach(this.analysis.categoryScores, (category: CategoryScore) => {
                Column() {
                  Row() {
                    Text(category.name)
                      .fontSize(11)
                      .fontColor(COLOR_SECONDARY)
                    Blank()
                    Text(category.score.toString())
                      .fontSize(11)
                      .fontColor(barColor(category.score))
                  }
                  .width('100%')
                  Progress({ value: category.score, total: 100, type: ProgressType.Linear })
                    .height(6)
                    .color(barColor(category.score))
                    .backgroundColor('#EEF1F4')
                    .margin({ top: 4 })
                }
                .width('100%')
                .margin({ top: 10 })
              }, (category: CategoryScore) => category.name)
            }
            .width('100%')
            .backgroundColor(COLOR_CARD)
            .padding(16)
            .borderRadius(16)
            .margin({ top: 12 })

            Row() {
              Text('风险条款')
                .fontSize(18)
                .fontWeight(FontWeight.Bold)
                .fontColor(COLOR_TEXT)
              Blank()
              Text(this.analysis.risks.length.toString() + ' 条')
                .fontSize(11)
                .fontColor(COLOR_SECONDARY)
            }
            .width('100%')
            .margin({ top: 20, bottom: 2 })

            ForEach(this.analysis.risks, (risk: RiskItem) => {
              this.RiskCard(risk)
            }, (risk: RiskItem) => risk.id)

            Button(this.showAllClauses ? '收起全部条款' : '查看全部 ' + this.contract.clauses.length.toString() + ' 条条款')
              .width('100%')
              .height(42)
              .fontSize(13)
              .fontColor(COLOR_NAVY)
              .backgroundColor(COLOR_CARD)
              .border({ width: 1, color: COLOR_BORDER })
              .borderRadius(21)
              .margin({ top: 14 })
              .onClick(() => {
                this.showAllClauses = !this.showAllClauses;
              })

            if (this.showAllClauses) {
              ForEach(this.contract.clauses, (clause: Clause) => {
                this.ClauseCard(clause)
              }, (clause: Clause) => clause.id)
            }

            Row() {
              Button('生成建议修订版')
                .layoutWeight(1)
                .height(46)
                .fontSize(14)
                .fontColor('#FFFFFF')
                .backgroundColor(COLOR_NAVY)
                .borderRadius(23)
                .onClick(() => {
                  this.screen = AppScreen.Revision;
                })
              Button('谈判助手')
                .layoutWeight(1)
                .height(46)
                .fontSize(14)
                .fontColor(COLOR_NAVY)
                .backgroundColor(COLOR_CARD)
                .border({ width: 1, color: COLOR_BORDER })
                .borderRadius(23)
                .margin({ left: 10 })
                .onClick(() => {
                  this.screen = AppScreen.Negotiation;
                })
            }
            .width('100%')
            .margin({ top: 18 })
          }
          .width('100%')
          .padding({ left: 16, right: 16, bottom: 28 })
        }
        .width('100%')
        .layoutWeight(1)
        .scrollBar(BarState.Off)
      }
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  RiskCard(risk: RiskItem) {
    Column() {
      Row() {
        Text(levelLabel(risk.level))
          .fontSize(10)
          .fontColor(levelColor(risk.level))
          .backgroundColor(levelBg(risk.level))
          .padding({ left: 6, right: 6, top: 2, bottom: 2 })
          .borderRadius(4)
        Text(risk.riskType)
          .fontSize(10)
          .fontColor(COLOR_SECONDARY)
          .margin({ left: 8 })
        Blank()
        Text(risk.clauseTitle)
          .fontSize(10)
          .fontColor(COLOR_MUTED)
      }
      .width('100%')

      Text(risk.title)
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor(COLOR_TEXT)
        .margin({ top: 8 })
      Text(risk.reason)
        .fontSize(12)
        .fontColor(COLOR_SECONDARY)
        .lineHeight(18)
        .maxLines(2)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
        .margin({ top: 4 })
      Row() {
        Text('查看详情与话术')
          .fontSize(11)
          .fontColor(COLOR_BLUE)
        Blank()
        if (this.isAccepted(risk.id)) {
          Text('已接受修改')
            .fontSize(10)
            .fontColor(COLOR_GREEN)
            .backgroundColor(COLOR_GREEN_BG)
            .padding({ left: 6, right: 6, top: 2, bottom: 2 })
            .borderRadius(4)
        }
      }
      .width('100%')
      .margin({ top: 10 })
    }
    .width('100%')
    .backgroundColor(COLOR_CARD)
    .padding(14)
    .borderRadius(14)
    .margin({ top: 10 })
    .onClick(() => this.openRisk(risk.id))
  }

  @Builder
  ClauseCard(clause: Clause) {
    Column() {
      Row() {
        Text(clause.title)
          .fontSize(13)
          .fontWeight(FontWeight.Medium)
          .fontColor(COLOR_TEXT)
        Blank()
        if (this.getRiskForClause(clause.id) !== undefined) {
          Text('有风险')
            .fontSize(10)
            .fontColor(COLOR_RED)
            .backgroundColor(COLOR_RED_BG)
            .padding({ left: 6, right: 6, top: 2, bottom: 2 })
            .borderRadius(4)
        }
      }
      .width('100%')
      Text(clause.text)
        .fontSize(12)
        .fontColor(COLOR_SECONDARY)
        .lineHeight(18)
        .maxLines(2)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
        .margin({ top: 6 })
    }
    .width('100%')
    .backgroundColor(COLOR_CARD)
    .padding(12)
    .borderRadius(12)
    .margin({ top: 8 })
    .onClick(() => this.openClause(clause))
  }

  @Builder
  RiskScreen() {
    Column() {
      this.TopBar('风险详情', true)
      if (this.getSelectedRisk() !== undefined) {
        this.RiskDetailContent(this.getSelectedRisk() as RiskItem)
      } else {
        this.EmptyState('未选择风险', '返回合同分析重新选择')
      }
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  RiskDetailContent(risk: RiskItem) {
    Scroll() {
      Column() {
        Row() {
          Text(levelLabel(risk.level))
            .fontSize(10)
            .fontColor(levelColor(risk.level))
            .backgroundColor(levelBg(risk.level))
            .padding({ left: 6, right: 6, top: 2, bottom: 2 })
            .borderRadius(4)
          Text(risk.riskType)
            .fontSize(10)
            .fontColor(COLOR_SECONDARY)
            .margin({ left: 8 })
          Blank()
          Text(risk.clauseTitle)
            .fontSize(10)
            .fontColor(COLOR_MUTED)
        }
        .width('100%')

        Text(risk.title)
          .fontSize(22)
          .fontWeight(FontWeight.Bold)
          .fontColor(COLOR_TEXT)
          .margin({ top: 10 })

        this.SectionTitle('原条款')
        Text(risk.clauseText)
          .fontSize(13)
          .fontColor(COLOR_TEXT)
          .lineHeight(21)
          .backgroundColor('#F7F8FA')
          .padding(12)
          .borderRadius(10)
          .width('100%')

        this.SectionTitle('风险在哪里')
        Text(risk.reason)
          .fontSize(13)
          .fontColor(COLOR_SECONDARY)
          .lineHeight(21)
          .width('100%')

        this.SectionTitle('可能后果')
        Text(risk.consequence)
          .fontSize(13)
          .fontColor(COLOR_SECONDARY)
          .lineHeight(21)
          .width('100%')

        this.SectionTitle('法律依据')
        ForEach(risk.legalBasisIds, (basisId: string) => {
          this.LegalCard(getLegalBasis(basisId))
        }, (basisId: string) => basisId)

        this.SectionTitle('建议改为')
        Text(risk.revisedClause)
          .fontSize(13)
          .fontColor(COLOR_GREEN)
          .lineHeight(21)
          .backgroundColor(COLOR_GREEN_BG)
          .padding(12)
          .borderRadius(10)
          .width('100%')

        this.SectionTitle('谈判话术')
        ForEach(risk.negotiation, (script: NegotiationScript, index: number) => {
          this.ScriptCard(script)
        }, (script: NegotiationScript, index: number) => risk.id + '_' + index.toString())

        Button(this.isAccepted(risk.id) ? '已接受这条修改' : '接受这条修改')
          .width('100%')
          .height(46)
          .fontSize(14)
          .fontColor('#FFFFFF')
          .backgroundColor(this.isAccepted(risk.id) ? COLOR_GREEN : COLOR_NAVY)
          .borderRadius(23)
          .margin({ top: 20 })
          .onClick(() => {
            this.setAccepted(risk.id, !this.isAccepted(risk.id));
          })

        Button('查看合同对比')
          .width('100%')
          .height(46)
          .fontSize(14)
          .fontColor(COLOR_NAVY)
          .backgroundColor(COLOR_CARD)
          .border({ width: 1, color: COLOR_BORDER })
          .borderRadius(23)
          .margin({ top: 10 })
          .onClick(() => this.openDiff())
      }
      .width('100%')
      .padding({ left: 16, right: 16, bottom: 28 })
      .alignItems(HorizontalAlign.Start)
    }
    .width('100%')
    .layoutWeight(1)
    .scrollBar(BarState.Off)
  }

  @Builder
  LegalCard(basis: LegalBasis) {
    Column() {
      Text(basis.law + basis.article)
        .fontSize(12)
        .fontWeight(FontWeight.Medium)
        .fontColor(COLOR_NAVY)
      Text(basis.text)
        .fontSize(11)
        .fontColor(COLOR_SECONDARY)
        .lineHeight(18)
        .margin({ top: 6 })
    }
    .width('100%')
    .backgroundColor(COLOR_BLUE_BG)
    .padding(12)
    .borderRadius(10)
    .margin({ top: 8 })
    .alignItems(HorizontalAlign.Start)
  }

  @Builder
  ScriptCard(script: NegotiationScript) {
    Column() {
      Row() {
        Text(script.tone)
          .fontSize(10)
          .fontColor(COLOR_NAVY)
          .backgroundColor('#E8EEF6')
          .padding({ left: 6, right: 6, top: 2, bottom: 2 })
          .borderRadius(4)
        Blank()
        Button('复制')
          .height(28)
          .fontSize(10)
          .fontColor(COLOR_BLUE)
          .backgroundColor(COLOR_BLUE_BG)
          .borderRadius(14)
          .onClick(() => this.copyToClipboard(script.text))
      }
      .width('100%')
      Text(script.text)
        .fontSize(13)
        .fontColor(COLOR_TEXT)
        .lineHeight(21)
        .margin({ top: 8 })
        .width('100%')
    }
    .width('100%')
    .backgroundColor('#F7F8FA')
    .padding(12)
    .borderRadius(10)
    .margin({ top: 8 })
  }

  @Builder
  RevisionScreen() {
    Column() {
      this.TopBar('建议修订版', true)
      Scroll() {
        Column() {
          Text('原合同只读，接受建议后系统在副本中替换对应条款。')
            .fontSize(12)
            .fontColor(COLOR_SECONDARY)
            .lineHeight(19)
          Row() {
            Text('已接受 ' + this.acceptedRiskIds.length.toString() + ' / ' + this.analysis.risks.length.toString() + ' 条')
              .fontSize(12)
              .fontColor(COLOR_TEXT)
            Blank()
            Button('全部接受')
              .height(32)
              .fontSize(11)
              .fontColor(COLOR_BLUE)
              .backgroundColor(COLOR_BLUE_BG)
              .borderRadius(16)
              .onClick(() => this.acceptAll())
          }
          .width('100%')
          .margin({ top: 14 })

          ForEach(this.analysis.risks, (risk: RiskItem) => {
            Column() {
              Row() {
                Text(risk.title)
                  .fontSize(14)
                  .fontWeight(FontWeight.Medium)
                  .fontColor(COLOR_TEXT)
                  .layoutWeight(1)
                Toggle({ type: ToggleType.Switch, isOn: this.isAccepted(risk.id) })
                  .selectedColor(COLOR_GREEN)
                  .onChange((isOn: boolean) => {
                    this.setAccepted(risk.id, isOn);
                  })
              }
              .width('100%')
              Text('原：' + risk.clauseText)
                .fontSize(11)
                .fontColor(COLOR_MUTED)
                .lineHeight(17)
                .maxLines(2)
                .textOverflow({ overflow: TextOverflow.Ellipsis })
                .margin({ top: 8 })
              Text('改：' + risk.revisedClause)
                .fontSize(11)
                .fontColor(COLOR_GREEN)
                .lineHeight(17)
                .maxLines(2)
                .textOverflow({ overflow: TextOverflow.Ellipsis })
                .margin({ top: 4 })
            }
            .width('100%')
            .backgroundColor(COLOR_CARD)
            .padding(12)
            .borderRadius(12)
            .margin({ top: 10 })
          }, (risk: RiskItem) => risk.id)

          Row() {
            Column() {
              Text('修改前')
                .fontSize(10)
                .fontColor(COLOR_SECONDARY)
              Text(this.analysis.overallScore.toString())
                .fontSize(24)
                .fontWeight(FontWeight.Bold)
                .fontColor(scoreColor(this.analysis.overallScore))
            }
            .layoutWeight(1)
            Column() {
              Text('修改后')
                .fontSize(10)
                .fontColor(COLOR_SECONDARY)
              Text(this.getCurrentScore().toString())
                .fontSize(24)
                .fontWeight(FontWeight.Bold)
                .fontColor(scoreColor(this.getCurrentScore()))
            }
            .layoutWeight(1)
          }
          .width('100%')
          .backgroundColor(COLOR_CARD)
          .padding(14)
          .borderRadius(12)
          .margin({ top: 14 })

          Button('生成对比')
            .width('100%')
            .height(46)
            .fontSize(14)
            .fontColor('#FFFFFF')
            .backgroundColor(COLOR_NAVY)
            .borderRadius(23)
            .margin({ top: 16 })
            .onClick(() => this.openDiff())
        }
        .width('100%')
        .padding({ left: 16, right: 16, bottom: 28 })
        .alignItems(HorizontalAlign.Start)
      }
      .width('100%')
      .layoutWeight(1)
      .scrollBar(BarState.Off)
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  DiffScreen() {
    Column() {
      this.TopBar('合同对比', true)
      Scroll() {
        Column() {
          Row() {
            Column() {
              Text('修改前')
                .fontSize(10)
                .fontColor(COLOR_SECONDARY)
              Text(this.analysis.overallScore.toString())
                .fontSize(28)
                .fontWeight(FontWeight.Bold)
                .fontColor(scoreColor(this.analysis.overallScore))
            }
            .layoutWeight(1)
            Text('→')
              .fontSize(20)
              .fontColor(COLOR_MUTED)
            Column() {
              Text('修改后')
                .fontSize(10)
                .fontColor(COLOR_SECONDARY)
              Text(this.getCurrentScore().toString())
                .fontSize(28)
                .fontWeight(FontWeight.Bold)
                .fontColor(scoreColor(this.getCurrentScore()))
            }
            .layoutWeight(1)
          }
          .width('100%')
          .backgroundColor(COLOR_CARD)
          .padding(16)
          .borderRadius(16)

          if (this.getAcceptedRisks().length === 0) {
            this.EmptyState('还没有接受任何修改', '回到建议修订版，打开至少一条建议')
            Button('去接受修改')
              .width('100%')
              .height(44)
              .fontSize(13)
              .fontColor('#FFFFFF')
              .backgroundColor(COLOR_NAVY)
              .borderRadius(22)
              .margin({ top: 12 })
              .onClick(() => {
                this.screen = AppScreen.Revision;
              })
          } else {
            Text('共 ' + this.getAcceptedRisks().length.toString() + ' 条条款被修改')
              .fontSize(12)
              .fontColor(COLOR_SECONDARY)
              .margin({ top: 16, bottom: 2 })

            ForEach(this.getAcceptedRisks(), (risk: RiskItem) => {
              Column() {
                Row() {
                  Text(risk.clauseTitle)
                    .fontSize(13)
                    .fontWeight(FontWeight.Medium)
                    .fontColor(COLOR_TEXT)
                  Blank()
                  Text('已修改')
                    .fontSize(10)
                    .fontColor(COLOR_GREEN)
                    .backgroundColor(COLOR_GREEN_BG)
                    .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                    .borderRadius(4)
                }
                .width('100%')
                RichText(this.buildDiffHtml(risk))
                  .width('100%')
                  .margin({ top: 8 })
              }
              .width('100%')
              .backgroundColor(COLOR_CARD)
              .padding(14)
              .borderRadius(14)
              .margin({ top: 10 })
              .alignItems(HorizontalAlign.Start)
            }, (risk: RiskItem) => risk.id)

            Button('导出风险报告')
              .width('100%')
              .height(46)
              .fontSize(14)
              .fontColor('#FFFFFF')
              .backgroundColor(COLOR_NAVY)
              .borderRadius(23)
              .margin({ top: 16 })
              .onClick(() => this.openReport())
          }
        }
        .width('100%')
        .padding({ left: 16, right: 16, bottom: 28 })
        .alignItems(HorizontalAlign.Start)
      }
      .width('100%')
      .layoutWeight(1)
      .scrollBar(BarState.Off)
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  NegotiationScreen() {
    Column() {
      this.TopBar('谈判助手', true)
      Scroll() {
        Column() {
          Text('把每一句改成可以直接发给房东的话。')
            .fontSize(12)
            .fontColor(COLOR_SECONDARY)
            .lineHeight(19)
          ForEach(this.analysis.risks, (risk: RiskItem) => {
            Column() {
              Row() {
                Text(levelLabel(risk.level))
                  .fontSize(10)
                  .fontColor(levelColor(risk.level))
                  .backgroundColor(levelBg(risk.level))
                  .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                  .borderRadius(4)
                Text(risk.clauseTitle)
                  .fontSize(10)
                  .fontColor(COLOR_MUTED)
                  .margin({ left: 8 })
              }
              .width('100%')
              Text(risk.title)
                .fontSize(15)
                .fontWeight(FontWeight.Medium)
                .fontColor(COLOR_TEXT)
                .margin({ top: 8 })
              ForEach(risk.negotiation, (script: NegotiationScript, index: number) => {
                this.ScriptCard(script)
              }, (script: NegotiationScript, index: number) => risk.id + '_n_' + index.toString())
            }
            .width('100%')
            .backgroundColor(COLOR_CARD)
            .padding(14)
            .borderRadius(14)
            .margin({ top: 10 })
            .alignItems(HorizontalAlign.Start)
          }, (risk: RiskItem) => risk.id)

          Button('导出风险报告')
            .width('100%')
            .height(46)
            .fontSize(14)
            .fontColor('#FFFFFF')
            .backgroundColor(COLOR_NAVY)
            .borderRadius(23)
            .margin({ top: 16 })
            .onClick(() => this.openReport())
        }
        .width('100%')
        .padding({ left: 16, right: 16, bottom: 28 })
        .alignItems(HorizontalAlign.Start)
      }
      .width('100%')
      .layoutWeight(1)
      .scrollBar(BarState.Off)
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  ReportScreen() {
    Column() {
      this.TopBar('风险报告', true)
      Scroll() {
        Column() {
          Text('签前风险报告')
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor(COLOR_TEXT)
          Text('包含风险评分、条款依据、修改建议和谈判话术。')
            .fontSize(12)
            .fontColor(COLOR_SECONDARY)
            .margin({ top: 4 })
          Text(this.reportText)
            .fontSize(12)
            .fontColor(COLOR_TEXT)
            .lineHeight(20)
            .backgroundColor(COLOR_CARD)
            .padding(14)
            .borderRadius(12)
            .margin({ top: 14 })
            .width('100%')
          Button('复制报告')
            .width('100%')
            .height(46)
            .fontSize(14)
            .fontColor('#FFFFFF')
            .backgroundColor(COLOR_NAVY)
            .borderRadius(23)
            .margin({ top: 16 })
            .onClick(() => this.copyToClipboard(this.reportText))
          Text('本报告仅用于风险提示，不构成法律意见。')
            .fontSize(10)
            .fontColor(COLOR_MUTED)
            .margin({ top: 14 })
        }
        .width('100%')
        .padding({ left: 16, right: 16, bottom: 28 })
        .alignItems(HorizontalAlign.Start)
      }
      .width('100%')
      .layoutWeight(1)
      .scrollBar(BarState.Off)
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  HistoryScreen() {
    Column() {
      this.TopBar('历史记录', true)
      Scroll() {
        Column() {
          if (this.history.length === 0) {
            this.EmptyState('还没有分析记录', '分析一份合同后，记录会保存在这里')
            Button('分析示例合同')
              .width('100%')
              .height(44)
              .fontSize(13)
              .fontColor('#FFFFFF')
              .backgroundColor(COLOR_NAVY)
              .borderRadius(22)
              .margin({ top: 12 })
              .onClick(() => this.startAnalysis())
          } else {
            ForEach(this.history, (record: HistoryRecord) => {
              Column() {
                Row() {
                  Text(record.contractName)
                    .fontSize(14)
                    .fontWeight(FontWeight.Medium)
                    .fontColor(COLOR_TEXT)
                    .layoutWeight(1)
                  Text(record.score.toString())
                    .fontSize(20)
                    .fontWeight(FontWeight.Bold)
                    .fontColor(scoreColor(record.score))
                }
                .width('100%')
                Text(record.analyzedAt + '  ·  高 ' + record.highCount.toString() + ' / 中 ' + record.mediumCount.toString())
                  .fontSize(11)
                  .fontColor(COLOR_SECONDARY)
                  .margin({ top: 6 })
              }
              .width('100%')
              .backgroundColor(COLOR_CARD)
              .padding(14)
              .borderRadius(14)
              .margin({ top: 10 })
              .onClick(() => {
                this.analysis = SAMPLE_ANALYSIS;
                this.acceptedRiskIds = [];
                this.screen = AppScreen.Analysis;
              })
            }, (record: HistoryRecord) => record.id)

            Button('清空历史')
              .width('100%')
              .height(42)
              .fontSize(12)
              .fontColor(COLOR_SECONDARY)
              .backgroundColor(COLOR_CARD)
              .border({ width: 1, color: COLOR_BORDER })
              .borderRadius(21)
              .margin({ top: 16 })
              .onClick(() => this.clearHistory())
          }
        }
        .width('100%')
        .padding({ left: 16, right: 16, bottom: 28 })
        .alignItems(HorizontalAlign.Start)
      }
      .width('100%')
      .layoutWeight(1)
      .scrollBar(BarState.Off)
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  EmptyState(title: string, subtitle: string) {
    Column() {
      Text(title)
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor(COLOR_TEXT)
      Text(subtitle)
        .fontSize(12)
        .fontColor(COLOR_SECONDARY)
        .margin({ top: 6 })
    }
    .width('100%')
    .padding({ top: 60, bottom: 40 })
    .alignItems(HorizontalAlign.Center)
  }
}