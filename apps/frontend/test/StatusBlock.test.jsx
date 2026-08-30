import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusBlock from '../src/components/UI/StatusBlock/StatusBlock';

describe('StatusBlock', () => {
  it('shows the default error copy and a retry action', async () => {
    const onAction = vi.fn();
    render(<StatusBlock kind="error" onAction={onAction} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Повторить' });
    await userEvent.click(button);
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('renders a custom empty state without an action when no handler is given', () => {
    render(<StatusBlock kind="empty" title="Список пуст" message="Добавьте элемент" />);
    expect(screen.getByText('Список пуст')).toBeInTheDocument();
    expect(screen.getByText('Добавьте элемент')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
