import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MultipleSelectQuestion } from './MultipleSelectQuestion';
import type { Question } from '../../types/quiz';

describe('MultipleSelectQuestion', () => {
  const mockQuestion: Question = {
    id: 'q1',
    type: 'multiple-select',
    question: 'Which are React hooks?',
    options: ['useState', 'useEffect', 'useClass', 'useMemo'],
    difficulty: 'easy',
    maxPoints: 4,
    correctAnswer: -1
  };

  it('renders all options', () => {
    render(
      <MultipleSelectQuestion
        question={mockQuestion}
        selectedAnswers={[]}
        onToggleAnswer={() => {}}
      />
    );

    expect(screen.getByText(/useState/)).toBeInTheDocument();
    expect(screen.getByText(/useEffect/)).toBeInTheDocument();
    expect(screen.getByText(/useClass/)).toBeInTheDocument();
    expect(screen.getByText(/useMemo/)).toBeInTheDocument();
  });

  it('displays letter labels for unselected options', () => {
    render(
      <MultipleSelectQuestion
        question={mockQuestion}
        selectedAnswers={[]}
        onToggleAnswer={() => {}}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('A');
    expect(buttons[1]).toHaveTextContent('B');
    expect(buttons[2]).toHaveTextContent('C');
    expect(buttons[3]).toHaveTextContent('D');
  });

  it('displays checkmarks for selected options', () => {
    render(
      <MultipleSelectQuestion
        question={mockQuestion}
        selectedAnswers={[0, 2]}
        onToggleAnswer={() => {}}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('✓');
    expect(buttons[1]).toHaveTextContent('B');
    expect(buttons[2]).toHaveTextContent('✓');
    expect(buttons[3]).toHaveTextContent('D');
  });

  it('calls onToggleAnswer with correct index when clicked', async () => {
    const handleToggle = vi.fn();
    render(
      <MultipleSelectQuestion
        question={mockQuestion}
        selectedAnswers={[]}
        onToggleAnswer={handleToggle}
      />
    );

    const user = userEvent.setup();
    const firstOption = screen.getByText(/useState/);
    await user.click(firstOption);

    expect(handleToggle).toHaveBeenCalledWith(0);
  });

  it('renders nothing when options are undefined', () => {
    const questionWithoutOptions = { ...mockQuestion, options: undefined };
    const { container } = render(
      <MultipleSelectQuestion
        question={questionWithoutOptions}
        selectedAnswers={[]}
        onToggleAnswer={() => {}}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders empty container when options are empty array', () => {
    const questionWithEmptyOptions = { ...mockQuestion, options: [] };
    const { container } = render(
      <MultipleSelectQuestion
        question={questionWithEmptyOptions}
        selectedAnswers={[]}
        onToggleAnswer={() => {}}
      />
    );

    // No buttons rendered for empty options
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});
