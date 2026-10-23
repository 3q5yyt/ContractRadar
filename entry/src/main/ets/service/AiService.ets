import { http } from '@kit.NetworkKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { AiConfig } from '../config/AiConfig';
import { SAMPLE_ANALYSIS } from '../data/SampleData';
import { AnalysisResult, CategoryScore, Clause, Contract, NegotiationScript, RiskItem } from '../model/Models';

const LOG_TAG: string = 'CR_AI';

interface ApiNegotiation {
  tone: string;
  text: string;
}

interface ApiRisk {
  clauseId: string;
  riskType: string;
  level: string;
  title: string;
  reason: string;
  consequence: string;
  suggestion: string;
  revisedClause: string;
  legalBasis: string[];
  negotiation: ApiNegotiation[];
}

interface ApiAnalysis {
  overallScore: number;
  summary: string;
  risks: ApiRisk[];
}

interface ChatMessage {
  role: string;
  content: string;
}

interface ApiChatMessage {
  role: string;
  content: string;
}

interface ApiChatChoice {
  message: ApiChatMessage;
}

interface ApiChatResponse {
  choices: ApiChatChoice[];
}

interface ChatBody {
  model: string;
  messages: ChatMessage[];
  temperature: number;
}

function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve: () => void) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
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

function buildChatUrl(baseUrl: string): string {
  let url: string = baseUrl.trim();
  if (url.endsWith('/')) {
    url = url.substring(0, url.length - 1);
  }
  if (!url.endsWith('/chat/completions')) {
    url = url + '/chat/completions';
  }
  return url;
}

function extractJsonContent(content: string): string {
  let text: string = content.trim();
  if (text.startsWith('```')) {
    const firstNewline: number = text.indexOf('\n');
    if (firstNewline >= 0) {
      text = text.substring(firstNewline + 1);
    }
    const lastFence: number = text.lastIndexOf('```');
    if (lastFence >= 0) {
      text = text.substring(0, lastFence);
    }
  }
  const start: number = text.indexOf('{');
  const end: number = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    text = text.substring(start, end + 1);
  }
  return text.trim();
}

function findClause(contract: Contract, clauseId: string): Clause | undefined {
  for (const clause of contract.clauses) {
    if (clause.id === clauseId) {
      return clause;
    }
  }
  return undefined;
}

function normalizeLevel(level: string): string {
  if (level === 'high' || level === '高' || level === '高风险') {
    return 'high';
  }
  if (level === 'low' || level === '低' || level === '低风险') {
    return 'low';
  }
  if (level === 'medium' || level === '中' || level === '中风险') {
    return 'medium';
  }
  return 'medium';
}

function levelImpact(level: string): number {
  if (level === 'high') {
    return 10;
  }
  if (level === 'medium') {
    return 6;
  }
  return 3;
}

export class AiService {
  static async analyze(contract: Contract): Promise<AnalysisResult> {
    hilog.info(0x0000, LOG_TAG, 'analyze start useMock=%{public}s keyEmpty=%{public}s',
      AiConfig.USE_MOCK.toString(), (AiConfig.API_KEY.length === 0).toString());

    if (AiConfig.USE_MOCK || AiConfig.API_KEY.length === 0) {
      hilog.warn(0x0000, LOG_TAG, 'using mock analysis');
      await delay(900);
      return SAMPLE_ANALYSIS;
    }

    try {
      return await AiService.analyzeWithApi(contract);
    } catch (error) {
      // 网络或模型异常时回退到内置分析结果，保证演示可继续。
      hilog.error(0x0000, LOG_TAG, 'analyze failed: %{public}s', String(error));
      hilog.warn(0x0000, LOG_TAG, 'fallback to mock analysis');
      await delay(600);
      return SAMPLE_ANALYSIS;
    }
  }

  private static async analyzeWithApi(contract: Contract): Promise<AnalysisResult> {
    const httpRequest = http.createHttp();
    try {
      let contractText: string = '';
      for (const clause of contract.clauses) {
        contractText = contractText + clause.title + '\n' + clause.text + '\n\n';
      }

      const systemPrompt: string =
        '你是租房合同风险审查助手。请从承租人角度分析合同条款，识别押金、租金、违约金、维修责任、转租、提前解约、免责、争议管辖等风险。' +
        '只输出 JSON，不要输出 Markdown。JSON 结构：' +
        '{"overallScore":0-100,"summary":"一句话结论","risks":[{"clauseId":"c5","riskType":"押金与租金","level":"high|medium|low","title":"风险标题","reason":"风险原因","consequence":"可能后果","suggestion":"修改建议","revisedClause":"修改后的条款","legalBasis":["law585"],"negotiation":[{"tone":"温和","text":"谈判话术"}]}]}';

      const userPrompt: string =
        '请分析以下租房合同，并严格按 JSON 输出。\n\n合同名称：' + contract.name + '\n\n' + contractText +
        '\n可选法条 id：law496、law497、law506、law509、law543、law577、law585、law710、law712、law713、law716、law733、law734、lawCPL35。';

      const body: ChatBody = {
        model: AiConfig.MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2
      };

      const options: http.HttpRequestOptions = {
        method: http.RequestMethod.POST,
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + AiConfig.API_KEY
        },
        extraData: JSON.stringify(body),
        expectDataType: http.HttpDataType.STRING,
        connectTimeout: 30000,
        readTimeout: 60000
      };

      const chatUrl: string = buildChatUrl(AiConfig.BASE_URL);
      hilog.info(0x0000, LOG_TAG, 'request url=%{public}s model=%{public}s', chatUrl, AiConfig.MODEL);
      const response = await httpRequest.request(chatUrl, options);
      if (response.responseCode !== 200) {
        const errorText: string = response.result as string;
        throw new Error('HTTP ' + response.responseCode.toString() + ' ' + errorText.substring(0, 300));
      }

      const text: string = response.result as string;
      const chatResponse: ApiChatResponse = JSON.parse(text) as ApiChatResponse;
      let content: string = '';
      if (chatResponse.choices !== undefined && chatResponse.choices.length > 0) {
        const choice: ApiChatChoice = chatResponse.choices[0];
        if (choice.message === undefined || choice.message.content === undefined) {
          throw new Error('empty message content');
        }
        content = choice.message.content;
      } else {
        // 兼容直接返回分析 JSON 的非标准接口。
        content = text;
      }

      let parsed: ApiAnalysis = { overallScore: 0, summary: '', risks: [] };
      try {
        parsed = JSON.parse(extractJsonContent(content)) as ApiAnalysis;
      } catch (parseError) {
        throw new Error('invalid JSON content: ' + content.substring(0, 300));
      }
      if (parsed.risks === undefined || parsed.risks.length === 0) {
        throw new Error('empty risks');
      }

      const risks: RiskItem[] = [];
      let highCount: number = 0;
      let mediumCount: number = 0;
      let lowCount: number = 0;

      for (const apiRisk of parsed.risks) {
        const clauseId: string = apiRisk.clauseId !== undefined ? apiRisk.clauseId : '';
        const clause = findClause(contract, clauseId);
        const level: string = normalizeLevel(apiRisk.level);
        if (level === 'high') {
          highCount++;
        } else if (level === 'medium') {
          mediumCount++;
        } else {
          lowCount++;
        }

        const negotiation: NegotiationScript[] = [];
        if (apiRisk.negotiation !== undefined) {
          for (const item of apiRisk.negotiation) {
            negotiation.push({ tone: item.tone, text: item.text });
          }
        }

        const revised: string = apiRisk.revisedClause !== undefined ? apiRisk.revisedClause : '';
        const legalBasisIds: string[] = [];
        if (apiRisk.legalBasis !== undefined) {
          for (const basisId of apiRisk.legalBasis) {
            if (typeof basisId === 'string') {
              legalBasisIds.push(basisId);
            }
          }
        }

        const risk: RiskItem = {
          id: 'api_' + clauseId + '_' + risks.length.toString(),
          clauseId: clauseId,
          clauseTitle: clause !== undefined ? clause.title : '合同条款',
          clauseText: clause !== undefined ? clause.text : '',
          riskType: apiRisk.riskType !== undefined ? apiRisk.riskType : '其他',
          level: level,
          title: apiRisk.title !== undefined ? apiRisk.title : '合同风险',
          reason: apiRisk.reason !== undefined ? apiRisk.reason : '',
          consequence: apiRisk.consequence !== undefined ? apiRisk.consequence : '',
          suggestion: apiRisk.suggestion !== undefined ? apiRisk.suggestion : '',
          revisedClause: revised.length > 0 ? revised : (clause !== undefined ? clause.text : ''),
          legalBasisIds: legalBasisIds,
          negotiation: negotiation,
          scoreImpact: levelImpact(level)
        };
        risks.push(risk);
      }

      if (risks.length === 0) {
        throw new Error('no valid risks');
      }

      let overallScore: number = parsed.overallScore;
      if (overallScore === undefined || overallScore < 0 || overallScore > 100) {
        overallScore = 70;
      }

      const categoryNames: string[] = ['押金与租金', '违约金', '维修责任', '转租与退租', '提前解约', '免责与争议', '居住安宁'];
      const categoryScores: CategoryScore[] = [];
      for (const name of categoryNames) {
        let count: number = 0;
        let total: number = 0;
        for (const risk of risks) {
          if (risk.riskType === name) {
            count++;
            total = total + (risk.level === 'high' ? 90 : (risk.level === 'medium' ? 60 : 30));
          }
        }
        categoryScores.push({ name: name, score: count > 0 ? Math.round(total / count) : 15 });
      }

      let otherCount: number = 0;
      let otherTotal: number = 0;
      for (const risk of risks) {
        if (categoryNames.indexOf(risk.riskType) < 0) {
          otherCount++;
          otherTotal = otherTotal + (risk.level === 'high' ? 90 : (risk.level === 'medium' ? 60 : 30));
        }
      }
      if (otherCount > 0) {
        categoryScores.push({ name: '其他', score: Math.round(otherTotal / otherCount) });
      }

      hilog.info(0x0000, LOG_TAG, 'analyze success risks=%{public}d', risks.length);

      return {
        contractId: contract.id,
        contractName: contract.name,
        analyzedAt: nowText(),
        source: 'api',
        overallScore: overallScore,
        highCount: highCount,
        mediumCount: mediumCount,
        lowCount: lowCount,
        summary: parsed.summary !== undefined && parsed.summary.length > 0 ? parsed.summary : '合同存在若干风险条款，建议逐条核对。',
        categoryScores: categoryScores,
        risks: risks
      };
    } finally {
      httpRequest.destroy();
    }
  }
}