import { TrainingLog } from '../types/training';

const STORAGE_KEY = 'trelog:training-logs';

export function saveTrainingLog(log: Omit<TrainingLog, 'id' | 'date'>): TrainingLog {
  try {
    const newLog: TrainingLog = {
      ...log,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };

    const logs = getTrainingLogs();
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

    return newLog;
  } catch (error) {
    console.error('記録の保存に失敗しました:', error);
    throw new Error('記録の保存に失敗しました');
  }
}

export function getTrainingLogs(): TrainingLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data) as TrainingLog[];
  } catch (error) {
    console.error('記録の読み込みに失敗しました:', error);
    return [];
  }
}

export function deleteTrainingLog(id: string): void {
  try {
    const logs = getTrainingLogs();
    const filtered = logs.filter((log) => log.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('記録の削除に失敗しました:', error);
    throw new Error('記録の削除に失敗しました');
  }
}

export function clearAllLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('全記録の削除に失敗しました:', error);
    throw new Error('全記録の削除に失敗しました');
  }
}
