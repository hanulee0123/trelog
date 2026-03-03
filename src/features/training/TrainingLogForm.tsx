import { useEffect, useMemo, useState } from 'react';
import { TrainingEntry, TrainingSet, UserTemplate } from '../../types/training';
import { saveTrainingLog, getUserTemplates, saveUserTemplate, deleteUserTemplate } from '../../lib/storage';

const defaultTemplates: TrainingEntry[] = [
  {
    exercise: 'ベンチプレス',
    sets: [
      { weight: 40, reps: 12 },
      { weight: 45, reps: 10 },
      { weight: 50, reps: 8 }
    ],
    intervalSeconds: 90
  },
  {
    exercise: 'スクワット',
    sets: [
      { weight: 60, reps: 12 },
      { weight: 70, reps: 10 },
      { weight: 80, reps: 8 }
    ],
    intervalSeconds: 120
  }
];

function TrainingLogForm() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [exercise, setExercise] = useState('ベンチプレス');
  const [sets, setSets] = useState<TrainingSet[]>([{ weight: 40, reps: 10 }]);
  const [intervalSeconds, setIntervalSeconds] = useState<number | ''>(90);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  useEffect(() => {
    getUserTemplates()
      .then(setUserTemplates)
      .finally(() => setTemplatesLoading(false));
  }, []);

  const stretchHints = useMemo(() => {
    if (exercise.includes('ベンチ')) {
      return ['胸ストレッチ', '肩甲骨の可動域ドリル'];
    }
    if (exercise.includes('スクワット')) {
      return ['股関節ストレッチ', 'カーフリリース'];
    }
    return ['全身ストレッチ'];
  }, [exercise]);

  const updateSet = (index: number, key: keyof TrainingSet, value: number | '') => {
    setSets((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const addSet = () => {
    setSets((prev) => [...prev, { weight: 0, reps: 0 }]);
  };

  const removeSet = (index: number) => {
    if (sets.length <= 1) return;
    setSets((prev) => prev.filter((_, i) => i !== index));
  };

  const applyTemplate = (template: TrainingEntry) => {
    setExercise(template.exercise);
    setSets(template.sets);
    setIntervalSeconds(template.intervalSeconds ?? 90);
  };

  const applyUserTemplate = (template: UserTemplate) => {
    setExercise(template.name);
    setSets(template.sets);
    setIntervalSeconds(template.intervalSeconds ?? 90);
  };

  const handleSaveAsTemplate = async () => {
    try {
      setSaveMessage('テンプレートを保存中...');
      const saved = await saveUserTemplate({
        name: exercise,
        sets: sets.map((s) => ({
          weight: s.weight === '' ? 0 : s.weight,
          reps: s.reps === '' ? 0 : s.reps,
        })),
        intervalSeconds: intervalSeconds === '' ? undefined : intervalSeconds,
      });
      setUserTemplates((prev) => [...prev, saved]);
      setSaveMessage('テンプレートを保存しました！');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setSaveMessage('テンプレートの保存に失敗しました');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteUserTemplate(id);
      setUserTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error(error);
      setSaveMessage('テンプレートの削除に失敗しました');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleSave = async () => {
    try {
      setSaveMessage('保存中...');
      await saveTrainingLog({
        date: new Date(date + 'T00:00:00').toISOString(),
        exercise,
        sets: sets.map((s) => ({
          weight: s.weight === '' ? 0 : s.weight,
          reps: s.reps === '' ? 0 : s.reps,
        })),
        intervalSeconds: intervalSeconds === '' ? 0 : intervalSeconds,
      });
      setSaveMessage('記録を保存しました！');
      setTimeout(() => setSaveMessage(null), 3000);

      // フォームをリセット
      setDate(new Date().toISOString().slice(0, 10));
      setExercise('ベンチプレス');
      setSets([{ weight: 40, reps: 10 }]);
      setIntervalSeconds(90);
    } catch (error) {
      console.error(error);
      setSaveMessage('保存に失敗しました');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <div className="stack gap-md">
      <label className="field">
        <span className="field-label">日付</span>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">種目</span>
        <input
          value={exercise}
          onChange={(event) => setExercise(event.target.value)}
          placeholder="例: ベンチプレス"
        />
      </label>

      <div className="set-list">
        <div className="set-list-header">
          <p className="field-label">セット</p>
          <button type="button" className="ghost-button" onClick={addSet}>
            セットを追加
          </button>
        </div>
        {sets.map((item, index) => (
          <div key={index} className="set-row">
            <label className="field">
              <span className="field-label">重量 (kg)</span>
              <input
                type="number"
                inputMode="decimal"
                value={item.weight}
                onChange={(event) => updateSet(index, 'weight', event.target.value === '' ? '' : Number(event.target.value))}
              />
            </label>
            <label className="field">
              <span className="field-label">回数</span>
              <input
                type="number"
                inputMode="numeric"
                value={item.reps}
                onChange={(event) => updateSet(index, 'reps', event.target.value === '' ? '' : Number(event.target.value))}
              />
            </label>
            {sets.length > 1 && (
              <button
                type="button"
                className="icon-button delete-set-button"
                onClick={() => removeSet(index)}
                aria-label="セットを削除"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <label className="field">
        <span className="field-label">インターバル (秒)</span>
        <input
          type="number"
          inputMode="numeric"
          value={intervalSeconds}
          onChange={(event) => setIntervalSeconds(event.target.value === '' ? '' : Number(event.target.value))}
        />
      </label>

      <div className="template-row">
        <div className="template-header">
          <p className="field-label">テンプレートから選択</p>
          <button type="button" className="ghost-button" onClick={handleSaveAsTemplate}>
            テンプレートとして保存
          </button>
        </div>
        <div className="template-list">
          {defaultTemplates.map((template) => (
            <button key={template.exercise} type="button" onClick={() => applyTemplate(template)}>
              {template.exercise}
            </button>
          ))}
          {templatesLoading && <span className="field-label">読み込み中...</span>}
          {userTemplates.map((template) => (
            <span key={template.id} className="user-template-chip">
              <button
                type="button"
                className="user-template-button"
                onClick={() => applyUserTemplate(template)}
              >
                {template.name}
              </button>
              <button
                type="button"
                className="delete-template-button"
                onClick={() => handleDeleteTemplate(template.id)}
                aria-label={`${template.name}テンプレートを削除`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="stretch-hint">
        <p className="field-label">おすすめストレッチ</p>
        <ul>
          {stretchHints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      </div>

      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('失敗') ? 'error' : 'success'}`}>
          {saveMessage}
        </div>
      )}

      <button type="button" className="primary-button" onClick={handleSave}>
        記録を保存
      </button>
    </div>
  );
}

export default TrainingLogForm;
