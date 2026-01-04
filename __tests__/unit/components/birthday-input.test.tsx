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
});
