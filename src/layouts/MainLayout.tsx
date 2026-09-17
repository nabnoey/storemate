import { Outlet } from "react-router-dom";
import { Suspense } from "react";
// import Loading from "../components/loading/Loading";
import NavBar from "../components/user/Navbar";
import Footer from "../components/user/Footer";
import ScrollToTop from "../components/user/ScrollToTop";
import useNotificationSocket from "../hooks/useNotificationSocket";

// react-router-dom -> useLocation
// react -> useState, useEffect

const MainLayout = () => {
  // const location = useLocation();
  // const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  useNotificationSocket();

  // useEffect(() => {
  //   setIsPageTransitioning(true);

  //   const timer = setTimeout(() => {
  //     setIsPageTransitioning(false);
  //     // หน่วงไม่ถึง 1 วินาที ถ้าไม่หน่วงไม่โผล่นะจ้ะ
  //   }, 900);

  //   return () => clearTimeout(timer);
  // }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* NavBar */}

      <ScrollToTop />
      {/* 
      {isPageTransitioning && <Loading fullScreen={true} size={250} />} */}

      <div className="fixed top-0 left-0 right-0 z-50">
        <NavBar />
      </div>

      <main className="flex-grow w-full mt-14 md:mt-16">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>

      <div className="mt-25 lg:mt-35">
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;