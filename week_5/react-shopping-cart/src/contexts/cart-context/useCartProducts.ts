import { useCartContext } from './CartContextProvider';
import useCartTotal from './useCartTotal';
import { ICartProduct } from 'models';
import { useCallback, useMemo } from 'react';

const useCartProducts = () => {
  const { products, setProducts } = useCartContext();
  const { updateCartTotal } = useCartTotal();

  // Memoize the product IDs for efficient lookups
  const productIds = useMemo(() => 
    new Set(products.map(product => product.id)), 
    [products]
  );

  const updateQuantitySafely = useCallback((
    currentProduct: ICartProduct,
    targetProduct: ICartProduct,
    quantity: number
  ): ICartProduct => {
    if (currentProduct.id === targetProduct.id) {
      // Proper immutable update - create new object with spread operator
      return {
        ...currentProduct,
        quantity: Math.max(0, currentProduct.quantity + quantity), // Prevent negative quantities
      };
    }
    return currentProduct;
  }, []);

  const addProduct = useCallback((newProduct: ICartProduct) => {
    // Validate input
    if (!newProduct || newProduct.quantity <= 0) {
      console.warn('Invalid product or quantity provided to addProduct');
      return;
    }

    setProducts(prevProducts => {
      const existingProductIndex = prevProducts.findIndex(
        product => product.id === newProduct.id
      );

      let updatedProducts: ICartProduct[];

      if (existingProductIndex !== -1) {
        // Product exists - update quantity
        updatedProducts = prevProducts.map((product, index) => 
          index === existingProductIndex 
            ? { ...product, quantity: product.quantity + newProduct.quantity }
            : product
        );
      } else {
        // Product doesn't exist - add new product
        updatedProducts = [...prevProducts, newProduct];
      }

      // Update cart total with new products array
      updateCartTotal(updatedProducts);
      return updatedProducts;
    });
  }, [updateCartTotal]);

  const removeProduct = useCallback((productToRemove: ICartProduct) => {
    if (!productToRemove?.id) {
      console.warn('Invalid product provided to removeProduct');
      return;
    }

    setProducts(prevProducts => {
      const updatedProducts = prevProducts.filter(
        product => product.id !== productToRemove.id
      );
      
      updateCartTotal(updatedProducts);
      return updatedProducts;
    });
  }, [updateCartTotal]);

  const increaseProductQuantity = useCallback((productToIncrease: ICartProduct) => {
    if (!productToIncrease?.id) {
      console.warn('Invalid product provided to increaseProductQuantity');
      return;
    }

    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product => 
        product.id === productToIncrease.id
          ? { ...product, quantity: product.quantity + 1 }
          : product
      );
      
      updateCartTotal(updatedProducts);
      return updatedProducts;
    });
  }, [updateCartTotal]);

  const decreaseProductQuantity = useCallback((productToDecrease: ICartProduct) => {
    if (!productToDecrease?.id) {
      console.warn('Invalid product provided to decreaseProductQuantity');
      return;
    }

    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product => {
        if (product.id === productToDecrease.id) {
          const newQuantity = Math.max(0, product.quantity - 1);
          // Remove product if quantity becomes 0
          return newQuantity === 0 ? null : { ...product, quantity: newQuantity };
        }
        return product;
      }).filter(Boolean) as ICartProduct[]; // Remove null values
      
      updateCartTotal(updatedProducts);
      return updatedProducts;
    });
  }, [updateCartTotal]);

  // Memoize the return object to prevent unnecessary re-renders
  const cartProductsApi = useMemo(() => ({
    products,
    addProduct,
    removeProduct,
    increaseProductQuantity,
    decreaseProductQuantity,
  }), [products, addProduct, removeProduct, increaseProductQuantity, decreaseProductQuantity]);

  return cartProductsApi;
};

export default useCartProducts;
