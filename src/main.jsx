import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import "./index.css";
import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { BrandingProvider } from "./context/BrandingContext";
import { ServicesProvider } from "./context/ServicesContext";
import ErrorFallback from "./components/common/ErrorFallback";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset app state on retry – navigate to current page
        window.location.reload();
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <BrandingProvider>
            <ServicesProvider>
              <App />
            </ServicesProvider>
          </BrandingProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);