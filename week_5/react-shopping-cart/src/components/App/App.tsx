import { useEffect } from 'react';

import Loader from 'components/Loader';
import { GithubCorner, GithubStarButton } from 'components/Github';
import Recruiter from 'components/Recruiter';
import Filter from 'components/Filter';
import Products from 'components/Products';
import Cart from 'components/Cart';

import { useProducts } from 'contexts/products-context';

import * as S from './style';

function App() {
  const { isFetching, products, fetchProducts, totalProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <S.Container>
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
            <p>{products?.length} Product(s) found</p>
            {/* Performance monitoring info */}
            <small style={{ color: '#666', fontSize: '12px' }}>
              Total products: {totalProducts} | Filtered: {products?.length || 0}
            </small>
          </S.MainHeader>
          <Products products={products} />
        </S.Main>
      </S.TwoColumnGrid>
      <Cart />
    </S.Container>
  );
}

export default App;
