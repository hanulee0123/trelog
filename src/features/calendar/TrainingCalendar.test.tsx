import { render, screen, cleanup, waitFor } from '@testing-library/react';
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
    getTrainingLogs: () => Promise.resolve(mockLogs),
}));

describe('TrainingCalendar Component', () => {
    afterEach(cleanup);

    it('renders without crashing', async () => {
        render(<TrainingCalendar />);
        // Use findByRole to wait for the component to settle and target specific element
        expect(await screen.findByRole('heading', { level: 3 })).toHaveTextContent(/の記録/);
    });

    it('displays exercise name but NO weight in calendar tile for today', async () => {
        // Since we mocked today's date in mockLogs[0], it should appear in the calendar
        const { container } = render(<TrainingCalendar />);

        // Wait for logs to load and dots to appear
        await waitFor(() => {
            const dots = container.querySelectorAll('.calendar-exercise-dot');
            expect(dots.length).toBeGreaterThan(0);
        });

        const dots = container.querySelectorAll('.calendar-exercise-dot');

        // Verify content of the first dot (today's log)
        // Should contain exercise name
        expect(dots[0]).toHaveTextContent('ベンチプレス');
        // Should NOT contain weight (60kg)
        expect(dots[0]).not.toHaveTextContent('60kg');
    });

    it('displays details for the selected date (today by default)', async () => {
        render(<TrainingCalendar />);

        // Check if the details section shows the max weight badge
        // Use findByText which waits for element to appear
        expect(await screen.findByText('Max 60kg')).toBeInTheDocument();

        // Check if the exercise name is displayed in the list
        const detailElements = screen.getAllByText('ベンチプレス');
        expect(detailElements.length).toBeGreaterThan(0);
    });
});
