if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Index_Params {
    screen?: AppScreen;
    contract?: Contract;
    analysis?: AnalysisResult;
    selectedRiskId?: string;
    acceptedRiskIds?: string[];
    history?: HistoryRecord[];
    reportText?: string;
    analyzing?: boolean;
    showAllClauses?: boolean;
}
import type common from "@ohos:app.ability.common";
import promptAction from "@ohos:promptAction";
import { COLOR_AMBER, COLOR_AMBER_BG, COLOR_BG, COLOR_BLUE, COLOR_BLUE_BG, COLOR_BORDER, COLOR_CARD, COLOR_GREEN, COLOR_GREEN_BG, COLOR_MUTED, COLOR_NAVY, COLOR_RED, COLOR_RED_BG, COLOR_SECONDARY, COLOR_TEXT, barColor, levelBg, levelColor, levelLabel, scoreColor, scoreLabel } from "@bundle:com.example.contractradar/entry/ets/common/Theme";
import { getLegalBasis, SAMPLE_ANALYSIS, SAMPLE_CONTRACT } from "@bundle:com.example.contractradar/entry/ets/data/SampleData";
import type { AnalysisResult, CategoryScore, Clause, Contract, HistoryRecord, LegalBasis, NegotiationScript, RiskItem } from '../model/Models';
import { AiService } from "@bundle:com.example.contractradar/entry/ets/service/AiService";
import { copyText } from "@bundle:com.example.contractradar/entry/ets/service/ClipboardService";
import { diffText } from "@bundle:com.example.contractradar/entry/ets/service/DiffService";
import { HistoryService } from "@bundle:com.example.contractradar/entry/ets/service/HistoryService";
import { buildReport } from "@bundle:com.example.contractradar/entry/ets/service/ReportService";
enum AppScreen {
    Home = 0,
    Analysis = 1,
    Risk = 2,
    Revision = 3,
    Diff = 4,
    Negotiation = 5,
    Report = 6,
    History = 7
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
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__screen = new ObservedPropertySimplePU(AppScreen.Home, this, "screen");
        this.__contract = new ObservedPropertyObjectPU(SAMPLE_CONTRACT, this, "contract");
        this.__analysis = new ObservedPropertyObjectPU(SAMPLE_ANALYSIS, this, "analysis");
        this.__selectedRiskId = new ObservedPropertySimplePU('', this, "selectedRiskId");
        this.__acceptedRiskIds = new ObservedPropertyObjectPU([], this, "acceptedRiskIds");
        this.__history = new ObservedPropertyObjectPU([], this, "history");
        this.__reportText = new ObservedPropertySimplePU('', this, "reportText");
        this.__analyzing = new ObservedPropertySimplePU(false, this, "analyzing");
        this.__showAllClauses = new ObservedPropertySimplePU(false, this, "showAllClauses");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Index_Params) {
        if (params.screen !== undefined) {
            this.screen = params.screen;
        }
        if (params.contract !== undefined) {
            this.contract = params.contract;
        }
        if (params.analysis !== undefined) {
            this.analysis = params.analysis;
        }
        if (params.selectedRiskId !== undefined) {
            this.selectedRiskId = params.selectedRiskId;
        }
        if (params.acceptedRiskIds !== undefined) {
            this.acceptedRiskIds = params.acceptedRiskIds;
        }
        if (params.history !== undefined) {
            this.history = params.history;
        }
        if (params.reportText !== undefined) {
            this.reportText = params.reportText;
        }
        if (params.analyzing !== undefined) {
            this.analyzing = params.analyzing;
        }
        if (params.showAllClauses !== undefined) {
            this.showAllClauses = params.showAllClauses;
        }
    }
    updateStateVars(params: Index_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__screen.purgeDependencyOnElmtId(rmElmtId);
        this.__contract.purgeDependencyOnElmtId(rmElmtId);
        this.__analysis.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedRiskId.purgeDependencyOnElmtId(rmElmtId);
        this.__acceptedRiskIds.purgeDependencyOnElmtId(rmElmtId);
        this.__history.purgeDependencyOnElmtId(rmElmtId);
        this.__reportText.purgeDependencyOnElmtId(rmElmtId);
        this.__analyzing.purgeDependencyOnElmtId(rmElmtId);
        this.__showAllClauses.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__screen.aboutToBeDeleted();
        this.__contract.aboutToBeDeleted();
        this.__analysis.aboutToBeDeleted();
        this.__selectedRiskId.aboutToBeDeleted();
        this.__acceptedRiskIds.aboutToBeDeleted();
        this.__history.aboutToBeDeleted();
        this.__reportText.aboutToBeDeleted();
        this.__analyzing.aboutToBeDeleted();
        this.__showAllClauses.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __screen: ObservedPropertySimplePU<AppScreen>;
    get screen() {
        return this.__screen.get();
    }
    set screen(newValue: AppScreen) {
        this.__screen.set(newValue);
    }
    private __contract: ObservedPropertyObjectPU<Contract>;
    get contract() {
        return this.__contract.get();
    }
    set contract(newValue: Contract) {
        this.__contract.set(newValue);
    }
    private __analysis: ObservedPropertyObjectPU<AnalysisResult>;
    get analysis() {
        return this.__analysis.get();
    }
    set analysis(newValue: AnalysisResult) {
        this.__analysis.set(newValue);
    }
    private __selectedRiskId: ObservedPropertySimplePU<string>;
    get selectedRiskId() {
        return this.__selectedRiskId.get();
    }
    set selectedRiskId(newValue: string) {
        this.__selectedRiskId.set(newValue);
    }
    private __acceptedRiskIds: ObservedPropertyObjectPU<string[]>;
    get acceptedRiskIds() {
        return this.__acceptedRiskIds.get();
    }
    set acceptedRiskIds(newValue: string[]) {
        this.__acceptedRiskIds.set(newValue);
    }
    private __history: ObservedPropertyObjectPU<HistoryRecord[]>;
    get history() {
        return this.__history.get();
    }
    set history(newValue: HistoryRecord[]) {
        this.__history.set(newValue);
    }
    private __reportText: ObservedPropertySimplePU<string>;
    get reportText() {
        return this.__reportText.get();
    }
    set reportText(newValue: string) {
        this.__reportText.set(newValue);
    }
    private __analyzing: ObservedPropertySimplePU<boolean>;
    get analyzing() {
        return this.__analyzing.get();
    }
    set analyzing(newValue: boolean) {
        this.__analyzing.set(newValue);
    }
    private __showAllClauses: ObservedPropertySimplePU<boolean>;
    get showAllClauses() {
        return this.__showAllClauses.get();
    }
    set showAllClauses(newValue: boolean) {
        this.__showAllClauses.set(newValue);
    }
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
        }
        else if (this.screen === AppScreen.Risk) {
            this.screen = AppScreen.Analysis;
        }
        else if (this.screen === AppScreen.Revision || this.screen === AppScreen.Diff ||
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
        }
        else {
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
            }
            else if (segment.type === 'insert') {
                html += '<span style="color:#2E7D5B;text-decoration:underline;">' + segment.text + '</span>';
            }
            else {
                html += segment.text;
            }
        }
        html += '</div>';
        return html;
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(COLOR_BG);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.screen === AppScreen.Home) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.HomeScreen.bind(this)();
                });
            }
            else if (this.screen === AppScreen.Analysis) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.AnalysisScreen.bind(this)();
                });
            }
            else if (this.screen === AppScreen.Risk) {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.RiskScreen.bind(this)();
                });
            }
            else if (this.screen === AppScreen.Revision) {
                this.ifElseBranchUpdateFunction(3, () => {
                    this.RevisionScreen.bind(this)();
                });
            }
            else if (this.screen === AppScreen.Diff) {
                this.ifElseBranchUpdateFunction(4, () => {
                    this.DiffScreen.bind(this)();
                });
            }
            else if (this.screen === AppScreen.Negotiation) {
                this.ifElseBranchUpdateFunction(5, () => {
                    this.NegotiationScreen.bind(this)();
                });
            }
            else if (this.screen === AppScreen.Report) {
                this.ifElseBranchUpdateFunction(6, () => {
                    this.ReportScreen.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(7, () => {
                    this.HistoryScreen.bind(this)();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    TopBar(title: string, showBack: boolean, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.height(52);
            Row.padding({ left: 10, right: 16 });
            Row.alignItems(VerticalAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (showBack) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('←');
                        Text.fontSize(22);
                        Text.fontColor(COLOR_TEXT);
                        Text.width(40);
                        Text.height(40);
                        Text.textAlign(TextAlign.Center);
                        Text.onClick(() => this.back());
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(title);
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(COLOR_TEXT);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('合同雷达');
            Text.fontSize(11);
            Text.fontColor(COLOR_MUTED);
        }, Text);
        Text.pop();
        Row.pop();
    }
    SectionTitle(title: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(title);
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(COLOR_TEXT);
            Text.margin({ top: 18, bottom: 8 });
        }, Text);
        Text.pop();
    }
    HomeScreen(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.width('100%');
            Scroll.height('100%');
            Scroll.scrollBar(BarState.Off);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 16, right: 16, top: 16, bottom: 28 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.alignItems(VerticalAlign.Top);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('合同雷达');
            Text.fontSize(28);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(COLOR_TEXT);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('签前 3 分钟，看清租房合同');
            Text.fontSize(13);
            Text.fontColor(COLOR_SECONDARY);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('DEMO');
            Text.fontSize(10);
            Text.fontColor('#FFFFFF');
            Text.backgroundColor(COLOR_NAVY);
            Text.padding({ left: 8, right: 8, top: 4, bottom: 4 });
            Text.borderRadius(6);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.alignItems(HorizontalAlign.Start);
            Column.backgroundColor(COLOR_NAVY);
            Column.padding(20);
            Column.borderRadius(20);
            Column.margin({ top: 20 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('AI 合同风险审查');
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFFFFF');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('标出风险条款 · 解释法律依据 · 生成谈判话术');
            Text.fontSize(13);
            Text.fontColor('#B9C9DC');
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.margin({ top: 18 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('使用示例合同');
            Button.height(44);
            Button.fontSize(14);
            Button.fontColor(COLOR_NAVY);
            Button.backgroundColor('#FFFFFF');
            Button.borderRadius(22);
            Button.onClick(() => this.startAnalysis());
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('导入合同');
            Button.height(44);
            Button.fontSize(14);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#00000000');
            Button.border({ width: 1, color: '#5A7A9A' });
            Button.borderRadius(22);
            Button.margin({ left: 10 });
            Button.onClick(() => {
                promptAction.showToast({ message: 'Demo 版本使用内置示例合同' });
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.alignItems(HorizontalAlign.Start);
            Column.backgroundColor(COLOR_CARD);
            Column.padding(16);
            Column.borderRadius(16);
            Column.margin({ top: 14 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('待分析合同');
            Text.fontSize(12);
            Text.fontColor(COLOR_SECONDARY);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('示例');
            Text.fontSize(10);
            Text.fontColor(COLOR_BLUE);
            Text.backgroundColor(COLOR_BLUE_BG);
            Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
            Text.borderRadius(4);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.contract.name);
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(COLOR_TEXT);
            Text.margin({ top: 10 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.contract.parties);
            Text.fontSize(12);
            Text.fontColor(COLOR_SECONDARY);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.contract.address);
            Text.fontSize(12);
            Text.fontColor(COLOR_MUTED);
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.margin({ top: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.contract.clauses.length.toString() + ' 条条款');
            Text.fontSize(11);
            Text.fontColor(COLOR_SECONDARY);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('·');
            Text.fontSize(11);
            Text.fontColor(COLOR_MUTED);
            Text.margin({ left: 6, right: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.analysis.risks.length.toString() + ' 个风险点');
            Text.fontSize(11);
            Text.fontColor(COLOR_RED);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('·');
            Text.fontSize(11);
            Text.fontColor(COLOR_MUTED);
            Text.margin({ left: 6, right: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('约 6 分钟');
            Text.fontSize(11);
            Text.fontColor(COLOR_SECONDARY);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('开始分析');
            Button.width('100%');
            Button.height(46);
            Button.fontSize(15);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor(COLOR_NAVY);
            Button.borderRadius(23);
            Button.margin({ top: 16 });
            Button.onClick(() => this.startAnalysis());
        }, Button);
        Button.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.backgroundColor(COLOR_CARD);
            Row.padding(16);
            Row.borderRadius(16);
            Row.margin({ top: 14 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.onClick(() => {
                this.loadHistory();
                this.screen = AppScreen.History;
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('历史记录');
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(COLOR_TEXT);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('查看已分析合同');
            Text.fontSize(11);
            Text.fontColor(COLOR_SECONDARY);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.vertical(true);
            Divider.height(36);
            Divider.color(COLOR_BORDER);
            Divider.margin({ left: 14, right: 14 });
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.onClick(() => {
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
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('使用说明');
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(COLOR_TEXT);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('如何看风险报告');
            Text.fontSize(11);
            Text.fontColor(COLOR_SECONDARY);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('本工具仅提供合同风险提示与谈判参考，不构成正式法律意见。');
            Text.fontSize(10);
            Text.fontColor(COLOR_MUTED);
            Text.lineHeight(16);
            Text.margin({ top: 18 });
        }, Text);
        Text.pop();
        Column.pop();
        Scroll.pop();
    }
    AnalyzingView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.layoutWeight(1);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            LoadingProgress.create();
            LoadingProgress.width(44);
            LoadingProgress.height(44);
            LoadingProgress.color(COLOR_NAVY);
        }, LoadingProgress);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('正在分析合同条款');
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(COLOR_TEXT);
            Text.margin({ top: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('识别风险条款 · 匹配法律依据 · 生成修改建议');
            Text.fontSize(12);
            Text.fontColor(COLOR_SECONDARY);
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        Column.pop();
    }
    AnalysisScreen(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.TopBar.bind(this)('合同分析', true);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.analyzing) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.AnalyzingView.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Scroll.create();
                        Scroll.width('100%');
                        Scroll.layoutWeight(1);
                        Scroll.scrollBar(BarState.Off);
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding({ left: 16, right: 16, bottom: 28 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.backgroundColor(COLOR_CARD);
                        Row.padding(18);
                        Row.borderRadius(18);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width(110);
                        Column.alignItems(HorizontalAlign.Start);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.getCurrentScore().toString());
                        Text.fontSize(52);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor(scoreColor(this.getCurrentScore()));
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('综合风险分');
                        Text.fontSize(12);
                        Text.fontColor(COLOR_SECONDARY);
                        Text.margin({ top: 2 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.alignItems(HorizontalAlign.Start);
                        Column.margin({ left: 14 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(scoreLabel(this.getCurrentScore()));
                        Text.fontSize(15);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor(scoreColor(this.getCurrentScore()));
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                    }, Blank);
                    Blank.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('分析时 ' + this.analysis.overallScore.toString());
                        Text.fontSize(10);
                        Text.fontColor(COLOR_MUTED);
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.analysis.summary);
                        Text.fontSize(12);
                        Text.fontColor(COLOR_SECONDARY);
                        Text.lineHeight(19);
                        Text.maxLines(3);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        Text.margin({ top: 6 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.margin({ top: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('高 ' + this.analysis.highCount.toString());
                        Text.fontSize(10);
                        Text.fontColor(COLOR_RED);
                        Text.backgroundColor(COLOR_RED_BG);
                        Text.padding({ left: 6, right: 6, top: 3, bottom: 3 });
                        Text.borderRadius(4);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('中 ' + this.analysis.mediumCount.toString());
                        Text.fontSize(10);
                        Text.fontColor(COLOR_AMBER);
                        Text.backgroundColor(COLOR_AMBER_BG);
                        Text.padding({ left: 6, right: 6, top: 3, bottom: 3 });
                        Text.borderRadius(4);
                        Text.margin({ left: 6 });
                    }, Text);
                    Text.pop();
                    Row.pop();
                    Column.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.backgroundColor(COLOR_CARD);
                        Column.padding(16);
                        Column.borderRadius(16);
                        Column.margin({ top: 12 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('风险分布');
                        Text.fontSize(15);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor(COLOR_TEXT);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const category = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.width('100%');
                                Column.margin({ top: 10 });
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.width('100%');
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(category.name);
                                Text.fontSize(11);
                                Text.fontColor(COLOR_SECONDARY);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Blank.create();
                            }, Blank);
                            Blank.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(category.score.toString());
                                Text.fontSize(11);
                                Text.fontColor(barColor(category.score));
                            }, Text);
                            Text.pop();
                            Row.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Progress.create({ value: category.score, total: 100, type: ProgressType.Linear });
                                Progress.height(6);
                                Progress.color(barColor(category.score));
                                Progress.backgroundColor('#EEF1F4');
                                Progress.margin({ top: 4 });
                            }, Progress);
                            Column.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.analysis.categoryScores, forEachItemGenFunction, (category: CategoryScore) => category.name, false, false);
                    }, ForEach);
                    ForEach.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.margin({ top: 20, bottom: 2 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('风险条款');
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor(COLOR_TEXT);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                    }, Blank);
                    Blank.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.analysis.risks.length.toString() + ' 条');
                        Text.fontSize(11);
                        Text.fontColor(COLOR_SECONDARY);
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const risk = _item;
                            this.RiskCard.bind(this)(risk);
                        };
                        this.forEachUpdateFunction(elmtId, this.analysis.risks, forEachItemGenFunction, (risk: RiskItem) => risk.id, false, false);
                    }, ForEach);
                    ForEach.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel(this.showAllClauses ? '收起全部条款' : '查看全部 ' + this.contract.clauses.length.toString() + ' 条条款');
                        Button.width('100%');
                        Button.height(42);
                        Button.fontSize(13);
                        Button.fontColor(COLOR_NAVY);
                        Button.backgroundColor(COLOR_CARD);
                        Button.border({ width: 1, color: COLOR_BORDER });
                        Button.borderRadius(21);
                        Button.margin({ top: 14 });
                        Button.onClick(() => {
                            this.showAllClauses = !this.showAllClauses;
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.showAllClauses) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    ForEach.create();
                                    const forEachItemGenFunction = _item => {
                                        const clause = _item;
                                        this.ClauseCard.bind(this)(clause);
                                    };
                                    this.forEachUpdateFunction(elmtId, this.contract.clauses, forEachItemGenFunction, (clause: Clause) => clause.id, false, false);
                                }, ForEach);
                                ForEach.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.margin({ top: 18 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('生成建议修订版');
                        Button.layoutWeight(1);
                        Button.height(46);
                        Button.fontSize(14);
                        Button.fontColor('#FFFFFF');
                        Button.backgroundColor(COLOR_NAVY);
                        Button.borderRadius(23);
                        Button.onClick(() => {
                            this.screen = AppScreen.Revision;
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('谈判助手');
                        Button.layoutWeight(1);
                        Button.height(46);
                        Button.fontSize(14);
                        Button.fontColor(COLOR_NAVY);
                        Button.backgroundColor(COLOR_CARD);
                        Button.border({ width: 1, color: COLOR_BORDER });
                        Button.borderRadius(23);
                        Button.margin({ left: 10 });
                        Button.onClick(() => {
                            this.screen = AppScreen.Negotiation;
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    Column.pop();
                    Scroll.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    RiskCard(risk: RiskItem, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.backgroundColor(COLOR_CARD);
            Column.padding(14);
            Column.borderRadius(14);
            Column.margin({ top: 10 });
            Column.onClick(() => this.openRisk(risk.id));
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(levelLabel(risk.level));
            Text.fontSize(10);
            Text.fontColor(levelColor(risk.level));
            Text.backgroundColor(levelBg(risk.level));
            Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
            Text.borderRadius(4);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(risk.riskType);
            Text.fontSize(10);
            Text.fontColor(COLOR_SECONDARY);
            Text.margin({ left: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(risk.clauseTitle);
            Text.fontSize(10);
            Text.fontColor(COLOR_MUTED);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(risk.title);
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(COLOR_TEXT);
            Text.margin({ top: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(risk.reason);
            Text.fontSize(12);
            Text.fontColor(COLOR_SECONDARY);
            Text.lineHeight(18);
            Text.maxLines(2);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('查看详情与话术');
            Text.fontSize(11);
            Text.fontColor(COLOR_BLUE);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isAccepted(risk.id)) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('已接受修改');
                        Text.fontSize(10);
                        Text.fontColor(COLOR_GREEN);
                        Text.backgroundColor(COLOR_GREEN_BG);
                        Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
                        Text.borderRadius(4);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Row.pop();
        Column.pop();
    }
    ClauseCard(clause: Clause, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.backgroundColor(COLOR_CARD);
            Column.padding(12);
            Column.borderRadius(12);
            Column.margin({ top: 8 });
            Column.onClick(() => this.openClause(clause));
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(clause.title);
            Text.fontSize(13);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(COLOR_TEXT);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.getRiskForClause(clause.id) !== undefined) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('有风险');
                        Text.fontSize(10);
                        Text.fontColor(COLOR_RED);
                        Text.backgroundColor(COLOR_RED_BG);
                        Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
                        Text.borderRadius(4);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(clause.text);
            Text.fontSize(12);
            Text.fontColor(COLOR_SECONDARY);
            Text.lineHeight(18);
            Text.maxLines(2);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        Column.pop();
    }
    RiskScreen(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.TopBar.bind(this)('风险详情', true);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.getSelectedRisk() !== undefined) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.RiskDetailContent.bind(this)(this.getSelectedRisk() as RiskItem);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.EmptyState.bind(this)('未选择风险', '返回合同分析重新选择');
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    RiskDetailContent(risk: RiskItem, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.width('100%');
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 16, right: 16, bottom: 28 });
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(levelLabel(risk.level));
            Text.fontSize(10);
            Text.fontColor(levelColor(risk.level));
            Text.backgroundColor(levelBg(risk.level));
            Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
            Text.borderRadius(4);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(risk.riskType);
            Text.fontSize(10);
            Text.fontColor(COLOR_SECONDARY);
            Text.margin({ left: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(risk.clauseTitle);
            Text.fontSize(10);
            Text.fontColor(COLOR_MUTED);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(risk.title);
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(COLOR_TEXT);
            Text.margin({ top: 10 });
        }, Text);
        Text.pop();
        this.SectionTitle.bind(this)('原条款');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(risk.clauseText);
            Text.fontSize(13);
            Text.fontColor(COLOR_TEXT);
            Text.lineHeight(21);
            Text.backgroundColor('#F7F8FA');
            Text.padding(12);
            Text.borderRadius(10);
            Text.width('100%');
        }, Text);
        Text.pop();
        this.SectionTitle.bind(this)('风险在哪里');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(risk.reason);
            Text.fontSize(13);
            Text.fontColor(COLOR_SECONDARY);
            Text.lineHeight(21);
            Text.width('100%');
        }, Text);
        Text.pop();
        this.SectionTitle.bind(this)('可能后果');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(risk.consequence);
            Text.fontSize(13);
            Text.fontColor(COLOR_SECONDARY);
            Text.lineHeight(21);
            Text.width('100%');
        }, Text);
        Text.pop();
        this.SectionTitle.bind(this)('法律依据');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const basisId = _item;
                this.LegalCard.bind(this)(getLegalBasis(basisId));
            };
            this.forEachUpdateFunction(elmtId, risk.legalBasisIds, forEachItemGenFunction, (basisId: string) => basisId, false, false);
        }, ForEach);
        ForEach.pop();
        this.SectionTitle.bind(this)('建议改为');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(risk.revisedClause);
            Text.fontSize(13);
            Text.fontColor(COLOR_GREEN);
            Text.lineHeight(21);
            Text.backgroundColor(COLOR_GREEN_BG);
            Text.padding(12);
            Text.borderRadius(10);
            Text.width('100%');
        }, Text);
        Text.pop();
        this.SectionTitle.bind(this)('谈判话术');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, index: number) => {
                const script = _item;
                this.ScriptCard.bind(this)(script);
            };
            this.forEachUpdateFunction(elmtId, risk.negotiation, forEachItemGenFunction, (script: NegotiationScript, index: number) => risk.id + '_' + index.toString(), true, true);
        }, ForEach);
        ForEach.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.isAccepted(risk.id) ? '已接受这条修改' : '接受这条修改');
            Button.width('100%');
            Button.height(46);
            Button.fontSize(14);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor(this.isAccepted(risk.id) ? COLOR_GREEN : COLOR_NAVY);
            Button.borderRadius(23);
            Button.margin({ top: 20 });
            Button.onClick(() => {
                this.setAccepted(risk.id, !this.isAccepted(risk.id));
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('查看合同对比');
            Button.width('100%');
            Button.height(46);
            Button.fontSize(14);
            Button.fontColor(COLOR_NAVY);
            Button.backgroundColor(COLOR_CARD);
            Button.border({ width: 1, color: COLOR_BORDER });
            Button.borderRadius(23);
            Button.margin({ top: 10 });
            Button.onClick(() => this.openDiff());
        }, Button);
        Button.pop();
        Column.pop();
        Scroll.pop();
    }
    LegalCard(basis: LegalBasis, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.backgroundColor(COLOR_BLUE_BG);
            Column.padding(12);
            Column.borderRadius(10);
            Column.margin({ top: 8 });
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(basis.law + basis.article);
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(COLOR_NAVY);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(basis.text);
            Text.fontSize(11);
            Text.fontColor(COLOR_SECONDARY);
            Text.lineHeight(18);
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        Column.pop();
    }
    ScriptCard(script: NegotiationScript, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.backgroundColor('#F7F8FA');
            Column.padding(12);
            Column.borderRadius(10);
            Column.margin({ top: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(script.tone);
            Text.fontSize(10);
            Text.fontColor(COLOR_NAVY);
            Text.backgroundColor('#E8EEF6');
            Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
            Text.borderRadius(4);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('复制');
            Button.height(28);
            Button.fontSize(10);
            Button.fontColor(COLOR_BLUE);
            Button.backgroundColor(COLOR_BLUE_BG);
            Button.borderRadius(14);
            Button.onClick(() => this.copyToClipboard(script.text));
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(script.text);
            Text.fontSize(13);
            Text.fontColor(COLOR_TEXT);
            Text.lineHeight(21);
            Text.margin({ top: 8 });
            Text.width('100%');
        }, Text);
        Text.pop();
        Column.pop();
    }
    RevisionScreen(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.TopBar.bind(this)('建议修订版', true);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.width('100%');
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 16, right: 16, bottom: 28 });
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('原合同只读，接受建议后系统在副本中替换对应条款。');
            Text.fontSize(12);
            Text.fontColor(COLOR_SECONDARY);
            Text.lineHeight(19);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 14 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('已接受 ' + this.acceptedRiskIds.length.toString() + ' / ' + this.analysis.risks.length.toString() + ' 条');
            Text.fontSize(12);
            Text.fontColor(COLOR_TEXT);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('全部接受');
            Button.height(32);
            Button.fontSize(11);
            Button.fontColor(COLOR_BLUE);
            Button.backgroundColor(COLOR_BLUE_BG);
            Button.borderRadius(16);
            Button.onClick(() => this.acceptAll());
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const risk = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.width('100%');
                    Column.backgroundColor(COLOR_CARD);
                    Column.padding(12);
                    Column.borderRadius(12);
                    Column.margin({ top: 10 });
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.width('100%');
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(risk.title);
                    Text.fontSize(14);
                    Text.fontWeight(FontWeight.Medium);
                    Text.fontColor(COLOR_TEXT);
                    Text.layoutWeight(1);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Toggle.create({ type: ToggleType.Switch, isOn: this.isAccepted(risk.id) });
                    Toggle.selectedColor(COLOR_GREEN);
                    Toggle.onChange((isOn: boolean) => {
                        this.setAccepted(risk.id, isOn);
                    });
                }, Toggle);
                Toggle.pop();
                Row.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('原：' + risk.clauseText);
                    Text.fontSize(11);
                    Text.fontColor(COLOR_MUTED);
                    Text.lineHeight(17);
                    Text.maxLines(2);
                    Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                    Text.margin({ top: 8 });
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('改：' + risk.revisedClause);
                    Text.fontSize(11);
                    Text.fontColor(COLOR_GREEN);
                    Text.lineHeight(17);
                    Text.maxLines(2);
                    Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                    Text.margin({ top: 4 });
                }, Text);
                Text.pop();
                Column.pop();
            };
            this.forEachUpdateFunction(elmtId, this.analysis.risks, forEachItemGenFunction, (risk: RiskItem) => risk.id, false, false);
        }, ForEach);
        ForEach.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.backgroundColor(COLOR_CARD);
            Row.padding(14);
            Row.borderRadius(12);
            Row.margin({ top: 14 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('修改前');
            Text.fontSize(10);
            Text.fontColor(COLOR_SECONDARY);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.analysis.overallScore.toString());
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(scoreColor(this.analysis.overallScore));
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('修改后');
            Text.fontSize(10);
            Text.fontColor(COLOR_SECONDARY);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.getCurrentScore().toString());
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(scoreColor(this.getCurrentScore()));
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('生成对比');
            Button.width('100%');
            Button.height(46);
            Button.fontSize(14);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor(COLOR_NAVY);
            Button.borderRadius(23);
            Button.margin({ top: 16 });
            Button.onClick(() => this.openDiff());
        }, Button);
        Button.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    DiffScreen(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.TopBar.bind(this)('合同对比', true);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.width('100%');
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 16, right: 16, bottom: 28 });
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.backgroundColor(COLOR_CARD);
            Row.padding(16);
            Row.borderRadius(16);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('修改前');
            Text.fontSize(10);
            Text.fontColor(COLOR_SECONDARY);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.analysis.overallScore.toString());
            Text.fontSize(28);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(scoreColor(this.analysis.overallScore));
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('→');
            Text.fontSize(20);
            Text.fontColor(COLOR_MUTED);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('修改后');
            Text.fontSize(10);
            Text.fontColor(COLOR_SECONDARY);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.getCurrentScore().toString());
            Text.fontSize(28);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(scoreColor(this.getCurrentScore()));
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.getAcceptedRisks().length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.EmptyState.bind(this)('还没有接受任何修改', '回到建议修订版，打开至少一条建议');
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('去接受修改');
                        Button.width('100%');
                        Button.height(44);
                        Button.fontSize(13);
                        Button.fontColor('#FFFFFF');
                        Button.backgroundColor(COLOR_NAVY);
                        Button.borderRadius(22);
                        Button.margin({ top: 12 });
                        Button.onClick(() => {
                            this.screen = AppScreen.Revision;
                        });
                    }, Button);
                    Button.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('共 ' + this.getAcceptedRisks().length.toString() + ' 条条款被修改');
                        Text.fontSize(12);
                        Text.fontColor(COLOR_SECONDARY);
                        Text.margin({ top: 16, bottom: 2 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const risk = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.width('100%');
                                Column.backgroundColor(COLOR_CARD);
                                Column.padding(14);
                                Column.borderRadius(14);
                                Column.margin({ top: 10 });
                                Column.alignItems(HorizontalAlign.Start);
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.width('100%');
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(risk.clauseTitle);
                                Text.fontSize(13);
                                Text.fontWeight(FontWeight.Medium);
                                Text.fontColor(COLOR_TEXT);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Blank.create();
                            }, Blank);
                            Blank.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create('已修改');
                                Text.fontSize(10);
                                Text.fontColor(COLOR_GREEN);
                                Text.backgroundColor(COLOR_GREEN_BG);
                                Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
                                Text.borderRadius(4);
                            }, Text);
                            Text.pop();
                            Row.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                RichText.create(this.buildDiffHtml(risk));
                                RichText.width('100%');
                                RichText.margin({ top: 8 });
                            }, RichText);
                            Column.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.getAcceptedRisks(), forEachItemGenFunction, (risk: RiskItem) => risk.id, false, false);
                    }, ForEach);
                    ForEach.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('导出风险报告');
                        Button.width('100%');
                        Button.height(46);
                        Button.fontSize(14);
                        Button.fontColor('#FFFFFF');
                        Button.backgroundColor(COLOR_NAVY);
                        Button.borderRadius(23);
                        Button.margin({ top: 16 });
                        Button.onClick(() => this.openReport());
                    }, Button);
                    Button.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    NegotiationScreen(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.TopBar.bind(this)('谈判助手', true);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.width('100%');
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 16, right: 16, bottom: 28 });
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('把每一句改成可以直接发给房东的话。');
            Text.fontSize(12);
            Text.fontColor(COLOR_SECONDARY);
            Text.lineHeight(19);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const risk = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.width('100%');
                    Column.backgroundColor(COLOR_CARD);
                    Column.padding(14);
                    Column.borderRadius(14);
                    Column.margin({ top: 10 });
                    Column.alignItems(HorizontalAlign.Start);
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.width('100%');
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(levelLabel(risk.level));
                    Text.fontSize(10);
                    Text.fontColor(levelColor(risk.level));
                    Text.backgroundColor(levelBg(risk.level));
                    Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
                    Text.borderRadius(4);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(risk.clauseTitle);
                    Text.fontSize(10);
                    Text.fontColor(COLOR_MUTED);
                    Text.margin({ left: 8 });
                }, Text);
                Text.pop();
                Row.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(risk.title);
                    Text.fontSize(15);
                    Text.fontWeight(FontWeight.Medium);
                    Text.fontColor(COLOR_TEXT);
                    Text.margin({ top: 8 });
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    ForEach.create();
                    const forEachItemGenFunction = (_item, index: number) => {
                        const script = _item;
                        this.ScriptCard.bind(this)(script);
                    };
                    this.forEachUpdateFunction(elmtId, risk.negotiation, forEachItemGenFunction, (script: NegotiationScript, index: number) => risk.id + '_n_' + index.toString(), true, true);
                }, ForEach);
                ForEach.pop();
                Column.pop();
            };
            this.forEachUpdateFunction(elmtId, this.analysis.risks, forEachItemGenFunction, (risk: RiskItem) => risk.id, false, false);
        }, ForEach);
        ForEach.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('导出风险报告');
            Button.width('100%');
            Button.height(46);
            Button.fontSize(14);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor(COLOR_NAVY);
            Button.borderRadius(23);
            Button.margin({ top: 16 });
            Button.onClick(() => this.openReport());
        }, Button);
        Button.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    ReportScreen(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.TopBar.bind(this)('风险报告', true);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.width('100%');
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 16, right: 16, bottom: 28 });
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('签前风险报告');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(COLOR_TEXT);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('包含风险评分、条款依据、修改建议和谈判话术。');
            Text.fontSize(12);
            Text.fontColor(COLOR_SECONDARY);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.reportText);
            Text.fontSize(12);
            Text.fontColor(COLOR_TEXT);
            Text.lineHeight(20);
            Text.backgroundColor(COLOR_CARD);
            Text.padding(14);
            Text.borderRadius(12);
            Text.margin({ top: 14 });
            Text.width('100%');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('复制报告');
            Button.width('100%');
            Button.height(46);
            Button.fontSize(14);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor(COLOR_NAVY);
            Button.borderRadius(23);
            Button.margin({ top: 16 });
            Button.onClick(() => this.copyToClipboard(this.reportText));
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('本报告仅用于风险提示，不构成法律意见。');
            Text.fontSize(10);
            Text.fontColor(COLOR_MUTED);
            Text.margin({ top: 14 });
        }, Text);
        Text.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    HistoryScreen(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.TopBar.bind(this)('历史记录', true);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.width('100%');
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 16, right: 16, bottom: 28 });
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.history.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.EmptyState.bind(this)('还没有分析记录', '分析一份合同后，记录会保存在这里');
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('分析示例合同');
                        Button.width('100%');
                        Button.height(44);
                        Button.fontSize(13);
                        Button.fontColor('#FFFFFF');
                        Button.backgroundColor(COLOR_NAVY);
                        Button.borderRadius(22);
                        Button.margin({ top: 12 });
                        Button.onClick(() => this.startAnalysis());
                    }, Button);
                    Button.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const record = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.width('100%');
                                Column.backgroundColor(COLOR_CARD);
                                Column.padding(14);
                                Column.borderRadius(14);
                                Column.margin({ top: 10 });
                                Column.onClick(() => {
                                    this.analysis = SAMPLE_ANALYSIS;
                                    this.acceptedRiskIds = [];
                                    this.screen = AppScreen.Analysis;
                                });
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.width('100%');
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(record.contractName);
                                Text.fontSize(14);
                                Text.fontWeight(FontWeight.Medium);
                                Text.fontColor(COLOR_TEXT);
                                Text.layoutWeight(1);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(record.score.toString());
                                Text.fontSize(20);
                                Text.fontWeight(FontWeight.Bold);
                                Text.fontColor(scoreColor(record.score));
                            }, Text);
                            Text.pop();
                            Row.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(record.analyzedAt + '  ·  高 ' + record.highCount.toString() + ' / 中 ' + record.mediumCount.toString());
                                Text.fontSize(11);
                                Text.fontColor(COLOR_SECONDARY);
                                Text.margin({ top: 6 });
                            }, Text);
                            Text.pop();
                            Column.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.history, forEachItemGenFunction, (record: HistoryRecord) => record.id, false, false);
                    }, ForEach);
                    ForEach.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('清空历史');
                        Button.width('100%');
                        Button.height(42);
                        Button.fontSize(12);
                        Button.fontColor(COLOR_SECONDARY);
                        Button.backgroundColor(COLOR_CARD);
                        Button.border({ width: 1, color: COLOR_BORDER });
                        Button.borderRadius(21);
                        Button.margin({ top: 16 });
                        Button.onClick(() => this.clearHistory());
                    }, Button);
                    Button.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    EmptyState(title: string, subtitle: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ top: 60, bottom: 40 });
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(title);
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(COLOR_TEXT);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(subtitle);
            Text.fontSize(12);
            Text.fontColor(COLOR_SECONDARY);
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    public __resetStateVarsOnReuse__Internal(params: Object): void {
    }
    static getEntryName(): string {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.example.contractradar", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
