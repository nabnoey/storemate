import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { getStore } from "../../redux/owner/ownerReducer";

function HeroBanner() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const storeImg = useSelector((state: RootState) => state.owner.store);


  useEffect(() => {
    dispatch(getStore());
  }, [dispatch]);

  return (
    <section
      id="hero-banner"
      className="relative w-full min-h-150 md:h-150 bg-[#14261C] overflow-hidden flex items-center mb-10 py-10 md:py-0"
    >
     <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-16 w-full px-6 md:px-12 lg:px-20 xl:px-24">
        {/* Left: Content Area */}
        <div className="w-full md:w-[45%] lg:w-[42%] text-left">
          <span
            id="hero-otop-badge"
            className="inline-block bg-[#3D4221] text-[#E5C67C] text-[12px] px-5 py-1.5 rounded-full border border-[#E5C67C]/30 mb-8 font-bold tracking-widest uppercase"
            data-testid="otop-badge"
          >
            OTOP ราชบุรี
          </span>

          <h1
            id="hero-title"
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-white mb-6"
          >
            สมุนไพร <br />
            <span className="text-[#D4AF37]">มะม่วงหาวมะนาวโห่</span> <br />
            ตรา พัดทอง
          </h1>

          <p
            id="hero-description"
            className="text-gray-300 max-w-lg text-base md:text-lg font-light leading-relaxed mb-10 opacity-90"
          >
            คัดสรรวัตถุดิบคุณภาพจากธรรมชาติ เพื่อสุขภาพที่ดีของคุณ
            ด้วยกรรมวิธีผลิตที่สะอาด ปลอดภัย ได้มาตรฐานสากล
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              id="btn-hero-see-all"
              className="bg-[#D4AF37] text-[#14261C] px-8 md:px-10 py-3 rounded-full font-bold transition-transform hover:scale-105 shadow-xl cursor-pointer"
              onClick={() => navigate("/search")}
            >
              ดูสินค้าทั้งหมด
            </button>
            <button
              id="btn-hero-about-us"
              className="border border-white/30 bg-white/5 text-white px-8 py-3 rounded-full font-bold w-fit hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => navigate("/about-us")}
            >
              เกี่ยวกับเรา
            </button>
          </div>
        </div>

        {/* Right: Image Showcase */}
<div
  id="hero-image-container"
  className="
    w-full
    md:w-[38%]
    lg:w-[40%]
    max-w-[500px]
    h-[280px]
    md:h-[360px]
    lg:h-[400px]
    bg-white
    rounded-2xl
    shadow-2xl
    p-6
    md:p-8
    overflow-hidden
    shrink-0
    lg:translate-x-10
  "
>
  {storeImg?.promotionImage ? (
    <img
      src={storeImg.promotionImage}
      alt="Promotion"
      className="w-full h-full object-contain"
    />
  ) : (
    <div className="w-full h-full rounded-xl bg-gray-200 animate-pulse" />
  )}
</div>
      </div>
    </section>
  );
}

export default HeroBanner;