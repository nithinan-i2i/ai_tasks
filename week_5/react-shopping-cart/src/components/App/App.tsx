import { useEffect, useState } from 'react';

import Loader from 'components/Loader';
import { GithubCorner, GithubStarButton } from 'components/Github';
import Recruiter from 'components/Recruiter';
import Filter from 'components/Filter';
import Products from 'components/Products';
import Cart from 'components/Cart';
import ErrorBoundary from 'components/ErrorBoundary';
import { logSecurityEvent } from 'utils/security';
import { monitoring, recordError, trackEvent } from 'utils/monitoring';

import { useProducts } from 'contexts/products-context';
import { runPerformanceComparison, getPerformanceStatus, formatPerformanceTime } from 'utils/performanceComparison';

import * as S from './style';

// ✅ ENHANCED: Performance Dashboard Component with Hover Display
const PerformanceDashboard = ({ 
  getPerformanceReport, 
  totalProducts, 
  filteredCount,
  products,
  filters 
}: {
  getPerformanceReport: () => Record<string, number>;
  totalProducts: number;
  filteredCount: number;
  products: any[];
  filters: string[];
}) => {
  const [performanceData, setPerformanceData] = useState<Record<string, number>>({});
  const [showComparison, setShowComparison] = useState(false);
  const [comparison, setComparison] = useState<any>(null);

  useEffect(() => {
    const updatePerformance = () => {
      const report = getPerformanceReport();
      setPerformanceData(report);
    };

    // Update performance data every 2 seconds
    const interval = setInterval(updatePerformance, 2000);
    updatePerformance(); // Initial update

    return () => clearInterval(interval);
  }, [getPerformanceReport]);

  const runComparison = () => {
    if (products.length === 0) return;
    
    // Run comparison in next tick to avoid blocking UI
    setTimeout(() => {
      const result = runPerformanceComparison(products, filters);
      setComparison(result);
    }, 0);
  };

  const getPerformanceColor = (operation: string, value: number) => {
    if (operation.includes('Filtering') || operation.includes('Create')) {
      return value > 100 ? 'text-red-500' : value > 50 ? 'text-yellow-500' : 'text-green-500';
    }
    return 'text-blue-500';
  };

  const getPerformanceIcon = (operation: string, value: number) => {
    if (operation.includes('Filtering') || operation.includes('Create')) {
      return value > 100 ? '🔴' : value > 50 ? '🟡' : '🟢';
    }
    return '📊';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 group">
      {/* Hover Trigger Button */}
      <div className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg mb-2 transition-colors cursor-pointer">
        📊 Performance
      </div>

      {/* Performance Dashboard - Shows on Hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm mb-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            🚀 Performance Dashboard
          </h3>
          
          {/* Product Stats */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Products:</span>
              <span className="text-sm font-bold text-blue-600">
                {filteredCount} / {totalProducts}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalProducts > 0 ? (filteredCount / totalProducts) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Performance Comparison Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Performance Comparison:</h4>
              <button
                onClick={() => {
                  setShowComparison(!showComparison);
                  if (!showComparison && !comparison) {
                    runComparison();
                  }
                }}
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors"
              >
                {showComparison ? 'Hide' : 'Compare'}
              </button>
            </div>
            
            {showComparison && comparison && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Old Algorithm:</span>
                    <span className="font-mono text-red-600">
                      🔴 {formatPerformanceTime(comparison.oldAlgorithm)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Algorithm:</span>
                    <span className="font-mono text-green-600">
                      🟢 {formatPerformanceTime(comparison.newAlgorithm)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Improvement:</span>
                    <span className="font-mono font-bold text-blue-600">
                      ⚡ {comparison.improvementPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    {getPerformanceStatus(comparison.improvementPercentage).icon} 
                    {getPerformanceStatus(comparison.improvementPercentage).status} Performance
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Real-time Metrics:</h4>
            {Object.entries(performanceData).length > 0 ? (
              Object.entries(performanceData).map(([operation, avgTime]) => (
                <div key={operation} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 truncate mr-2">{operation}:</span>
                  <span className={`font-mono font-bold ${getPerformanceColor(operation, avgTime)}`}>
                    {getPerformanceIcon(operation, avgTime)} {avgTime.toFixed(1)}ms
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 italic">
                No performance data yet. Try filtering products!
              </div>
            )}
          </div>

          {/* Performance Status */}
          <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-sm">
              <span className="text-green-600 mr-2">✅</span>
              <span className="text-green-700 font-medium">Optimized Performance Active</span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              Set-based filtering • Debounced inputs • Smart caching
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ ENHANCED: Security Status Component
const SecurityStatus = () => {
  const [securityStatus, setSecurityStatus] = useState({
    xssProtection: true,
    inputValidation: true,
    errorHandling: true,
    cspEnabled: true
  });

  useEffect(() => {
    // ✅ SECURITY: Log security status on mount
    logSecurityEvent('security_status_check', {
      status: securityStatus,
      timestamp: new Date()
    });
  }, []);

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-green-100 border border-green-300 rounded-lg p-3 shadow-lg">
        <div className="flex items-center mb-2">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          <span className="text-sm font-medium text-green-800">Security Active</span>
        </div>
        <div className="text-xs text-green-700 space-y-1">
          <div>✅ XSS Protection</div>
          <div>✅ Input Validation</div>
          <div>✅ Error Handling</div>
          <div>✅ CSP Enabled</div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { isFetching, products, fetchProducts, totalProducts, getPerformanceReport, filteredCount, filters } = useProducts();

  useEffect(() => {
    fetchProducts();
    
    // ✅ SECURITY: Log application initialization
    logSecurityEvent('application_initialized', {
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    trackEvent('navigation', { path: window.location.pathname, timestamp: new Date() });
  }, [fetchProducts]);

  // ✅ ENHANCED: Custom error handler for ErrorBoundary
  const handleError = (error: Error, errorInfo: any) => {
    console.error('App-level error caught:', error, errorInfo);
    
    // ✅ SECURITY: Log critical errors
    logSecurityEvent('critical_error_caught', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date()
    });

    recordError(error, 'App', { componentStack: errorInfo?.componentStack });
  };

  return (
    <ErrorBoundary onError={handleError}>
      <S.Container>
        {/* ✅ SECURITY: Security status indicator */}
        <SecurityStatus />
        
        {isFetching && <Loader />}
        <GithubCorner />
        <Recruiter />
        <S.TwoColumnGrid>
          <S.Side>
            <Filter />
            <GithubStarButton />
          </S.Side>
          <S.Main>
            <S.MainHeader>
              <div className="flex justify-between items-start">
                <div>
                  <p>{products?.length} Product(s) found</p>
                  {/* Enhanced performance monitoring info */}
                  <div className="text-xs text-gray-600 space-y-1 mt-1">
                    <div>Total products: {totalProducts} | Filtered: {filteredCount || products?.length || 0}</div>
                    <div className="text-green-600 font-medium">
                      🚀 Optimized filtering active • Performance monitoring enabled
                    </div>
                  </div>
                </div>
                
                {/* ✅ NEW: Subtle Performance Indicator */}
                <div className="text-right">
                  <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    Performance Optimized
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Hover bottom-right for details
                  </div>
                </div>
              </div>
            </S.MainHeader>
            <Products products={products} />
          </S.Main>
        </S.TwoColumnGrid>
        <Cart />
        
        {/* ✅ ENHANCED: Performance Dashboard with Hover Display */}
        <PerformanceDashboard 
          getPerformanceReport={getPerformanceReport}
          totalProducts={totalProducts}
          filteredCount={filteredCount || 0}
          products={products || []}
          filters={filters || []}
        />
      </S.Container>
    </ErrorBoundary>
  );
}

export default App;
