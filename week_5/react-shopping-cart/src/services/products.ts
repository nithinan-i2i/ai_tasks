import axios, { AxiosError, AxiosResponse } from 'axios';
import { IGetProductsResponse } from 'models';

const isProduction = process.env.NODE_ENV === 'production';

// Configurable retry settings
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export const getProducts = async (): Promise<ApiResult<any[]>> => {
  let retries = 0;
  let lastError: string | null = null;
  let loading = true;

  while (retries < MAX_RETRIES) {
    try {
      let products: any[] = [];
      if (isProduction) {
        const response: AxiosResponse<IGetProductsResponse> = await axios.get(
          'https://react-shopping-cart-67954.firebaseio.com/products.json',
          { timeout: 10000 }
        );
        // HTTP status code validation
        if (response.status < 200 || response.status >= 300) {
          throw new Error(`Unexpected HTTP status: ${response.status}`);
        }
        products = response.data.data.products || [];
      } else {
        // Simulate async for local require
        const localData: IGetProductsResponse = await new Promise<IGetProductsResponse>((resolve) => {
          setTimeout(() => resolve(require('static/json/products.json')), 100);
        });
        products = localData.data.products || [];
      }
      loading = false;
      return { data: products, error: null, loading };
    } catch (err) {
      retries++;
      loading = false;
      let errorMsg = 'An unexpected error occurred.';
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError;
        if (axiosErr.response) {
          errorMsg = `Server error: ${axiosErr.response.status} ${axiosErr.response.statusText}`;
        } else if (axiosErr.request) {
          errorMsg = 'Network error: Unable to reach the server.';
        } else {
          errorMsg = `Request error: ${axiosErr.message}`;
        }
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      lastError = errorMsg;
      if (retries < MAX_RETRIES) {
        await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
      }
    }
  }
  // After retries exhausted
  return {
    data: null,
    error: lastError || 'Failed to fetch products after multiple attempts.',
    loading: false,
  };
};
