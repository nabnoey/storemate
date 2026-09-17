import React, { Suspense } from "react";
// import Loading from "./Loading";

const SuspenseContent = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={null}>{children}</Suspense>;
};

export default SuspenseContent;
