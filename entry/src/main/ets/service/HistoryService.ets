import { preferences } from '@kit.ArkData';
import { common } from '@kit.AbilityKit';
import { HistoryRecord } from '../model/Models';

const STORE_NAME: string = 'contract_radar_history';
const RECORDS_KEY: string = 'records';

export class HistoryService {
  static async load(context: common.UIAbilityContext): Promise<HistoryRecord[]> {
    try {
      const store = await preferences.getPreferences(context, STORE_NAME);
      const value = await store.get(RECORDS_KEY, '[]');
      const jsonText: string = value as string;
      return JSON.parse(jsonText) as HistoryRecord[];
    } catch (error) {
      return [];
    }
  }

  static async save(context: common.UIAbilityContext, records: HistoryRecord[]): Promise<void> {
    try {
      const store = await preferences.getPreferences(context, STORE_NAME);
      await store.put(RECORDS_KEY, JSON.stringify(records));
      await store.flush();
    } catch (error) {
      // Demo 环境忽略持久化异常，内存中的历史记录仍然可用。
    }
  }

  static async clear(context: common.UIAbilityContext): Promise<void> {
    try {
      const store = await preferences.getPreferences(context, STORE_NAME);
      await store.delete(RECORDS_KEY);
      await store.flush();
    } catch (error) {
      // 忽略。
    }
  }
}