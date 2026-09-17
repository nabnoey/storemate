import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { fetchProducts } from "../redux/products/productReducer";
import HeroBanner from "../components/user/HeroBanner";
import ProductSection from "../components/user/ProductSection";

function HomePage() {
  const dispatch = useDispatch<AppDispatch>();

  const groupedProduct = useSelector(
    (state: RootState) => state.products.groupedProducts
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const getCategoryProducts = (category: string) => {
    return (
      groupedProduct.find(
        (group) => group.categoryName.toLowerCase() === category
      )?.products || []
    );
  };

  return (
    <div className="w-full pb-24 bg-white" id="home-page">
      <HeroBanner />

      {/* Main Content Area */}
      <main className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <ProductSection
          title="โปรโมชั่นสุดพิเศษ"
          subTitle="น้ำสมุนไพรเพื่อสุขภาพ รสชาติกลมกล่อม ดื่มง่าย"
          category="promotion"
          products={getCategoryProducts("promotion")}
        />

        <ProductSection
          title="สบู่สมุนไพร"
          subTitle="ดูแลและบำรุงผิวพรรณด้วยคุณค่าจากธรรมชาติแท้ 100%"
          category="soap"
          products={getCategoryProducts("soap")}
        />

        <ProductSection
          title="เครื่องดื่ม"
          subTitle="ดูแลผิวพรรณให้สดใสจากธรรมชาติ"
          category="drinks"
          products={getCategoryProducts("drinks")}
        />

        <ProductSection
          title="แชมพูสมุนไพร"
          subTitle="ดูแลเส้นผมและหนังศีรษะด้วยธรรมชาติ"
          category="shampoo"
          products={getCategoryProducts("shampoo")}
          
        />
      </main>
    </div>
  );
}

export default HomePage;