import { useEffect, useState } from 'react';
import { TrainingLog } from '../../types/training';
import { getTrainingLogs, deleteTrainingLog } from '../../lib/storage';

interface TrainingHistoryProps {
  onUpdate?: () => void;
}

function TrainingHistory({ onUpdate }: TrainingHistoryProps) {
  const [logs, setLogs] = useState<TrainingLog[]>([]);

  const loadLogs = () => {
    const loadedLogs = getTrainingLogs();
    setLogs(loadedLogs);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('この記録を削除しますか？')) {
      deleteTrainingLog(id);
      loadLogs();
      onUpdate?.();
    }
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (logs.length === 0) {
    return (
      <div className="empty-state">
        <p>まだトレーニング記録がありません。</p>
        <p className="empty-hint">上のフォームから記録を保存してください。</p>
      </div>
    );
  }

  return (
    <div className="training-history">
      {logs.map((log) => (
        <div key={log.id} className="history-item">
          <div className="history-header">
            <div>
              <h3 className="history-exercise">{log.exercise}</h3>
              <p className="history-date">{formatDate(log.date)}</p>
            </div>
            <button
              type="button"
              className="delete-button"
              onClick={() => handleDelete(log.id)}
              aria-label="削除"
            >
              ✕
            </button>
          </div>
          <div className="history-sets">
            <p className="field-label">セット詳細</p>
            <div className="sets-grid">
              {log.sets.map((set, index) => (
                <div key={index} className="set-badge">
                  {set.weight}kg × {set.reps}回
                </div>
              ))}
            </div>
            {log.intervalSeconds && (
              <p className="history-interval">インターバル: {log.intervalSeconds}秒</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TrainingHistory;
