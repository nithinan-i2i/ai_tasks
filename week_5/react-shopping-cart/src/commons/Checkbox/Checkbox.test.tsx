import { render, fireEvent, screen } from '@testing-library/react';

import Checkbox from '.';

const mockLabel = 'XL';
const mockHandleOnChange = jest.fn();

describe('[commons] - Checkbox', () => {
  const setup = () => {
    render(
      <Checkbox label={mockLabel} handleOnChange={mockHandleOnChange} />
    );
  };

  test('should render correctly with label and a checkmark', () => {
    setup();
    expect(screen.getByText(mockLabel)).toBeInTheDocument();
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
  });

  test('should toggle checked when clicked', () => {
    setup();
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(mockHandleOnChange).toBeCalledTimes(2);
  });
});
