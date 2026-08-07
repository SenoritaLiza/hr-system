import { Navigate, Route, Routes } from "react-router-dom";
import { IconSprite } from "@/components/icons/IconSprite";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "@/context/ThemeContext";
import { RoleProvider } from "@/context/RoleContext";
import { ThresholdProvider } from "@/context/ThresholdContext";
import { CandidatesProvider } from "@/context/CandidatesContext";
import { VacanciesProvider } from "@/context/VacanciesContext";
import { PageTitleProvider } from "@/context/PageTitleContext";
import { ToastProvider } from "@/context/ToastContext";
import { PATHS } from "@/router/paths";

import { VacanciesPage } from "@/pages/vacancies/VacanciesPage";
import { VacancyPipelinePage } from "@/pages/vacancies/VacancyPipelinePage";
import { UploadPage } from "@/pages/upload/UploadPage";
import { BulkUploadPage } from "@/pages/upload/BulkUploadPage";

function App() {
  return (
    <ThemeProvider>
      <RoleProvider>
        <ThresholdProvider>
          <CandidatesProvider>
            <VacanciesProvider>
              <PageTitleProvider>
                <ToastProvider>
                  <IconSprite />
                  <Routes>
                    <Route element={<AppShell />}>
                      <Route path="/" element={<Navigate to={PATHS.vacancies} replace />} />
                      <Route path={PATHS.vacancies} element={<VacanciesPage />} />
                      <Route path={PATHS.vacancyPipeline} element={<VacancyPipelinePage />} />
                      <Route path={PATHS.upload} element={<UploadPage />} />
                      <Route path={PATHS.bulkUpload} element={<BulkUploadPage />} />
                      <Route path="*" element={<Navigate to={PATHS.vacancies} replace />} />
                    </Route>
                  </Routes>
                </ToastProvider>
              </PageTitleProvider>
            </VacanciesProvider>
          </CandidatesProvider>
        </ThresholdProvider>
      </RoleProvider>
    </ThemeProvider>
  );
}

export default App;