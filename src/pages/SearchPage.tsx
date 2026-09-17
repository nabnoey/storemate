import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { search } from "../../src/redux/products/productReducer";
import ProductCard from "../components/user/ProductCard";
import { GoSearch } from "react-icons/go";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const keyword: string = searchParams.get("keyword") || "";
  const category = searchParams.get("category")?.toLowerCase() || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";

  const searchResult = useSelector(
    (state: RootState) => state.products.searchResult,
  );

  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);
  const [openFilter, setOpenFilter] = useState(false);

  const handleClearFilter = () => {
    setMaxPriceInput("");
    setMinPriceInput("");
    setSearchParams({});
    setInputValue("");
  };

  useEffect(() => {
    dispatch(
      search({
        keyword,
        categoryId: null,
        minPrice: 0,
        maxPrice: 100000,
        page: 0,
        size: 1000,
      }),
    );
  }, [keyword, dispatch]);


  const handleApplyPrice = () => {
    const params: Record<string, string> = {};
    
    // 📌 ดึงจาก inputValue (ช่องพิมพ์ปัจจุบัน) แทนที่จะใช้ keyword เก่าจาก URL
    const currentKeyword = inputValue.trim();
    if (currentKeyword !== "") params.keyword = currentKeyword;
    
    if (category !== "") params.category = category;

    // ดึงค่าราคาล่าสุดจาก Input State
    if (minPriceInput !== "") params.minPrice = minPriceInput;
    if (maxPriceInput !== "") params.maxPrice = maxPriceInput;

    setSearchParams(params);
  };

  const [inputValue, setInputValue] = useState(keyword);
  useEffect(() => {
    setInputValue(keyword);
  }, [keyword]);



  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = inputValue.trim();
      const params: Record<string, string> = {};
      
      if (value) params.keyword = value;
      if (category) params.category = category;
      

      if (minPriceInput) params.minPrice = minPriceInput;
      if (maxPriceInput) params.maxPrice = maxPriceInput;

      setSearchParams(params);
      setOpenFilter(false); 
    }
  };

  const filteredProducts = searchResult.filter((product:any) => {
    const min = minPriceParam ? Number(minPriceParam) : 0;
    const max = maxPriceParam ? Number(maxPriceParam) : Infinity;
    const matchPrice = product.price >= min && product.price <= max;
    
    let matchCategory = true;
    if (category) {
      matchCategory = product.categoryName?.toLowerCase() === category;
    }
    
    return matchPrice && matchCategory;
  });

  const sortedProducts = [...filteredProducts].sort((p1, p2) => p1.price - p2.price);

  return (
    <div className="max-w-[1440px] mx-auto mt-4 md:mt-8 px-4 md:px-8 lg:px-12">
      
      <h1 className="hidden md:block text-2xl md:text-3xl font-bold text-black mb-6">
        ค้นหาสินค้า
      </h1>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start ">
        
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4">
          <div className="relative z-20 flex items-center w-full h-[44px] bg-white border border-gray-300 rounded-lg px-3 focus-within:border-gray-400">
            <button onClick={() => navigate(-1)} className="mr-2 text-black md:hidden shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>

            <GoSearch className="text-gray-500 mr-2 shrink-0" size={18} />

            <input
              data-test="input-search"
              type="text"
              placeholder="ค้นหาสินค้า..."
              className="flex-1 h-full text-black bg-transparent border-none outline-none text-[15px] w-full min-w-0"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleSearch}
            />

            <button onClick={() => setOpenFilter(!openFilter)} className="ml-2 text-black lg:hidden shrink-0" data-test="openFilter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </button>
          </div>

          <div className={`${openFilter ? "block" : "hidden"} lg:block w-full bg-white rounded-t-none rounded-lg border border-gray-200 p-5 -mt-6 shadow-md`} data-test="all-filter">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-black">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                ตัวกรอง
              </h3>
              <button data-test="clear-filter" onClick={handleClearFilter} className="text-sm text-gray-500 hover:text-black cursor-pointer">ล้างค่า</button>
            </div>
            
            <div className="border-b border-gray-200 my-4"></div>
            
            <p className="text-black text-[15px] font-semibold">หมวดหมู่</p>

            <div className="flex flex-col gap-3 mt-4 pl-2 items-start">
              <button type="button" data-test="category-all" onClick={() => setSearchParams({ keyword, minPrice: minPriceParam, maxPrice: maxPriceParam })} className={`cursor-pointer bg-transparent border-none p-0 text-left transition-colors hover:text-black ${category === "" ? "text-black font-semibold" : "text-gray-500 text-[14px]"}`}>ทั้งหมด</button>
              <button type="button" data-test="category-soap" onClick={() => setSearchParams({ keyword, category: "soap", minPrice: minPriceParam, maxPrice: maxPriceParam })} className={`cursor-pointer bg-transparent border-none p-0 text-left transition-colors hover:text-black ${category === "soap" ? "text-black font-semibold text-[15px]" : "text-gray-500 text-[14px]"}`}>สบู่</button>
              <button type="button" data-test="category-shampoo" onClick={() => setSearchParams({ keyword, category: "shampoo", minPrice: minPriceParam, maxPrice: maxPriceParam })} className={`cursor-pointer bg-transparent border-none p-0 text-left transition-colors hover:text-black ${category === "shampoo" ? "text-black font-semibold text-[15px]" : "text-gray-500 text-[14px]"}`}>แชมพู</button>
              <button type="button" data-test="category-drink" onClick={() => setSearchParams({ keyword, category: "drinks", minPrice: minPriceParam, maxPrice: maxPriceParam })} className={`cursor-pointer bg-transparent border-none p-0 text-left transition-colors hover:text-black ${category === "drinks" ? "text-black font-semibold text-[15px]" : "text-gray-500 text-[14px]"}`}>เครื่องดื่ม</button>
            </div>

            <div className="border-b border-gray-200 my-4"></div>

            <p className="text-[15px] text-black font-semibold">ช่วงราคา (฿)</p>
            <div className="flex items-center gap-2 mt-3 text-black">
              <input
  data-test="input-min-price"
  min="0"
  type="number"
  placeholder="฿"
  value={minPriceInput}
  onChange={(e) => {
    const value = e.target.value;

    if (Number(value) >= 0 || value === "") {
      setMinPriceInput(value);
    }
  }}
  onKeyDown={(e) => {
    if (e.key === "-" || e.key === "e") {
      e.preventDefault();
    }
  }}
  className="w-full border border-gray-300 rounded-md p-1.5 text-center text-sm"
/>

<span className="text-gray-500">—</span>

<input
  data-test="input-max-price"
  min="0"
  type="number"
  placeholder="฿"
  value={maxPriceInput}
  onChange={(e) => {
    const value = e.target.value;

    if (Number(value) >= 0 || value === "") {
      setMaxPriceInput(value);
    }
  }}
  onKeyDown={(e) => {
    if (e.key === "-" || e.key === "e") {
      e.preventDefault();
    }
  }}
  className="w-full border border-gray-300 rounded-md p-1.5 text-center text-sm"
/>
              {/* <input data-test="input-min-price" min="0" type="number" placeholder="฿" value={minPriceInput} onChange={(e) => setMinPriceInput(e.target.value)} className="w-full border border-gray-300 rounded-md p-1.5 text-center text-sm" />
              <span className="text-gray-500">—</span>
              <input data-test="input-max-price" min="0" type="number" placeholder="฿" value={maxPriceInput} onChange={(e) => setMaxPriceInput(e.target.value)} className="w-full border border-gray-300 rounded-md p-1.5 text-center text-sm" /> */}
            </div>
            
            <div className="mt-5">
              <button data-test="apply-price-filter" onClick={() => handleApplyPrice()} className="w-full py-2 rounded-lg text-white bg-[#1e3a8a] hover:bg-[#152b69] transition-colors cursor-pointer text-[15px] font-medium">ตกลง</button>
            </div>
          </div>
        </div>


        <div className="flex-1 w-full">
          
          <div className="flex justify-center items-center border w-full border-gray-200 rounded-lg px-4 py-3 bg-white mb-6 mt-2 lg:mt-0"
          data-test="filteredProduct">
            <p className="text-gray-800 text-sm font-medium">พบสินค้า {filteredProducts.length} รายการ</p>
          </div>

          {filteredProducts.length === 0 ? (
            <p className="text-gray-500 text-center text-[24px] mt-10">
              ไม่พบสินค้าที่คุณค้นหา
            </p>
          ) : (
            
            <div className="grid grid-cols-2  md:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3 lg:gap-[24px]">
              {sortedProducts.map((product) => {
                return <ProductCard key={product.id} product={product} />;
              })}
            </div>

          )}
        </div>

      </div>
    </div>
  );
};

export default SearchPage;