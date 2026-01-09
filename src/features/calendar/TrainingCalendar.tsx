import { useEffect, useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import { format, isSameDay, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { getTrainingLogs } from '../../lib/storage';
import { TrainingLog } from '../../types/training';
import 'react-calendar/dist/Calendar.css';
import './TrainingCalendar.css';

type Value = Date | null | [Date | null, Date | null];

function TrainingCalendar() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Load logs asynchronously
    const [allLogs, setAllLogs] = useState<TrainingLog[]>([]);
    // const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTrainingLogs().then((logs) => {
            setAllLogs(logs);
        });
    }, []);

    // Group logs by date string (YYYY-MM-DD) for O(1) lookup
    const logsByDate = useMemo(() => {
        const map = new Map<string, TrainingLog[]>();
        allLogs.forEach((log) => {
            const dateStr = format(parseISO(log.date), 'yyyy-MM-dd');
            if (!map.has(dateStr)) {
                map.set(dateStr, []);
            }
            map.get(dateStr)?.push(log);
        });
        return map;
    }, [allLogs]);

    // Logs for the currently selected date
    const selectedLogs = useMemo(() => {
        return allLogs.filter((log) => isSameDay(parseISO(log.date), selectedDate));
    }, [allLogs, selectedDate]);

    // Function to render content inside calendar tiles
    const getTileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view !== 'month') return null;

        const dateStr = format(date, 'yyyy-MM-dd');
        const logs = logsByDate.get(dateStr);

        if (!logs || logs.length === 0) return null;

        return (
            <div className="calendar-tile-content">
                {logs.map((log) => {
                    return (
                        <div key={log.id} className="calendar-exercise-dot">
                            <span className="dot-name">{log.exercise}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const onChange = (value: Value) => {
        if (value instanceof Date) {
            setSelectedDate(value);
        }
    };

    return (
        <div className="training-calendar-container">
            <Calendar
                onChange={onChange}
                value={selectedDate}
                locale="ja-JP"
                tileContent={getTileContent}
                className="custom-calendar"
            />

            <div className="selected-date-details">
                <h3>{format(selectedDate, 'M月d日(E)', { locale: ja })} の記録</h3>

                {selectedLogs.length === 0 ? (
                    <p className="empty-date-message">この日の記録はありません</p>
                ) : (
                    <div className="daily-log-list">
                        {selectedLogs.map((log) => (
                            <div key={log.id} className="daily-log-item">
                                <div className="log-header">
                                    <span className="log-exercise">{log.exercise}</span>
                                    <span className="log-max-weight">
                                        Max {Math.max(...log.sets.map(s => s.weight))}kg
                                    </span>
                                </div>
                                <div className="log-sets">
                                    {log.sets.map((set, i) => (
                                        <span key={i} className="log-set-tag">
                                            {set.weight}kg × {set.reps}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TrainingCalendar;
