import ProductCard from "./ProductCard";
import SectionHeader from "./SectionHeader";
import EmptyProduct from "./EmptyProduct";

import type { Product } from "../../types/product";

type Props = {
  title: string;
  subTitle: string;
  category: string;
  products: Product[];
};

function ProductSection({ title, subTitle, category, products }: Props) {
  return (
    <section
      id={`${category}-section`}
      className="mb-20 max-w-360 mx-auto px-6 md:px-12 lg:px-24 xl:px-32"
    >
      <SectionHeader title={title} subTitle={subTitle} category={category} />

      {products.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible">
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[75%] sm:w-[45%] flex-shrink-0 md:w-auto"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyProduct />
      )}
    </section>
  );
}

export default ProductSection;