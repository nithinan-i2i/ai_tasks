import { useCallback, useMemo, useRef, useEffect } from 'react';

import { useProductsContext } from './ProductsContextProvider';
import { IProduct } from 'models';
import { getProducts } from 'services/products';

// Performance monitoring utility
const performanceMonitor = {
  start: (operation: string) => {
    const startTime = performance.now();
    return { operation, startTime };
  },
  end: (timer: { operation: string; startTime: number }) => {
    const duration = performance.now() - timer.startTime;
    console.log(`⏱️ ${timer.operation}: ${duration.toFixed(2)}ms`);
    return duration;
  }
};

// Optimized filtering with Set-based lookups
const createSizeIndex = (products: IProduct[]) => {
  const sizeIndex = new Map<string, Set<number>>();
  
  products.forEach((product, index) => {
    product.availableSizes.forEach(size => {
      if (!sizeIndex.has(size)) {
        sizeIndex.set(size, new Set());
      }
      sizeIndex.get(size)!.add(index);
    });
  });
  
  return sizeIndex;
};

const useProducts = () => {
  const {
    isFetching,
    setIsFetching,
    products,
    setProducts,
    filters,
    setFilters,
  } = useProductsContext();

  // Cache for all products (never filtered)
  const allProductsRef = useRef<IProduct[]>([]);
  const sizeIndexRef = useRef<Map<string, Set<number>>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoized filtered products with optimized algorithm
  const filteredProducts = useMemo(() => {
    const timer = performanceMonitor.start('Filtering Products');
    
    if (!filters || filters.length === 0) {
      performanceMonitor.end(timer);
      return allProductsRef.current;
    }

    // Use Set-based intersection for O(n) complexity instead of O(n³)
    const filterSet = new Set(filters);
    const matchingIndices = new Set<number>();
    let isFirstFilter = true;

    filterSet.forEach(filter => {
      const productIndices = sizeIndexRef.current.get(filter);
      if (productIndices) {
        if (isFirstFilter) {
          productIndices.forEach(index => matchingIndices.add(index));
          isFirstFilter = false;
        } else {
          // Intersection of matching products
          const currentMatches = new Set(matchingIndices);
          matchingIndices.clear();
          currentMatches.forEach(index => {
            if (productIndices.has(index)) {
              matchingIndices.add(index);
            }
          });
        }
      }
    });

    const result = Array.from(matchingIndices).map(index => allProductsRef.current[index]);
    
    performanceMonitor.end(timer);
    return result;
  }, [filters, allProductsRef.current.length]); // Only re-run when filters or product count changes

  // Memoized fetch function with proper cleanup
  const fetchProducts = useCallback(() => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const timer = performanceMonitor.start('Fetch Products');

    setIsFetching(true);
    
    getProducts()
      .then((products: IProduct[]) => {
        if (!abortControllerRef.current?.signal.aborted) {
          allProductsRef.current = products;
          sizeIndexRef.current = createSizeIndex(products);
          setProducts(products);
          setIsFetching(false);
          performanceMonitor.end(timer);
        }
      })
      .catch((error) => {
        if (!abortControllerRef.current?.signal.aborted) {
          console.error('Failed to fetch products:', error);
          setIsFetching(false);
        }
      });
  }, [setIsFetching, setProducts]);

  // Optimized filter function - no network calls, uses cached data
  const filterProducts = useCallback((newFilters: string[]) => {
    const timer = performanceMonitor.start('Apply Filters');
    
    // Update filters only - filtering happens in useMemo
    setFilters(newFilters);
    
    performanceMonitor.end(timer);
  }, [setFilters]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoized return object to prevent unnecessary re-renders
  const productsApi = useMemo(() => ({
    isFetching,
    fetchProducts,
    products: filteredProducts, // Return filtered products instead of all products
    filterProducts,
    filters,
    totalProducts: allProductsRef.current.length, // Add total count for monitoring
  }), [isFetching, fetchProducts, filteredProducts, filterProducts, filters]);

  return productsApi;
};

export default useProducts;
