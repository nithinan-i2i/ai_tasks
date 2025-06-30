import { useCartContext } from './CartContextProvider';
import useCartTotal from './useCartTotal';
import { ICartProduct } from 'models';
import { useCallback, useMemo } from 'react';

const useCartProducts = () => {
  const { products, setProducts } = useCartContext();
  const { updateCartTotal } = useCartTotal();

  // ✅ FIXED: Add null safety for products array
  const productIds = useMemo(() => 
    new Set((products || []).map(product => product.id)), 
    [products]
  );

  // ✅ IMPROVED: More efficient product lookup with Map
  const productMap = useMemo(() => {
    const map = new Map<number, ICartProduct>();
    (products || []).forEach(product => {
      map.set(product.id, product);
    });
    return map;
  }, [products]);

  // ✅ IMPROVED: Better immutable update utility
  const updateQuantitySafely = useCallback((
    currentProduct: ICartProduct,
    targetProduct: ICartProduct,
    quantity: number
  ): ICartProduct => {
    if (currentProduct.id === targetProduct.id) {
      const newQuantity = Math.max(0, currentProduct.quantity + quantity);
      return {
        ...currentProduct,
        quantity: newQuantity,
      };
    }
    return currentProduct;
  }, []);

  // ✅ IMPROVED: Better input validation and error handling
  const addProduct = useCallback((newProduct: ICartProduct) => {
    // Enhanced validation
    if (!newProduct || typeof newProduct !== 'object') {
      console.warn('Invalid product provided to addProduct: product is null/undefined or not an object');
      return;
    }

    if (!newProduct.id || typeof newProduct.id !== 'number') {
      console.warn('Invalid product provided to addProduct: missing or invalid product ID');
      return;
    }

    if (!newProduct.quantity || newProduct.quantity <= 0) {
      console.warn('Invalid product provided to addProduct: quantity must be greater than 0');
      return;
    }

    const currentProducts = products || [];
    const existingProductIndex = currentProducts.findIndex(
      product => product.id === newProduct.id
    );

    let updatedProducts: ICartProduct[];

    if (existingProductIndex !== -1) {
      // ✅ IMPROVED: More efficient immutable update
      updatedProducts = currentProducts.map((product, index) => 
        index === existingProductIndex 
          ? { ...product, quantity: product.quantity + newProduct.quantity }
          : product
      );
    } else {
      // ✅ IMPROVED: Ensure new product is properly structured
      const validatedProduct: ICartProduct = {
        ...newProduct,
        quantity: Math.max(1, newProduct.quantity), // Ensure minimum quantity
      };
      updatedProducts = [...currentProducts, validatedProduct];
    }

    updateCartTotal(updatedProducts);
    setProducts(updatedProducts);
  }, [products, setProducts, updateCartTotal]);

  // ✅ IMPROVED: Better error handling and validation
  const removeProduct = useCallback((productToRemove: ICartProduct) => {
    if (!productToRemove?.id) {
      console.warn('Invalid product provided to removeProduct: missing product ID');
      return;
    }

    const currentProducts = products || [];
    const updatedProducts = currentProducts.filter(
      product => product.id !== productToRemove.id
    );
    updateCartTotal(updatedProducts);
    setProducts(updatedProducts);
  }, [products, setProducts, updateCartTotal]);

  // ✅ IMPROVED: Better validation and error handling
  const increaseProductQuantity = useCallback((productToIncrease: ICartProduct) => {
    if (!productToIncrease?.id) {
      console.warn('Invalid product provided to increaseProductQuantity: missing product ID');
      return;
    }

    const currentProducts = products || [];
    const updatedProducts = currentProducts.map(product => 
      product.id === productToIncrease.id
        ? { ...product, quantity: product.quantity + 1 }
        : product
    );
    updateCartTotal(updatedProducts);
    setProducts(updatedProducts);
  }, [products, setProducts, updateCartTotal]);

  // ✅ IMPROVED: Better validation and automatic removal when quantity reaches 0
  const decreaseProductQuantity = useCallback((productToDecrease: ICartProduct) => {
    if (!productToDecrease?.id) {
      console.warn('Invalid product provided to decreaseProductQuantity: missing product ID');
      return;
    }

    const currentProducts = products || [];
    const updatedProducts = currentProducts.map(product => {
      if (product.id === productToDecrease.id) {
        const newQuantity = Math.max(0, product.quantity - 1);
        // Remove product if quantity becomes 0
        return newQuantity === 0 ? null : { ...product, quantity: newQuantity };
      }
      return product;
    }).filter(Boolean) as ICartProduct[]; // Remove null values
    updateCartTotal(updatedProducts);
    setProducts(updatedProducts);
  }, [products, setProducts, updateCartTotal]);

  // ✅ IMPROVED: Better memoization with proper dependencies
  const cartProductsApi = useMemo(() => ({
    products: products || [], // Ensure we never return undefined
    addProduct,
    removeProduct,
    increaseProductQuantity,
    decreaseProductQuantity,
    productIds, // Expose for testing/debugging
    productMap, // Expose for testing/debugging
  }), [
    products, 
    addProduct, 
    removeProduct, 
    increaseProductQuantity, 
    decreaseProductQuantity,
    productIds,
    productMap
  ]);

  return cartProductsApi;
};

export default useCartProducts;
