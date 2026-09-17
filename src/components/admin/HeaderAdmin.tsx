type Props = {
  readonly title: string;
  readonly subtitle?: string;
};

//OMGGGG

function HeaderAdmin({ title, subtitle }: Props) {
  return (
    <div className="w-full bg-white border-b border-black p-8 py-4 shadow-none ">
      <div className="flex flex-col gap-1">
        {/* title */}
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>

        {/* subtitle */}
        {subtitle && (
          <p className="text-[15px] text-black font-bold mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default HeaderAdmin;
