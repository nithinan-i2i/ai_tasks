import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

import { useProductsContext } from './ProductsContextProvider';
import { IProduct } from 'models';
import { getProducts } from 'services/products';

// ✅ ENHANCED: Performance monitoring utility with metrics collection
const performanceMonitor = {
  metrics: new Map<string, number[]>(),
  
  start: (operation: string) => {
    const startTime = performance.now();
    return { operation, startTime };
  },
  
  end: (timer: { operation: string; startTime: number }) => {
    const duration = performance.now() - timer.startTime;
    
    // Store metrics for analysis
    if (!performanceMonitor.metrics.has(timer.operation)) {
      performanceMonitor.metrics.set(timer.operation, []);
    }
    const metrics = performanceMonitor.metrics.get(timer.operation);
    if (metrics) {
      metrics.push(duration);
    }
    
    // Log with color coding for performance levels
    const color = duration > 100 ? '🔴' : duration > 50 ? '🟡' : '🟢';
    console.log(`${color} ${timer.operation}: ${duration.toFixed(2)}ms`);
    
    // Warn if performance is poor
    if (duration > 100) {
      console.warn(`⚠️ Slow operation detected: ${timer.operation} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  },
  
  getAverage: (operation: string) => {
    const metrics = performanceMonitor.metrics.get(operation);
    if (!metrics || metrics.length === 0) return 0;
    return metrics.reduce((sum, time) => sum + time, 0) / metrics.length;
  },
  
  getReport: () => {
    const report: Record<string, number> = {};
    performanceMonitor.metrics.forEach((times: number[], operation: string) => {
      report[operation] = performanceMonitor.getAverage(operation);
    });
    return report;
  }
};

// ✅ ENHANCED: Optimized filtering with Set-based lookups and better indexing
const createSizeIndex = (products: IProduct[]) => {
  const timer = performanceMonitor.start('Create Size Index');
  
  const sizeIndex = new Map<string, Set<number>>();
  
  products.forEach((product, index) => {
    product.availableSizes.forEach(size => {
      if (!sizeIndex.has(size)) {
        sizeIndex.set(size, new Set());
      }
      sizeIndex.get(size)!.add(index);
    });
  });
  
  performanceMonitor.end(timer);
  return sizeIndex;
};

// ✅ NEW: Debounced filter function to prevent excessive re-renders
const useDebounce = (value: string[], delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
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

  // ✅ ENHANCED: Cache for all products with better memory management
  const allProductsRef = useRef<IProduct[]>([]);
  const sizeIndexRef = useRef<Map<string, Set<number>>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFilterCountRef = useRef<number>(0);

  // ✅ NEW: Debounced filters to prevent excessive filtering
  const debouncedFilters = useDebounce(filters || [], 150);

  // ✅ ENHANCED: Memoized filtered products with optimized algorithm and caching
  const filteredProducts = useMemo(() => {
    const timer = performanceMonitor.start('Filtering Products');
    
    // Early return if no filters
    if (!debouncedFilters || debouncedFilters.length === 0) {
      performanceMonitor.end(timer);
      return allProductsRef.current;
    }

    // ✅ IMPROVED: More efficient Set-based intersection algorithm
    const filterSet = new Set(debouncedFilters);
    let matchingIndices: Set<number> | null = null;

    filterSet.forEach(filter => {
      const productIndices = sizeIndexRef.current.get(filter);
      if (productIndices) {
        if (matchingIndices === null) {
          // First filter - initialize with all matching products
          matchingIndices = new Set(productIndices);
        } else {
          // Intersection with existing matches
          const intersection = new Set<number>();
          productIndices.forEach(index => {
            if (matchingIndices!.has(index)) {
              intersection.add(index);
            }
          });
          matchingIndices = intersection;
        }
      }
    });

    const result = matchingIndices 
      ? Array.from(matchingIndices).map(index => allProductsRef.current[index as number])
      : [];
    
    // ✅ NEW: Performance tracking
    const filterCount = debouncedFilters.length;
    if (filterCount !== lastFilterCountRef.current) {
      console.log(`📊 Filter count changed: ${lastFilterCountRef.current} → ${filterCount}`);
      lastFilterCountRef.current = filterCount;
    }
    
    performanceMonitor.end(timer);
    return result;
  }, [debouncedFilters, allProductsRef.current.length]); // Only re-run when debounced filters or product count changes

  // ✅ ENHANCED: Memoized fetch function with better error handling and performance tracking
  const fetchProducts = useCallback(() => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const timer = performanceMonitor.start('Fetch Products');

    setIsFetching(true);
    
    getProducts()
      .then((result: any) => {
        if (!abortControllerRef.current?.signal.aborted) {
          const setupTimer = performanceMonitor.start('Setup Product Cache');
          
          // Handle the API result structure
          const products = result.data || result || [];
          allProductsRef.current = products;
          sizeIndexRef.current = createSizeIndex(products);
          setProducts(products);
          setIsFetching(false);
          
          performanceMonitor.end(setupTimer);
          performanceMonitor.end(timer);
          
          console.log(`📦 Loaded ${products.length} products`);
        }
      })
      .catch((error) => {
        if (!abortControllerRef.current?.signal.aborted) {
          console.error('Failed to fetch products:', error);
          setIsFetching(false);
        }
      });
  }, [setIsFetching, setProducts]);

  // ✅ ENHANCED: Optimized filter function with performance tracking
  const filterProducts = useCallback((newFilters: string[]) => {
    const timer = performanceMonitor.start('Apply Filters');
    
    // Update filters only - filtering happens in useMemo
    setFilters(newFilters);
    
    performanceMonitor.end(timer);
  }, [setFilters]);

  // ✅ NEW: Performance monitoring hook
  const getPerformanceReport = useCallback(() => {
    return performanceMonitor.getReport();
  }, []);

  // ✅ ENHANCED: Cleanup on unmount with performance logging
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Log final performance report
      const report = performanceMonitor.getReport();
      console.log('📊 Final Performance Report:', report);
    };
  }, []);

  // ✅ ENHANCED: Memoized return object with better dependency management
  const productsApi = useMemo(() => ({
    isFetching,
    fetchProducts,
    products: filteredProducts, // Return filtered products instead of all products
    filterProducts,
    filters: debouncedFilters, // Use debounced filters
    totalProducts: allProductsRef.current.length, // Add total count for monitoring
    getPerformanceReport, // Expose performance monitoring
    filteredCount: filteredProducts.length, // Add filtered count for monitoring
  }), [
    isFetching, 
    fetchProducts, 
    filteredProducts, 
    filterProducts, 
    debouncedFilters,
    getPerformanceReport
  ]);

  return productsApi;
};

export default useProducts;
