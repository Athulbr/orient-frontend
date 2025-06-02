import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropdownMenu } from '../DropdownMenu';

describe('DropdownMenu', () => {
  const mockOnChange = vi.fn();
  const options = ['Option 1', 'Option 2', 'Option 3'];
  const triggerText = 'Open Menu';

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children as trigger', () => {
    render(
      <DropdownMenu options={options} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    const trigger = screen.getByText(triggerText);
    expect(trigger).toBeInTheDocument();
  });

  it('does not show options initially', () => {
    render(
      <DropdownMenu options={options} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    options.forEach(option => {
      expect(screen.queryByText(option)).not.toBeInTheDocument();
    });
  });

  it('shows options when trigger is clicked', async () => {
    render(
      <DropdownMenu options={options} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      options.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });
  });

  it('hides options when trigger is clicked again', async () => {
    render(
      <DropdownMenu options={options} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button');

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  it('calls onChange when option is selected', async () => {
    render(
      <DropdownMenu options={options} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    const option = screen.getByText('Option 1');
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledWith('Option 1');
  });

  it('closes dropdown after option selection', async () => {
    render(
      <DropdownMenu options={options} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    const option = screen.getByText('Option 1');
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <DropdownMenu options={options} onChange={mockOnChange}>
          <span>{triggerText}</span>
        </DropdownMenu>
        <div data-testid="outside">Outside element</div>
      </div>
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    const outsideElement = screen.getByTestId('outside');
    fireEvent.mouseDown(outsideElement);

    await waitFor(() => {
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  it('does not close dropdown when clicking inside', async () => {
    render(
      <DropdownMenu options={options} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    const dropdownMenu = screen.getByRole('menu');
    fireEvent.mouseDown(dropdownMenu);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('opens dropdown with Enter key', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu options={options} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button');
    trigger.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  it('opens dropdown with Space key', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu options={options} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button');
    trigger.focus();
    await user.keyboard(' ');

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  it('closes dropdown with Escape key', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu options={options} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  it('has correct accessibility attributes when closed', () => {
    render(
      <DropdownMenu options={options} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).toHaveAttribute('tabIndex', '0');
  });

  it('has correct accessibility attributes when open', async () => {
    render(
      <DropdownMenu options={options} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(options.length);
  });

  it('renders all options correctly', async () => {
    render(
      <DropdownMenu options={options} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      options.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(options.length);
  });

  it('handles empty options array', () => {
    render(
      <DropdownMenu options={[]} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();

    const menuItems = screen.queryAllByRole('menuitem');
    expect(menuItems).toHaveLength(0);
  });

  it('handles duplicate options', async () => {
    const duplicateOptions = ['Option 1', 'Option 1', 'Option 2'];
    render(
      <DropdownMenu options={duplicateOptions} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(3);
    });

    const firstOption = screen.getAllByText('Option 1')[0];
    fireEvent.click(firstOption);

    expect(mockOnChange).toHaveBeenCalledWith('Option 1');
  });

  //   it('prevents default behavior on Enter and Space keys', async () => {
  //     const user = userEvent.setup();
  //     render(
  //       <DropdownMenu options={options} onChange={mockOnChange}>
  //         <span>{triggerText}</span>
  //       </DropdownMenu>
  //     );

  //     const trigger = screen.getByRole('button');
  //     trigger.focus();

  //     const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
  //     const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });

  //     const preventDefaultSpy = vi.spyOn(enterEvent, 'preventDefault');
  //     fireEvent.keyDown(trigger, enterEvent);
  //     expect(preventDefaultSpy).toHaveBeenCalled();

  //     const preventDefaultSpySpc = vi.spyOn(spaceEvent, 'preventDefault');
  //     fireEvent.keyDown(trigger, spaceEvent);
  //     expect(preventDefaultSpySpc).toHaveBeenCalled();
  //   });

  it('removes event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = render(
      <DropdownMenu options={options} onChange={mockOnChange}>
        <span>{triggerText}</span>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});
