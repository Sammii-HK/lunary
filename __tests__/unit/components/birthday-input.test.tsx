import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BirthdayInput } from '@/components/ui/birthday-input';

const setNavigatorLanguage = (language: string) => {
  Object.defineProperty(navigator, 'language', {
    value: language,
    configurable: true,
  });
};

describe('BirthdayInput', () => {
  it('parses MDY input for US locales', async () => {
    setNavigatorLanguage('en-US');
    const handleChange = jest.fn();
    render(<BirthdayInput value='' onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '09061993');
    fireEvent.blur(input);

    expect(handleChange).toHaveBeenLastCalledWith('1993-09-06');
    expect((input as HTMLInputElement).value).toBe('09/06/1993');
  });

  it('parses DMY input for UK locales', async () => {
    setNavigatorLanguage('en-GB');
    const handleChange = jest.fn();
    render(<BirthdayInput value='' onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '06091993');
    fireEvent.blur(input);

    expect(handleChange).toHaveBeenLastCalledWith('1993-09-06');
    expect((input as HTMLInputElement).value).toBe('06/09/1993');
  });

  it('shows warning for age under 16 on input', async () => {
    setNavigatorLanguage('en-US');
    const handleChange = jest.fn();
    render(<BirthdayInput value='' onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    // Type a date that makes the user 14 years old
    const now = new Date();
    const birthYear = now.getFullYear() - 14;
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    await userEvent.type(input, `${month}${day}${birthYear}`);

    expect(
      screen.getByText('You must be at least 16 to use Lunary.'),
    ).toBeInTheDocument();
  });

  it('shows warning for age under 16 on blur', async () => {
    setNavigatorLanguage('en-GB');
    const handleChange = jest.fn();
    render(<BirthdayInput value='' onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    // Type a date that makes the user 15 (DMY format)
    const now = new Date();
    const birthYear = now.getFullYear() - 15;
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    await userEvent.type(input, `${day}${month}${birthYear}`);
    fireEvent.blur(input);

    expect(
      screen.getByText('You must be at least 16 to use Lunary.'),
    ).toBeInTheDocument();
  });

  it('does not show warning for age 16 or older', async () => {
    setNavigatorLanguage('en-US');
    const handleChange = jest.fn();
    render(<BirthdayInput value='' onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '01011990');
    fireEvent.blur(input);

    expect(
      screen.queryByText('You must be at least 16 to use Lunary.'),
    ).not.toBeInTheDocument();
  });
});
