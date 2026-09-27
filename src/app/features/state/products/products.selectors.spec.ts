import { ProductResponse } from '../../dtos/products/product-response.dto';
import {
  selectActiveProductCount,
  selectArchivedProductCount,
  selectDraftProductCount,
  selectFilteredAdminProducts,
  selectInactiveProductCount,
  selectPublicProductCount,
} from './products.selectors';

function product(
  id: number,
  status: ProductResponse['status'],
  category: ProductResponse['category'],
  name: string,
  description = '',
): ProductResponse {
  return { id, status, category, name, productCode: `CODE-${id}`, description } as ProductResponse;
}

describe('products selectors', () => {
  const products = [
    product(1, 'ACTIVE', 'WEATHER', 'Monsoon Rain Cover', 'Heavy rainfall'),
    product(2, 'DRAFT', 'FLOOD', 'River Flood Cover'),
    product(3, 'INACTIVE', 'WEATHER', 'Heat Wave Cover'),
    product(4, 'ARCHIVED', 'CYCLONE', 'Coastal Cyclone Cover'),
  ];

  it('counts products per status', () => {
    expect(selectActiveProductCount.projector(products)).toBe(1);
    expect(selectDraftProductCount.projector(products)).toBe(1);
    expect(selectInactiveProductCount.projector(products)).toBe(1);
    expect(selectArchivedProductCount.projector(products)).toBe(1);
    expect(selectPublicProductCount.projector(products)).toBe(4);
  });

  it('returns all products with no filters', () => {
    expect(selectFilteredAdminProducts.projector(products, {}).length).toBe(4);
  });

  it('filters by category and status', () => {
    const result = selectFilteredAdminProducts.projector(products, { category: 'WEATHER', status: 'ACTIVE' });

    expect(result.map((p) => p.id)).toEqual([1]);
  });

  it('searches name, code and description case-insensitively', () => {
    expect(selectFilteredAdminProducts.projector(products, { search: '  FLOOD ' }).map((p) => p.id)).toEqual([2]);
    expect(selectFilteredAdminProducts.projector(products, { search: 'code-3' }).map((p) => p.id)).toEqual([3]);
    expect(selectFilteredAdminProducts.projector(products, { search: 'rainfall' }).map((p) => p.id)).toEqual([1]);
  });
});
