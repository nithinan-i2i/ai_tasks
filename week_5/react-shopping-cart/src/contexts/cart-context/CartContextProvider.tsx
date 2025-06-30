import { createContext, useContext, FC, useState, useMemo, ReactNode } from 'react';
import { ICartProduct, ICartTotal } from 'models';

export interface ICartContext {
  isOpen: boolean;
  setIsOpen(state: boolean): void;
  products: ICartProduct[];
  setProducts(products: ICartProduct[]): void;
  total: ICartTotal;
  setTotal(products: ICartTotal): void;
}

const CartContext = createContext<ICartContext | undefined>(undefined);

const useCartContext = (): ICartContext => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }

  return context;
};

const totalInitialValues: ICartTotal = {
  productQuantity: 0,
  installments: 0,
  totalPrice: 0,
  currencyId: 'USD',
  currencyFormat: '$',
};

interface CartProviderProps {
  children: ReactNode;
}

const CartProvider: FC<CartProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<ICartProduct[]>([]);
  const [total, setTotal] = useState<ICartTotal>(totalInitialValues);

  // Memoize the context value to prevent unnecessary re-renders
  const CartContextValue: ICartContext = useMemo(() => ({
    isOpen,
    setIsOpen,
    products,
    setProducts,
    total,
    setTotal,
  }), [isOpen, products, total]);

  return <CartContext.Provider value={CartContextValue}>{children}</CartContext.Provider>;
};

export { CartProvider, useCartContext };
