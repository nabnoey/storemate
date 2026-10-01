// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "./redux/store";
import router from "./router";
import "./index.css";
import { Toaster } from "react-hot-toast";
import ReactGA from "react-ga4";

const TRACKING_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (TRACKING_ID) {
  ReactGA.initialize(TRACKING_ID);
}

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <Provider store={store}>
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        // ตั้งค่าให้ toast ธรรมดาหายไปใน 3 วินาที
        duration: 2000,
        // ถ้าเป็น error อาจจะให้อยู่นานหน่อย เช่น 5 วินาที
        error: {
          duration: 2000,
        },
      }}
    />
    <RouterProvider router={router} />
  </Provider>,
  // </StrictMode>,
);
