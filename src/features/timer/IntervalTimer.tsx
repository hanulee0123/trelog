import { useEffect, useRef, useState } from 'react';

type TimerState = 'idle' | 'running' | 'paused';

const PRESET_TIMES = [30, 60, 90, 120];

function IntervalTimer() {
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(90);
  const [state, setState] = useState<TimerState>('idle');
  const [customInput, setCustomInput] = useState('90');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (state === 'running' && remaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            playAlert();
            setState('idle');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state, remaining]);

  const playAlert = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    } catch (error) {
      console.warn('音声アラートの再生に失敗しました', error);
    }
  };

  const handleStart = () => {
    if (state === 'idle') {
      setRemaining(duration);
    }
    setState('running');
  };

  const handlePause = () => {
    setState('paused');
  };

  const handleReset = () => {
    setState('idle');
    setRemaining(duration);
  };

  const handlePresetSelect = (seconds: number) => {
    setDuration(seconds);
    setRemaining(seconds);
    setCustomInput(String(seconds));
    setState('idle');
  };

  const handleCustomChange = (value: string) => {
    setCustomInput(value);
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      setDuration(num);
      if (state === 'idle') {
        setRemaining(num);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (remaining / duration) * 100 : 0;

  return (
    <div className="interval-timer">
      <div className="timer-display">
        <svg className="timer-circle" viewBox="0 0 200 200">
          <circle
            className="timer-circle-bg"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
          />
          <circle
            className="timer-circle-progress"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#2563eb"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 90}`}
            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
            transform="rotate(-90 100 100)"
          />
          <text
            x="100"
            y="110"
            textAnchor="middle"
            className="timer-text"
            fontSize="48"
            fontWeight="bold"
            fill="#0f172a"
          >
            {formatTime(remaining)}
          </text>
        </svg>
      </div>

      <div className="timer-controls">
        {state === 'idle' && (
          <button type="button" className="primary-button timer-button" onClick={handleStart}>
            スタート
          </button>
        )}
        {state === 'running' && (
          <button type="button" className="ghost-button timer-button" onClick={handlePause}>
            一時停止
          </button>
        )}
        {state === 'paused' && (
          <>
            <button type="button" className="primary-button timer-button" onClick={handleStart}>
              再開
            </button>
            <button type="button" className="ghost-button timer-button" onClick={handleReset}>
              リセット
            </button>
          </>
        )}
        {state === 'running' && (
          <button type="button" className="ghost-button timer-button" onClick={handleReset}>
            リセット
          </button>
        )}
      </div>

      {state === 'idle' && (
        <div className="timer-presets">
          <p className="field-label">プリセット時間</p>
          <div className="preset-buttons">
            {PRESET_TIMES.map((time) => (
              <button
                key={time}
                type="button"
                className={duration === time ? 'preset-button active' : 'preset-button'}
                onClick={() => handlePresetSelect(time)}
              >
                {time}秒
              </button>
            ))}
          </div>
          <label className="field timer-custom">
            <span className="field-label">カスタム（秒）</span>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              value={customInput}
              onChange={(e) => handleCustomChange(e.target.value)}
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default IntervalTimer;
