import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrainingLogForm from './TrainingLogForm';
import { vi, describe, it, expect } from 'vitest';

// Mock the storage utility
vi.mock('../../lib/storage', () => ({
    saveTrainingLog: vi.fn(),
}));

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
