import axios, { AxiosError, AxiosResponse } from 'axios';
import { IGetProductsResponse, IProduct } from 'models';

const isProduction = process.env.NODE_ENV === 'production';

// ✅ ENHANCED: Configurable retry settings with exponential backoff
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 10000;
const REQUEST_TIMEOUT_MS = 15000;

// ✅ NEW: Error types for better error handling
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ApiError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  retryable: boolean;
  timestamp: Date;
}

export interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  retryCount: number;
}

// ✅ NEW: Exponential backoff retry delay
const getRetryDelay = (retryCount: number): number => {
  const delay = Math.min(
    BASE_RETRY_DELAY_MS * Math.pow(2, retryCount),
    MAX_RETRY_DELAY_MS
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
};

// ✅ NEW: Input validation for product data
const validateProduct = (product: any): product is IProduct => {
  return (
    product &&
    typeof product.id === 'number' &&
    typeof product.sku === 'number' &&
    typeof product.title === 'string' &&
    typeof product.price === 'number' &&
    Array.isArray(product.availableSizes) &&
    product.availableSizes.every((size: any) => typeof size === 'string') &&
    typeof product.currencyId === 'string' &&
    typeof product.currencyFormat === 'string' &&
    typeof product.isFreeShipping === 'boolean'
  );
};

// ✅ NEW: Validate API response structure
const validateApiResponse = (data: any): data is IGetProductsResponse => {
  return (
    data &&
    data.data &&
    Array.isArray(data.data.products) &&
    data.data.products.every(validateProduct)
  );
};

// ✅ NEW: Create user-friendly error messages
const createUserFriendlyMessage = (error: ApiError): string => {
  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    case ErrorType.SERVER_ERROR:
      return `Server error (${error.statusCode}). Please try again later or contact support if the problem persists.`;
    case ErrorType.TIMEOUT_ERROR:
      return 'Request timed out. Please try again.';
    case ErrorType.VALIDATION_ERROR:
      return 'Invalid data received from server. Please refresh the page.';
    case ErrorType.UNKNOWN_ERROR:
    default:
      return 'An unexpected error occurred. Please try again or contact support.';
  }
};

// ✅ NEW: Enhanced error logging for debugging
const logError = (error: ApiError, context: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`🚨 API Error in ${context}:`, {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      retryable: error.retryable
    });
  }
  
  // In production, you might want to send to error tracking service
  if (isProduction) {
    // Example: Sentry.captureException(error);
    console.error('Production error logged:', error);
  }
};

// ✅ ENHANCED: Comprehensive API function with robust error handling
export const getProducts = async (): Promise<ApiResult<IProduct[]>> => {
  let retries = 0;
  let lastError: ApiError | null = null;
  let loading = true;

  while (retries < MAX_RETRIES) {
    try {
      let products: IProduct[] = [];
      
      if (isProduction) {
        // ✅ ENHANCED: Production API call with comprehensive error handling
        const response: AxiosResponse<IGetProductsResponse> = await axios.get(
          'https://react-shopping-cart-67954.firebaseio.com/products.json',
          { 
            timeout: REQUEST_TIMEOUT_MS,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        // ✅ ENHANCED: HTTP status code validation
        if (response.status < 200 || response.status >= 300) {
          const error: ApiError = {
            type: ErrorType.SERVER_ERROR,
            message: `HTTP ${response.status}: ${response.statusText}`,
            statusCode: response.status,
            retryable: response.status >= 500, // Retry on server errors
            timestamp: new Date()
          };
          throw error;
        }

        // ✅ ENHANCED: Response data validation
        if (!validateApiResponse(response.data)) {
          const error: ApiError = {
            type: ErrorType.VALIDATION_ERROR,
            message: 'Invalid response structure from server',
            retryable: false,
            timestamp: new Date()
          };
          throw error;
        }

        products = response.data.data.products;
      } else {
        // ✅ ENHANCED: Development mode with error simulation
        try {
          const localData: IGetProductsResponse = await new Promise<IGetProductsResponse>((resolve, reject) => {
            setTimeout(() => {
              try {
                const data = require('static/json/products.json');
                if (!validateApiResponse(data)) {
                  reject(new Error('Invalid local data structure'));
                } else {
                  resolve(data);
                }
              } catch (err) {
                reject(err);
              }
            }, 100);
          });
          
          products = localData.data.products;
        } catch (err) {
          const error: ApiError = {
            type: ErrorType.VALIDATION_ERROR,
            message: 'Failed to load local product data',
            retryable: false,
            timestamp: new Date()
          };
          throw error;
        }
      }

      // ✅ ENHANCED: Final validation of products array
      if (!Array.isArray(products) || products.length === 0) {
        const error: ApiError = {
          type: ErrorType.VALIDATION_ERROR,
          message: 'No products found in response',
          retryable: false,
          timestamp: new Date()
        };
        throw error;
      }

      loading = false;
      return { 
        data: products, 
        error: null, 
        loading,
        retryCount: retries
      };

    } catch (err) {
      retries++;
      loading = false;
      
      let apiError: ApiError;

      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError;
        
        if (axiosErr.code === 'ECONNABORTED' || axiosErr.message.includes('timeout')) {
          apiError = {
            type: ErrorType.TIMEOUT_ERROR,
            message: 'Request timed out',
            retryable: true,
            timestamp: new Date()
          };
        } else if (axiosErr.response) {
          apiError = {
            type: ErrorType.SERVER_ERROR,
            message: `Server error: ${axiosErr.response.status} ${axiosErr.response.statusText}`,
            statusCode: axiosErr.response.status,
            retryable: axiosErr.response.status >= 500,
            timestamp: new Date()
          };
        } else if (axiosErr.request) {
          apiError = {
            type: ErrorType.NETWORK_ERROR,
            message: 'Network error: Unable to reach the server',
            retryable: true,
            timestamp: new Date()
          };
        } else {
          apiError = {
            type: ErrorType.UNKNOWN_ERROR,
            message: `Request error: ${axiosErr.message}`,
            retryable: false,
            timestamp: new Date()
          };
        }
      } else if (err instanceof Error) {
        apiError = {
          type: ErrorType.UNKNOWN_ERROR,
          message: err.message,
          retryable: false,
          timestamp: new Date()
        };
      } else {
        apiError = {
          type: ErrorType.UNKNOWN_ERROR,
          message: 'An unexpected error occurred',
          retryable: false,
          timestamp: new Date()
        };
      }

      lastError = apiError;
      logError(apiError, 'getProducts');

      // ✅ ENHANCED: Retry logic with exponential backoff
      if (retries < MAX_RETRIES && apiError.retryable) {
        const delay = getRetryDelay(retries);
        console.log(`🔄 Retrying in ${delay}ms (attempt ${retries + 1}/${MAX_RETRIES})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }

  // ✅ ENHANCED: Final error result with user-friendly message
  const finalError: ApiError = {
    ...lastError!,
    message: createUserFriendlyMessage(lastError!)
  };

  return {
    data: null,
    error: finalError,
    loading: false,
    retryCount: retries
  };
};

// ✅ NEW: Utility function to check if error is retryable
export const isRetryableError = (error: ApiError): boolean => {
  return error.retryable;
};

// ✅ NEW: Utility function to get error display message
export const getErrorDisplayMessage = (error: ApiError): string => {
  return error.message;
};

// ✅ NEW: Utility function to format error for logging
export const formatErrorForLogging = (error: ApiError): string => {
  return `[${error.type}] ${error.message} (Status: ${error.statusCode || 'N/A'}, Retryable: ${error.retryable})`;
}; 