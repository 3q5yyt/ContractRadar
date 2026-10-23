/**
 * AI 接口配置。
 *
 * 演示阶段保持 USE_MOCK = true，不依赖网络和 API Key。
 * 接入真实模型时：
 * 1. 把 API_KEY 换成你的 key；
 * 2. 把 USE_MOCK 改成 false；
 * 3. 按供应商修改 BASE_URL 和 MODEL。
 *
 * 注意：把 key 放在客户端只适合课程/毕设演示。
 * 如果后续要上架，应该改走自己的后端代理，客户端不保存 key。
 */
export class AiConfig {
    static readonly USE_MOCK: boolean = true;
    static readonly API_KEY: string = '';
    static readonly BASE_URL: string = 'https://api.deepseek.com/v1/chat/completions';
    static readonly MODEL: string = 'deepseek-chat';
}
