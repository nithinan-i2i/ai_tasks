import { renderWithThemeProvider } from 'utils/test/test-utils';
import { screen } from '@testing-library/react';
import { mockCartProducts } from 'utils/test/mocks';

import { CartProvider } from 'contexts/cart-context';
import CartProducts from '.';

describe('[components] - CartProducts', () => {
  const setup = (props = {}) => {
    renderWithThemeProvider(
      <CartProvider>
        <CartProducts products={mockCartProducts} {...props} />
      </CartProvider>
    );
  };

  test('should render correctly', () => {
    setup();
    expect(screen.getByTestId('cart-products')).toBeInTheDocument();
  });

  test('should render call to action text when cart is empty', () => {
    setup({ products: [] });
    expect(screen.getByText(/Add some products in the cart/i)).toBeTruthy();
  });
});
