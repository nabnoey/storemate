import { useNavigate } from "react-router-dom";

type Props = {
  title: string;
  subTitle: string;
  category: string;
};

function SectionHeader({ title, subTitle, category }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between pr-5 items-center mb-5 mt-20">
      <div>
        <h2
          className="text-[24px] md:text-[32px] -ml-4 font-bold text-gray-900"
          data-test={`category-${category}`}
        >
          {title}
        </h2>

        <p className="text-[14px] md:text-[16px] -ml-4 text-gray-500 mt-1 font-light opacity-80">
          {subTitle}
        </p>
      </div>

      <button
        className="flex items-center mt-10 gap-2 text-blue-500 cursor-pointer"
        data-test="see-all-link"
        onClick={() => navigate(`/search?category=${category}`)}
      >
        <span className="text-[14px] md:text-[16px] font-semibold whitespace-nowrap">
          ดูทั้งหมด
        </span>
        <span className="text-xl">›</span>
      </button>
    </div>
  );
}

export default SectionHeader;