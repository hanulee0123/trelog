import { render, screen, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import TrainingCalendar from './TrainingCalendar';
import { TrainingLog } from '../../types/training';

// Mock storage
const mockLogs: TrainingLog[] = [
    {
        id: '1',
        date: new Date().toISOString(), // Today
        exercise: 'ベンチプレス',
        sets: [
            { weight: 50, reps: 10 },
            { weight: 60, reps: 5 }, // Max weight 60
        ],
    },
    {
        id: '2',
        date: '2025-01-01T10:00:00.000Z', // Specific date
        exercise: 'スクワット',
        sets: [
            { weight: 100, reps: 5 }, // Max weight 100
        ],
    }
];

vi.mock('../../lib/storage', () => ({
    getTrainingLogs: () => mockLogs,
}));

describe('TrainingCalendar Component', () => {
    afterEach(cleanup);

    it('renders without crashing', () => {
        render(<TrainingCalendar />);
        expect(screen.getByText(/の記録/)).toBeInTheDocument();
    });

    it('displays max weight in calendar tile for today', () => {
        // Since we mocked today's date in mockLogs[0], it should appear in the calendar
        render(<TrainingCalendar />);

        // We look for text content within the calendar tiles
        // Note: react-calendar might render complex HTML, so we check for the expected text
        // Manual truncation removed, CSS handles it. We expect full text in DOM.
        expect(screen.getByText('60kg')).toBeInTheDocument();
        const exerciseElements = screen.getAllByText('ベンチプレス');
        expect(exerciseElements.length).toBeGreaterThan(0);
    });

    it('displays details for the selected date (today by default)', () => {
        render(<TrainingCalendar />);

        // Check if the details section shows the max weight badge
        expect(screen.getByText('Max 60kg')).toBeInTheDocument();

        // Check if the exercise name is displayed in the list
        const detailElements = screen.getAllByText('ベンチプレス');
        expect(detailElements.length).toBeGreaterThan(0);
    });
});
