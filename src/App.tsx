import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import TrainingLogForm from './features/training/TrainingLogForm';
import TrainingHistory from './features/training/TrainingHistory';
import StretchSuggestion from './features/stretch/StretchSuggestion';
import IntervalTimer from './features/timer/IntervalTimer';
import SectionCard from './components/SectionCard';
import TrainingCalendar from './features/calendar/TrainingCalendar';
import AuthPage from './features/auth/AuthPage';
import './styles.css';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for Auth Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="app-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

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
        <button onClick={handleLogout} className="logout-button">
          ログアウト
        </button>
      </header>

      <main className="app-main">
        <SectionCard title="トレーニング記録">
          <TrainingLogForm />
        </SectionCard>

        <SectionCard title="トレーニング履歴">
          <TrainingHistory />
        </SectionCard>

        <SectionCard title="スケジューラー / カレンダー">
          <TrainingCalendar />
        </SectionCard>

        <SectionCard title="ストレッチの提案">
          <StretchSuggestion />
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
