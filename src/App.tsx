import TrainingLogForm from './features/training/TrainingLogForm';
import StretchSuggestion from './features/stretch/StretchSuggestion';
import IntervalTimer from './features/timer/IntervalTimer';
import SectionCard from './components/SectionCard';
import './styles.css';

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-kicker">モバイルファーストのトレーニング記録</p>
          <h1>Trelog</h1>
          <p className="app-subtitle">
            種目ごとのセット入力とストレッチ提案、予定管理をひとまとめに。
          </p>
        </div>
      </header>

      <main className="app-main">
        <SectionCard title="トレーニング記録">
          <TrainingLogForm />
        </SectionCard>

        <SectionCard title="ストレッチの提案">
          <StretchSuggestion />
        </SectionCard>

        <SectionCard title="スケジュール / カレンダー">
          <p className="placeholder">カレンダー連携と次回予定をここに表示します。</p>
        </SectionCard>

        <SectionCard title="通知・リマインド">
          <p className="placeholder">プッシュ通知設定と休養日リマインドを管理します。</p>
        </SectionCard>

        <SectionCard title="インターバルタイマー">
          <IntervalTimer />
        </SectionCard>
      </main>
    </div>
  );
}

export default App;
