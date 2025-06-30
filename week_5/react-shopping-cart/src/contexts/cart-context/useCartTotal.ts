import { useCartContext } from './CartContextProvider';
import { ICartProduct } from 'models';
import { useCallback, useMemo } from 'react';

const useCartTotal = () => {
  const { total, setTotal } = useCartContext();

  const updateCartTotal = useCallback((products: ICartProduct[]) => {
    // Use proper immutable reduce operations
    const productQuantity = products.reduce(
      (sum: number, product: ICartProduct) => sum + product.quantity,
      0
    );

    const totalPrice = products.reduce(
      (sum: number, product: ICartProduct) => sum + (product.price * product.quantity),
      0
    );

    const installments = products.reduce(
      (maxInstallments: number, product: ICartProduct) => 
        Math.max(maxInstallments, product.installments),
      0
    );

    const newTotal = {
      productQuantity,
      installments,
      totalPrice,
      currencyId: 'USD',
      currencyFormat: '$',
    };

    setTotal(newTotal);
  }, []);

  // Memoize the return object to prevent unnecessary re-renders
  const cartTotalApi = useMemo(() => ({
    total,
    updateCartTotal,
  }), [total, updateCartTotal]);

  return cartTotalApi;
};

export default useCartTotal;
