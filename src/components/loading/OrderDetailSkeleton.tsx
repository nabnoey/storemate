const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

function OrderDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-start w-full mt-0 lg:mt-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 w-full p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="w-40 h-6" />
        </div>
      </div>

      <div className="p-4 sm:p-6 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Timeline */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
              {/* Order No */}
              <Skeleton className="w-32 h-4 mb-8" />

              {/* Stepper */}
              <div className="relative mb-10 mt-2">
                <div className="absolute top-5 left-[12.5%] right-[12.5%] h-[2px] bg-gray-200" />

                <div className="flex justify-between relative z-10">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="w-1/4 flex flex-col items-center gap-2"
                    >
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <Skeleton className="w-16 sm:w-20 h-3" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Change status */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                <Skeleton className="w-40 h-5 mb-5" />

                <div className="flex flex-col sm:flex-row items-end gap-4">
                  <div className="w-full sm:w-56">
                    <Skeleton className="w-20 h-3 mb-2" />
                    <Skeleton className="w-full h-10 rounded-lg" />
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <Skeleton className="flex-1 sm:w-24 h-10 rounded-lg" />
                    <Skeleton className="flex-1 sm:w-24 h-10 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Items */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <Skeleton className="w-32 h-5 mb-6" />

              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="w-14 h-14 rounded-md shrink-0" />

                    <div className="flex-1">
                      <Skeleton className="w-2/3 h-4 mb-2" />
                      <Skeleton className="w-20 h-3" />
                    </div>
                  </div>

                  <Skeleton className="w-16 h-5 ml-4" />
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-between items-center pt-4">
                <Skeleton className="w-20 h-4" />

                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="w-24 h-6" />
                  <Skeleton className="w-8 h-2" />
                </div>
              </div>

              {/* Payment */}
              <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-4">
                <Skeleton className="w-28 h-4" />
                <Skeleton className="w-36 h-4" />
              </div>
            </div>

            {/* History */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <Skeleton className="w-44 h-5 mb-7" />

              <div className="relative border-l-2 border-gray-100 ml-3 space-y-7">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="relative pl-6">
                    <Skeleton className="absolute -left-[5px] top-1 w-2 h-2 rounded-full" />

                    <Skeleton className="w-28 h-4 mb-2" />
                    <Skeleton className="w-44 h-3" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:sticky lg:top-6">
              {/* Blue Header */}
              <div className="bg-gray-200 px-5 py-3 flex items-center gap-2 animate-pulse">
                <div className="w-5 h-5 rounded bg-gray-300" />
                <div className="w-24 h-4 rounded bg-gray-300" />
              </div>

              <div className="p-5 flex flex-col gap-6">
                {/* Name */}
                <div>
                  <Skeleton className="w-24 h-3 mb-3" />

                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full shrink-0" />

                    <Skeleton className="w-32 h-4" />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <Skeleton className="w-20 h-3 mb-3" />

                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full shrink-0" />

                    <Skeleton className="w-28 h-4" />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <Skeleton className="w-28 h-3 mb-3" />

                  <div className="flex items-start gap-3">
                    <Skeleton className="w-8 h-8 rounded-full shrink-0" />

                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-full h-3" />
                      <Skeleton className="w-5/6 h-3" />
                      <Skeleton className="w-2/3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default OrderDetailSkeleton;