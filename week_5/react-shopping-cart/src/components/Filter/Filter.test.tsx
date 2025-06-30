import { renderWithThemeProvider } from 'utils/test/test-utils';
import { screen } from '@testing-library/react';
import { ProductsProvider } from 'contexts/products-context/';

import Filter from '.';
import { availableSizes } from './Filter';

describe('[components] - Filter', () => {
  const setup = () => {
    renderWithThemeProvider(
      <ProductsProvider>
        <Filter />
      </ProductsProvider>
    );
  };

  test('should render correctly', () => {
    setup();
    expect(screen.getByTestId('filter-component')).toBeInTheDocument();
  });

  test('should render every filter size avaliable', () => {
    setup();
    expect(availableSizes.every((size) => screen.getByText(size))).toBe(true);
  });
});
