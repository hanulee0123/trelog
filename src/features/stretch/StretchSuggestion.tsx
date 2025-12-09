import { useMemo, useState } from 'react';

const stretchMap: Record<string, string[]> = {
  ベンチプレス: ['胸ストレッチ', 'ラットプル前の肩回りウォームアップ'],
  スクワット: ['股関節のモビリティ', 'ハムストリングのダイナミックストレッチ'],
  デッドリフト: ['背面チェーンの軽いストレッチ', '足首回りの可動域チェック']
};

function StretchSuggestion() {
  const [exercise, setExercise] = useState('ベンチプレス');
  const suggested = useMemo(() => stretchMap[exercise] ?? ['全身ストレッチ'], [exercise]);

  return (
    <div className="stack gap-md">
      <label className="field">
        <span className="field-label">種目を選択</span>
        <select value={exercise} onChange={(event) => setExercise(event.target.value)}>
          {Object.keys(stretchMap).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </label>

      <div className="stretch-hint">
        <p className="field-label">推奨ストレッチ</p>
        <ul>
          {suggested.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StretchSuggestion;
