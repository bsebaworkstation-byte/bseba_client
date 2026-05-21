import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./assets/progress.css";
import "./assets/print.css";
import "react-toastify/dist/ReactToastify.css";
import App from "./App.jsx";
import FullScreenLoader from "./Components/MasterLayout/FullScreenLoader.jsx";
import CreateSupplierModal from "./Components/Modals/CreateSupplierModal.jsx";
import CreateCategoryModal from "./Components/Modals/CreateCategoryModal.jsx";
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <main>
      <FullScreenLoader />
      <Toaster
        position="top-right"
        toastOptions={{
          className: "z-[9999]",
        }}
      />
      <CreateCategoryModal />

      <CreateSupplierModal />
      <App />
      <ToastContainer />
    </main>
  </StrictMode>
);
