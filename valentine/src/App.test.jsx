import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ValentineApp from './App';

function getNoButton() {
  const buttons = screen.getAllByRole('button');
  return buttons.find(btn => btn.className.includes('btn-no'));
}

describe('ValentineApp', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders the valentine question on load', () => {
    render(<ValentineApp />);
    expect(screen.getByText('Will you be my Valentine?')).toBeInTheDocument();
  });

  it('renders Yes and No buttons', () => {
    render(<ValentineApp />);
    expect(screen.getByRole('button', { name: /Yes/ })).toBeInTheDocument();
    expect(getNoButton()).toBeTruthy();
    expect(getNoButton()).toHaveTextContent('No');
  });

  it('shows success screen when Yes is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ValentineApp />);

    await user.click(screen.getByRole('button', { name: /Yes/ }));

    expect(screen.getByText('Yay!! I knew it!')).toBeInTheDocument();
    expect(screen.queryByText('Will you be my Valentine?')).not.toBeInTheDocument();
  });

  it('changes No button text when clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ValentineApp />);

    await user.click(getNoButton());

    expect(getNoButton()).toHaveTextContent('Are you sure? (本気？)');
  });

  it('grows the Yes button as No is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ValentineApp />);

    const yesButton = screen.getByRole('button', { name: /Yes/ });
    const initialFontSize = parseFloat(yesButton.style.fontSize);

    await user.click(getNoButton());

    const newFontSize = parseFloat(yesButton.style.fontSize);
    expect(newFontSize).toBeGreaterThan(initialFontSize);
  });

  it('shows hint text after more than 3 No clicks', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ValentineApp />);

    expect(screen.queryByText(/hint hint/)).not.toBeInTheDocument();

    for (let i = 0; i < 4; i++) {
      await user.click(getNoButton());
    }

    expect(screen.getByText(/hint hint/)).toBeInTheDocument();
  });

  it('displays the coupon card with all details after clicking Yes', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ValentineApp />);

    await user.click(screen.getByRole('button', { name: /Yes/ }));

    expect(screen.getByText('Valentine Gift')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('I-LOVE-YOU-9000')).toBeInTheDocument();
    expect(screen.getByText('VALID FOREVER')).toBeInTheDocument();
    expect(screen.getByText(/Redeemable anytime/)).toBeInTheDocument();
  });

  it('No button moves to a different position on each click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ValentineApp />);

    await user.click(getNoButton());
    const pos1 = getNoButton().style.left;

    // Click several times and collect positions
    const positions = new Set([pos1]);
    for (let i = 0; i < 5; i++) {
      await user.click(getNoButton());
      positions.add(getNoButton().style.left);
    }

    // Should have moved to at least 3 distinct horizontal positions
    expect(positions.size).toBeGreaterThanOrEqual(3);
  });

  it('cycles through all No phrases without wrapping back', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ValentineApp />);

    const phrases = [
      'No',
      'Are you sure? (本気？)',
      'Really sure? (진짜로?)',
      'Think again! (考え直して！)',
      'Last chance! (最後のチャンス！)',
      'Surely not? (まさか...)',
      'You might regret this! (後悔するよ！)',
      'Give it another thought!',
      'Are you absolutely certain?',
      'This could be a mistake!',
      'Have a heart! (心はないの？)',
      "Don't be so cold! (冷たくしないで！)",
      'Change of heart?',
      "Wouldn't you reconsider?",
      'Is that your final answer?',
      "You're breaking my heart ;(",
      'Pls? (お願い/제발)',
      'Pretty pls? (頼むよ〜)',
      "I'm gonna cry... (泣いちゃうよ)",
      'Ok, I\'m sad now (ㅠㅠ)',
    ];

    for (let i = 0; i < phrases.length - 1; i++) {
      expect(getNoButton()).toHaveTextContent(phrases[i]);
      await user.click(getNoButton());
    }

    // Should be on the last phrase now
    expect(getNoButton()).toHaveTextContent(phrases[phrases.length - 1]);
  });

  it('hides the No button after reaching the last phrase', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ValentineApp />);

    // Click No 19 times to reach the last phrase
    for (let i = 0; i < 19; i++) {
      await user.click(getNoButton());
    }

    // The last phrase should be showing
    expect(getNoButton()).toHaveTextContent("Ok, I'm sad now (ㅠㅠ)");

    // Advance timers past the fade delay (1200ms) and hide delay (2000ms)
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    // No button should be hidden
    expect(getNoButton()).toBeUndefined();
  });

  it('No button stays hidden even if clicked rapidly at the last phrase', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ValentineApp />);

    // Click No 19 times to reach the last phrase
    for (let i = 0; i < 19; i++) {
      await user.click(getNoButton());
    }

    // Click a few more times on the last phrase (this was the bug - it used to wrap)
    for (let i = 0; i < 5; i++) {
      await user.click(getNoButton());
    }

    // Should still be on the last phrase, not wrapped back to beginning
    expect(getNoButton()).toHaveTextContent("Ok, I'm sad now (ㅠㅠ)");

    // Advance timers to let the button hide
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    // No button should be gone
    expect(getNoButton()).toBeUndefined();
  });
});
