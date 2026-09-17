import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const Footer: React.FC = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-[#193220] text-gray-300 font-anuphan block w-full -mt-[1px] relative z-10 p-0 m-0">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-10 md:py-12 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 md:gap-8">
        <div className="col-span-2 md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#EAB308] rounded-full flex items-center justify-center text-[#193220] font-bold text-sm shrink-0">
              PT
            </div>
            <h2 className="text-[#D4AF37] font-bold text-[18px] md:text-[20px]">
              พัดทอง
            </h2>
          </div>
          <p className="text-[14px] md:text-[16px] leading-relaxed text-gray-300 max-w-sm">
            ผลิตภัณฑ์แปรรูปจากสมุนไพรไทย มะม่วงหาว
            <br />
            มะนาวโห่คุณภาพสูง เพื่อสุขภาพที่ดีของคุณ
          </p>
        </div>

        <div className="col-span-1">
          <h3 className="text-[#D4AF37] font-bold text-[18px] md:text-[20px] mb-4">
            เมนู
          </h3>
          <ul className="flex flex-col space-y-2 text-sm md:text-[16px]">
            <li>
              <button
                data-test="home-button"
                className="cursor-pointer py-1 text-left hover:text-white transition-colors"
                onClick={() => navigate("/")}
              >
                หน้าแรก
              </button>
            </li>
            <li>
              <button
                data-test="all-products-button"
                className="cursor-pointer py-1 text-left hover:text-white transition-colors"
                onClick={() => navigate("/search")}
              >
                สินค้าทั้งหมด
              </button>
            </li>
            <li>
              <button
                data-test="promotions-button"
                className="cursor-pointer py-1 text-left hover:text-white transition-colors"
                onClick={() => navigate("/search?keyword=&category=promotion")}
              >
                โปรโมชั่น
              </button>
            </li>
            <li>
              <button
                data-test="contact-button"
                className="cursor-pointer py-1 text-left hover:text-white transition-colors"
                onClick={() => navigate("/contact")}
              >
                ติดต่อเรา
              </button>
            </li>
          </ul>
        </div>

        <div className="col-span-1">
          <h3 className="text-[#D4AF37] font-bold text-[18px] md:text-[20px] mb-4">
            ติดตามเรา
          </h3>
          <div className="flex gap-3 flex-wrap">
            <a
              data-test="facebook-button"
              href="https://www.facebook.com/Padthong636"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ไปที่ Facebook ของพัดทอง"
              className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] rounded-full bg-[#142419] border border-[#142419] flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Icon
                icon="fa6-brands:facebook-f"
                className="text-white text-[18px] md:text-[20px]"
              />
            </a>

            <a
              data-test="instagram-button"
              href="https://www.instagram.com/padthongofficial/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ไปที่ Instagram ของพัดทอง"
              className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] rounded-full bg-[#142419] border border-[#142419] flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Icon
                icon="tdesign:camera-filled"
                className="text-white text-[18px] md:text-[20px]"
              />
            </a>

            <a
              data-test="line-button"
              href="https://line.me/R/ti/p/@859pkcpt?oat_content=url&ts=05121928"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ติดต่อเราผ่าน Line"
              className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] rounded-full bg-[#142419] border border-[#142419] flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Icon
                icon="material-symbols:chat"
                className="text-white text-[18px] md:text-[20px]"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-[#142419] py-6 flex flex-col items-center justify-center">
        <div className="text-center text-[#D1D5DB] text-[12px] md:text-[14px] leading-[20px] font-normal font-kanit">
          © {new Date().getFullYear()} iTouchong Store สงวนลิขสิทธิ์
        </div>
      </div>
    </footer>
  );
};

export default Footer;
