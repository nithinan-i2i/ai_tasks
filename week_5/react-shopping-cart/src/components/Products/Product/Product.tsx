import { KeyboardEvent, useState, useEffect } from 'react';

import formatPrice from 'utils/formatPrice';
import { IProduct } from 'models';
import { validateProductTitle, validatePrice, validateSku, logSecurityEvent } from 'utils/security';
import SecureDisplay from 'components/SecureDisplay';

import { useCart } from 'contexts/cart-context';

import * as S from './style';

interface IProps {
  product: IProduct;
}

// ✅ ENHANCED: Product component with security features
const Product = ({ product }: IProps) => {
  const { openCart, addProduct } = useCart();
  const [isValidProduct, setIsValidProduct] = useState<boolean>(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const {
    sku,
    title,
    price,
    installments,
    currencyId,
    currencyFormat,
    isFreeShipping,
  } = product;

  // ✅ SECURITY: Validate product data on mount
  useEffect(() => {
    const errors: string[] = [];
    
    // Validate title
    const titleValidation = validateProductTitle(title);
    if (!titleValidation.isValid) {
      errors.push(`Title: ${titleValidation.error}`);
    }
    
    // Validate price
    const priceValidation = validatePrice(price);
    if (!priceValidation.isValid) {
      errors.push(`Price: ${priceValidation.error}`);
    }
    
    // Validate SKU
    const skuValidation = validateSku(sku);
    if (!skuValidation.isValid) {
      errors.push(`SKU: ${skuValidation.error}`);
    }
    
    if (errors.length > 0) {
      setIsValidProduct(false);
      setValidationErrors(errors);
      
      // ✅ SECURITY: Log validation failures
      logSecurityEvent('product_validation_failed', {
        sku,
        errors,
        timestamp: new Date()
      });
    } else {
      setIsValidProduct(true);
      setValidationErrors([]);
      
      // ✅ SECURITY: Log successful validation
      logSecurityEvent('product_validated', {
        sku,
        timestamp: new Date()
      });
    }
  }, [product, sku, title, price]);

  const formattedPrice = formatPrice(price, currencyId);
  let productInstallment;

  if (installments) {
    const installmentPrice = price / installments;

    productInstallment = (
      <S.Installment>
        <span>or {installments} x</span>
        <b>
          {currencyFormat}
          {formatPrice(installmentPrice, currencyId)}
        </b>
      </S.Installment>
    );
  }

  // ✅ ENHANCED: Secure add product function with validation
  const handleAddProduct = async () => {
    if (!isValidProduct || isProcessing) {
      console.warn('Cannot add invalid product to cart');
      return;
    }

    setIsProcessing(true);
    
    try {
      // ✅ SECURITY: Additional validation before adding to cart
      const titleValidation = validateProductTitle(title);
      const priceValidation = validatePrice(price);
      
      if (!titleValidation.isValid || !priceValidation.isValid) {
        throw new Error('Product validation failed');
      }
      
      // ✅ SECURITY: Sanitize product data before adding to cart
      const sanitizedProduct = {
        ...product,
        title: titleValidation.sanitizedValue || title,
        price: parseFloat(priceValidation.sanitizedValue || price.toString()),
        quantity: 1
      };
      
      addProduct(sanitizedProduct);
      openCart();
      
      // ✅ SECURITY: Log successful cart addition
      logSecurityEvent('product_added_to_cart', {
        sku,
        price: sanitizedProduct.price,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Failed to add product to cart:', error);
      
      // ✅ SECURITY: Log cart addition failure
      logSecurityEvent('product_cart_addition_failed', {
        sku,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ ENHANCED: Secure keyboard event handling
  const handleAddProductWhenEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.code === 'Space') {
      event.preventDefault(); // Prevent default behavior
      handleAddProduct();
    }
  };

  // ✅ SECURITY: Render validation error state
  if (!isValidProduct) {
    return (
      <S.Container 
        onKeyUp={handleAddProductWhenEnter} 
        sku={sku} 
        tabIndex={1}
        style={{ 
          border: '2px solid #dc3545',
          backgroundColor: '#f8d7da'
        }}
      >
        <div style={{ 
          color: '#dc3545', 
          padding: '10px',
          textAlign: 'center'
        }}>
          <strong>⚠️ Invalid Product Data</strong>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            {validationErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.7 }}>
              SKU: {sku}
            </div>
          )}
        </div>
      </S.Container>
    );
  }

  return (
    <S.Container 
      onKeyUp={handleAddProductWhenEnter} 
      sku={sku} 
      tabIndex={1}
      style={{
        position: 'relative',
        // ✅ SECURITY: Prevent layout attacks with CSS containment
        contain: 'layout style paint'
      }}
    >
      {isFreeShipping && <S.Stopper>Free shipping</S.Stopper>}
      
      {/* ✅ SECURITY: Secure image with alt text and error handling */}
      <S.Image 
        alt={title} 
        onError={(e) => {
          // ✅ SECURITY: Handle image loading errors
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          logSecurityEvent('product_image_load_failed', {
            sku,
            imageSrc: target.src,
            timestamp: new Date()
          });
        }}
      />
      
      {/* ✅ SECURITY: Use SecureDisplay for title */}
      <S.Title>
        <SecureDisplay
          content={title}
          type="title"
          maxLength={200}
          fallbackText="Product title unavailable"
          onValidationError={(error) => {
            logSecurityEvent('product_title_validation_error', {
              sku,
              error,
              timestamp: new Date()
            });
          }}
        />
      </S.Title>
      
      <S.Price>
        <S.Val>
          <small>{currencyFormat}</small>
          <b>{formattedPrice.substring(0, formattedPrice.length - 3)}</b>
          <span>{formattedPrice.substring(formattedPrice.length - 3)}</span>
        </S.Val>
        {productInstallment}
      </S.Price>
      
      {/* ✅ ENHANCED: Secure button with loading state and validation */}
      <S.BuyButton 
        onClick={handleAddProduct} 
        tabIndex={-1}
        disabled={isProcessing || !isValidProduct}
        style={{
          opacity: isProcessing ? 0.7 : 1,
          cursor: isProcessing ? 'not-allowed' : 'pointer'
        }}
        aria-label={`Add ${title} to cart`}
        aria-describedby={isProcessing ? 'processing-status' : undefined}
      >
        {isProcessing ? 'Adding...' : 'Add to cart'}
      </S.BuyButton>
      
      {/* ✅ ACCESSIBILITY: Status message for screen readers */}
      {isProcessing && (
        <div 
          id="processing-status" 
          className="sr-only"
          aria-live="polite"
        >
          Processing your request...
        </div>
      )}
    </S.Container>
  );
};

export default Product;
