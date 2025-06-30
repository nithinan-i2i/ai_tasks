# Performance Optimization Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the performance optimizations applied to the `useProducts` hook in the React shopping cart application.

## Prerequisites

- React 16.8+ (for hooks support)
- TypeScript 4.0+
- Understanding of React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`)

## Step-by-Step Implementation

### Step 1: Analyze Current Performance

Before implementing optimizations, measure the current performance:

```typescript
// Add performance monitoring to existing code
const filterProducts = (filters: string[]) => {
  const startTime = performance.now();
  
  setIsFetching(true);
  getProducts().then((products: IProduct[]) => {
    setIsFetching(false);
    let filteredProducts;

    if (filters && filters.length > 0) {
      filteredProducts = products.filter((p: IProduct) =>
        filters.find((filter: string) =>
          p.availableSizes.find((size: string) => size === filter)
        )
      );
    } else {
      filteredProducts = products;
    }

    setFilters(filters);
    setProducts(filteredProducts);
    
    const duration = performance.now() - startTime;
    console.log(`Filtering took: ${duration.toFixed(2)}ms`);
  });
};
```

### Step 2: Create Performance Monitoring Utility

```typescript
// utils/performanceMonitor.ts
export const performanceMonitor = {
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
```

### Step 3: Implement Data Structure Optimization

Create a size index for O(1) lookups:

```typescript
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
```

### Step 4: Implement Caching Strategy

Add refs to cache data:

```typescript
const useProducts = () => {
  // ... existing context usage ...

  // Cache for all products (never filtered)
  const allProductsRef = useRef<IProduct[]>([]);
  const sizeIndexRef = useRef<Map<string, Set<number>>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // ... rest of implementation
};
```

### Step 5: Implement Optimized Filtering Algorithm

Replace the O(n³) algorithm with O(n) Set-based intersection:

```typescript
const filteredProducts = useMemo(() => {
  const timer = performanceMonitor.start('Filtering Products');
  
  if (!filters || filters.length === 0) {
    performanceMonitor.end(timer);
    return allProductsRef.current;
  }

  // Use Set-based intersection for O(n) complexity
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
}, [filters, allProductsRef.current.length]);
```

### Step 6: Optimize Fetch Function

Add proper cleanup and caching:

```typescript
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
```

### Step 7: Optimize Filter Function

Remove network calls and use cached data:

```typescript
const filterProducts = useCallback((newFilters: string[]) => {
  const timer = performanceMonitor.start('Apply Filters');
  
  // Update filters only - filtering happens in useMemo
  setFilters(newFilters);
  
  performanceMonitor.end(timer);
}, [setFilters]);
```

### Step 8: Add Cleanup

Implement proper cleanup for async operations:

```typescript
useEffect(() => {
  return () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };
}, []);
```

### Step 9: Memoize Return Object

Prevent unnecessary re-renders:

```typescript
const productsApi = useMemo(() => ({
  isFetching,
  fetchProducts,
  products: filteredProducts,
  filterProducts,
  filters,
  totalProducts: allProductsRef.current.length,
}), [isFetching, fetchProducts, filteredProducts, filterProducts, filters]);

return productsApi;
```

## Complete Implementation

Here's the complete optimized hook:

```typescript
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

    // Use Set-based intersection for O(n) complexity
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
  }, [filters, allProductsRef.current.length]);

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
    products: filteredProducts,
    filterProducts,
    filters,
    totalProducts: allProductsRef.current.length,
  }), [isFetching, fetchProducts, filteredProducts, filterProducts, filters]);

  return productsApi;
};

export default useProducts;
```

## Testing the Implementation

### 1. Performance Testing

```typescript
// Test with large datasets
const testPerformance = () => {
  const largeProductSet = generateLargeProductSet(10000);
  const filters = ['M', 'L', 'XL'];
  
  const startTime = performance.now();
  // Apply filtering
  const endTime = performance.now();
  
  console.log(`Filtering 10,000 products took: ${endTime - startTime}ms`);
};
```

### 2. Memory Testing

```typescript
// Monitor memory usage
const testMemoryUsage = () => {
  const initialMemory = performance.memory?.usedJSHeapSize || 0;
  
  // Perform filtering operations
  
  const finalMemory = performance.memory?.usedJSHeapSize || 0;
  console.log(`Memory usage: ${(finalMemory - initialMemory) / 1024}KB`);
};
```

### 3. Integration Testing

```typescript
// Test in component
const TestComponent = () => {
  const { products, filterProducts } = useProducts();
  
  useEffect(() => {
    // Test multiple filter operations
    filterProducts(['M']);
    setTimeout(() => filterProducts(['M', 'L']), 100);
    setTimeout(() => filterProducts(['M', 'L', 'XL']), 200);
  }, [filterProducts]);
  
  return <div>Products: {products.length}</div>;
};
```

## Common Pitfalls and Solutions

### 1. Dependency Array Issues

**Problem**: Missing dependencies in useMemo/useCallback
**Solution**: Carefully review dependencies and use ESLint rules

```typescript
// ❌ Wrong
const filteredProducts = useMemo(() => {
  // filtering logic
}, [filters]); // Missing allProductsRef.current.length

// ✅ Correct
const filteredProducts = useMemo(() => {
  // filtering logic
}, [filters, allProductsRef.current.length]);
```

### 2. Memory Leaks

**Problem**: Uncleaned async operations
**Solution**: Always use AbortController

```typescript
// ❌ Wrong
const fetchProducts = () => {
  getProducts().then(products => {
    setProducts(products); // May cause memory leak if component unmounts
  });
};

// ✅ Correct
const fetchProducts = useCallback(() => {
  const controller = new AbortController();
  getProducts().then(products => {
    if (!controller.signal.aborted) {
      setProducts(products);
    }
  });
  return () => controller.abort();
}, []);
```

### 3. Unnecessary Re-renders

**Problem**: Non-memoized return objects
**Solution**: Use useMemo for return objects

```typescript
// ❌ Wrong
return {
  products,
  filterProducts,
  // ... other properties
}; // New object on every render

// ✅ Correct
const api = useMemo(() => ({
  products,
  filterProducts,
  // ... other properties
}), [products, filterProducts]);

return api;
```

## Performance Monitoring in Production

### 1. Add Production Monitoring

```typescript
const performanceMonitor = {
  start: (operation: string) => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      return { operation, startTime };
    }
    return null;
  },
  end: (timer: any) => {
    if (timer && process.env.NODE_ENV === 'development') {
      const duration = performance.now() - timer.startTime;
      console.log(`⏱️ ${timer.operation}: ${duration.toFixed(2)}ms`);
    }
  }
};
```

### 2. Add Error Boundaries

```typescript
class PerformanceErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Performance optimization error:', error, errorInfo);
    // Send to monitoring service
  }
  
  render() {
    return this.props.children;
  }
}
```

## Conclusion

This implementation guide provides a comprehensive approach to optimizing React hooks for performance. The key principles are:

1. **Measure first** - Always benchmark before and after
2. **Use appropriate data structures** - Sets and Maps for efficient operations
3. **Implement proper memoization** - useMemo and useCallback strategically
4. **Manage memory** - Clean up async operations and cache efficiently
5. **Monitor performance** - Track metrics in development and production

Following this guide will help you achieve significant performance improvements while maintaining code quality and readability. 