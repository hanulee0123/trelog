import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrainingLogForm from './TrainingLogForm';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getUserTemplates, saveUserTemplate, deleteUserTemplate } from '../../lib/storage';

// Mock the storage utility
vi.mock('../../lib/storage', () => ({
    saveTrainingLog: vi.fn(),
    getUserTemplates: vi.fn().mockResolvedValue([]),
    saveUserTemplate: vi.fn(),
    deleteUserTemplate: vi.fn(),
}));

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserTemplates).mockResolvedValue([]);
});

describe('TrainingLogForm Set Deletion', () => {
    it('should not show delete button when there is only one set', () => {
        render(<TrainingLogForm />);
        const deleteButtons = screen.queryAllByLabelText('セットを削除');
        expect(deleteButtons).toHaveLength(0);
    });

    it('should show delete buttons when there are multiple sets', async () => {
        const user = userEvent.setup();
        render(<TrainingLogForm />);

        // Add a set
        await user.click(screen.getByText('セットを追加'));

        // Check if delete buttons appear
        const deleteButtons = screen.getAllByLabelText('セットを削除');
        expect(deleteButtons).toHaveLength(2);
    });

    it('should remove the set when delete button is clicked', async () => {
        const user = userEvent.setup();
        render(<TrainingLogForm />);

        // Add two sets to make it 3 total
        await user.click(screen.getByText('セットを追加'));
        await user.click(screen.getByText('セットを追加'));

        const deleteButtonsBefore = screen.getAllByLabelText('セットを削除');
        expect(deleteButtonsBefore).toHaveLength(3);

        // Delete the second set
        await user.click(deleteButtonsBefore[1]);

        // Should now have 2 sets
        const deleteButtonsAfter = screen.getAllByLabelText('セットを削除');
        expect(deleteButtonsAfter).toHaveLength(2);
    });

    it('should not allow deleting the last remaining set', async () => {
        const user = userEvent.setup();
        render(<TrainingLogForm />);

        // Add a set -> 2 sets
        await user.click(screen.getByText('セットを追加'));

        // Delete one set -> 1 set
        const deleteButtons = screen.getAllByLabelText('セットを削除');
        await user.click(deleteButtons[0]);

        // Check delete button is gone
        const remainingDeleteButtons = screen.queryAllByLabelText('セットを削除');
        expect(remainingDeleteButtons).toHaveLength(0);
    });
});

describe('TrainingLogForm Templates', () => {
    it('should display default templates', () => {
        render(<TrainingLogForm />);
        expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
        expect(screen.getByText('スクワット')).toBeInTheDocument();
    });

    it('should display user templates after loading', async () => {
        vi.mocked(getUserTemplates).mockResolvedValue([
            { id: 'tpl-1', name: 'デッドリフト', sets: [{ weight: 100, reps: 5 }], intervalSeconds: 180 },
            { id: 'tpl-2', name: 'ショルダープレス', sets: [{ weight: 30, reps: 10 }] },
        ]);

        render(<TrainingLogForm />);

        await waitFor(() => {
            expect(screen.getByText('デッドリフト')).toBeInTheDocument();
            expect(screen.getByText('ショルダープレス')).toBeInTheDocument();
        });
    });

    it('should call saveUserTemplate when save as template is clicked', async () => {
        vi.mocked(saveUserTemplate).mockResolvedValue({
            id: 'tpl-new',
            name: 'ベンチプレス',
            sets: [{ weight: 40, reps: 10 }],
            intervalSeconds: 90,
        });

        const user = userEvent.setup();
        render(<TrainingLogForm />);

        await user.click(screen.getByText('テンプレートとして保存'));

        await waitFor(() => {
            expect(saveUserTemplate).toHaveBeenCalledWith({
                name: 'ベンチプレス',
                sets: [{ weight: 40, reps: 10 }],
                intervalSeconds: 90,
            });
        });
    });

    it('should delete user template when delete button is clicked', async () => {
        vi.mocked(getUserTemplates).mockResolvedValue([
            { id: 'tpl-1', name: 'デッドリフト', sets: [{ weight: 100, reps: 5 }], intervalSeconds: 180 },
        ]);
        vi.mocked(deleteUserTemplate).mockResolvedValue();

        const user = userEvent.setup();
        render(<TrainingLogForm />);

        await waitFor(() => {
            expect(screen.getByText('デッドリフト')).toBeInTheDocument();
        });

        await user.click(screen.getByLabelText('デッドリフトテンプレートを削除'));

        await waitFor(() => {
            expect(deleteUserTemplate).toHaveBeenCalledWith('tpl-1');
            expect(screen.queryByText('デッドリフト')).not.toBeInTheDocument();
        });
    });
});
