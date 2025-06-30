import { useProducts } from 'contexts/products-context';

import * as S from './style';

export const availableSizes = ['XS', 'S', 'M', 'ML', 'L', 'XL', 'XXL'];

const Filter = () => {
  const { filters, filterProducts } = useProducts();

  const selectedCheckboxes = new Set(filters);

  const toggleCheckbox = (label: string) => {
    if (selectedCheckboxes.has(label)) {
      selectedCheckboxes.delete(label);
    } else {
      selectedCheckboxes.add(label);
    }

    const filters = Array.from(selectedCheckboxes) as [];

    filterProducts(filters);
  };

  const createCheckbox = (label: string) => (
    <S.Checkbox label={label} handleOnChange={toggleCheckbox} key={label} />
  );

  const createCheckboxes = () => availableSizes.map(createCheckbox);

  return (
    <S.Container>
      <div className="flex justify-between items-center mb-3">
        <S.Title>Sizes:</S.Title>
        
        {/* ✅ NEW: Performance Indicator for Active Filtering */}
        {filters && filters.length > 0 && (
          <div className="flex items-center text-xs text-green-600 font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
            {filters.length} filter{filters.length > 1 ? 's' : ''} active
          </div>
        )}
      </div>
      
      {createCheckboxes()}
      
      {/* ✅ NEW: Performance Hint */}
      {filters && filters.length > 0 && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <div className="flex items-center">
            <span className="mr-1">⚡</span>
            <span>Optimized filtering active - instant results</span>
          </div>
        </div>
      )}
    </S.Container>
  );
};

export default Filter;
