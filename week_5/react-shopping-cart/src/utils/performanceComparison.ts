import { useState, useCallback } from 'react';

// ✅ NEW: Performance Comparison Utility
// This utility demonstrates the performance improvements by simulating the old vs new filtering algorithms

export interface PerformanceComparison {
  oldAlgorithm: number;
  newAlgorithm: number;
  improvement: number;
  improvementPercentage: number;
}

export interface Product {
  id: number;
  availableSizes: string[];
  [key: string]: any;
}

// Simulate the old O(n³) filtering algorithm
export const simulateOldFiltering = (products: Product[], filters: string[]): number => {
  const startTime = performance.now();
  
  const filtered = products.filter(product => {
    return filters.every(filter => 
      product.availableSizes.includes(filter)
    );
  });
  
  const endTime = performance.now();
  return endTime - startTime;
};

// Simulate the new O(n) filtering algorithm
export const simulateNewFiltering = (products: Product[], filters: string[]): number => {
  const startTime = performance.now();
  
  // Create size index
  const sizeIndex = new Map<string, Set<number>>();
  products.forEach((product, index) => {
    product.availableSizes.forEach(size => {
      if (!sizeIndex.has(size)) {
        sizeIndex.set(size, new Set());
      }
      sizeIndex.get(size)!.add(index);
    });
  });
  
  // Set-based intersection
  const filterSet = new Set(filters);
  let matchingIndices: Set<number> | null = null;

  filterSet.forEach(filter => {
    const productIndices = sizeIndex.get(filter);
    if (productIndices) {
      if (matchingIndices === null) {
        matchingIndices = new Set(productIndices);
      } else {
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
    ? Array.from(matchingIndices).map(index => products[index as number])
    : [];
  
  const endTime = performance.now();
  return endTime - startTime;
};

// Run performance comparison
export const runPerformanceComparison = (
  products: Product[], 
  filters: string[]
): PerformanceComparison => {
  // Run multiple iterations for more accurate results
  const iterations = 10;
  
  let oldTotal = 0;
  let newTotal = 0;
  
  for (let i = 0; i < iterations; i++) {
    oldTotal += simulateOldFiltering(products, filters);
    newTotal += simulateNewFiltering(products, filters);
  }
  
  const oldAverage = oldTotal / iterations;
  const newAverage = newTotal / iterations;
  const improvement = oldAverage - newAverage;
  const improvementPercentage = (improvement / oldAverage) * 100;
  
  return {
    oldAlgorithm: oldAverage,
    newAlgorithm: newAverage,
    improvement,
    improvementPercentage
  };
};

// Generate performance report with different scenarios
export const generatePerformanceReport = (products: Product[]) => {
  const scenarios = [
    { name: 'Single Filter', filters: ['M'] },
    { name: 'Multiple Filters', filters: ['M', 'L', 'XL'] },
    { name: 'No Filters', filters: [] },
    { name: 'Many Filters', filters: ['XS', 'S', 'M', 'ML', 'L', 'XL', 'XXL'] }
  ];
  
  const report = scenarios.map(scenario => ({
    scenario: scenario.name,
    productCount: products.length,
    filterCount: scenario.filters.length,
    ...runPerformanceComparison(products, scenario.filters)
  }));
  
  return report;
};

// Performance monitoring hook for real-time comparison
export const usePerformanceComparison = (products: Product[], filters: string[]) => {
  const [comparison, setComparison] = useState<PerformanceComparison | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runComparison = useCallback(() => {
    if (products.length === 0) return;
    
    setIsRunning(true);
    
    // Run comparison in next tick to avoid blocking UI
    setTimeout(() => {
      const result = runPerformanceComparison(products, filters);
      setComparison(result);
      setIsRunning(false);
    }, 0);
  }, [products, filters]);

  return {
    comparison,
    isRunning,
    runComparison
  };
};

// Performance visualization utilities
export const getPerformanceStatus = (improvementPercentage: number) => {
  if (improvementPercentage >= 80) return { status: 'Excellent', color: 'text-green-600', icon: '🚀' };
  if (improvementPercentage >= 60) return { status: 'Good', color: 'text-blue-600', icon: '⚡' };
  if (improvementPercentage >= 40) return { status: 'Fair', color: 'text-yellow-600', icon: '📈' };
  return { status: 'Poor', color: 'text-red-600', icon: '⚠️' };
};

export const formatPerformanceTime = (time: number) => {
  if (time < 1) return `${(time * 1000).toFixed(1)}μs`;
  if (time < 1000) return `${time.toFixed(1)}ms`;
  return `${(time / 1000).toFixed(2)}s`;
}; 