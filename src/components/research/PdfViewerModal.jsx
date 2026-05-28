import { useEffect, useRef, useState } from "react";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Modal } from "../ui/Modal";

export function PdfViewerModal({ file, onClose }) {
  const pagesRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [renderError, setRenderError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!file?.url) return undefined;

    let isActive = true;
    let loadingTask = null;

    Promise.resolve().then(() => {
      if (!isActive) return;
      setIsLoading(true);
      setRenderError("");
      setPdfDoc(null);
      setPageCount(0);
      setIsFullscreen(false);
    });

    import("pdfjs-dist")
      .then((pdfjsLib) => {
        if (!isActive) return null;

        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
        loadingTask = pdfjsLib.getDocument(file.url);

        return loadingTask.promise;
      })
      .then((doc) => {
        if (!doc) return;
        if (!isActive) return;
        setPdfDoc(doc);
        setPageCount(doc.numPages);
      })
      .catch((err) => {
        console.error("PDF load error:", err);
        if (isActive) {
          setRenderError("Unable to load this manuscript.");
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
      loadingTask?.destroy();
    };
  }, [file?.url]);

  useEffect(() => {
    if (!pdfDoc || !pagesRef.current) return undefined;

    let isActive = true;
    const activeRenderTasks = [];

    Promise.resolve().then(() => {
      if (!isActive) return;
      setIsLoading(true);
      setRenderError("");
      pagesRef.current.replaceChildren();
    });

    const renderPages = async () => {
      for (let currentPage = 1; currentPage <= pdfDoc.numPages; currentPage += 1) {
        if (!isActive) return;

        const page = await pdfDoc.getPage(currentPage);
        if (!isActive) return;

        const pageWrapper = document.createElement("div");
        pageWrapper.className = "flex flex-col items-center gap-2";

        const pageLabel = document.createElement("span");
        pageLabel.className = "text-xs font-medium text-slate-500";
        pageLabel.textContent = `Page ${currentPage}`;

        const canvas = document.createElement("canvas");
        canvas.className = "h-auto max-w-full rounded bg-white shadow-sm";

        const context = canvas.getContext("2d");
        const viewport = page.getViewport({ scale: 1.35 });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        pageWrapper.append(pageLabel, canvas);
        pagesRef.current.append(pageWrapper);

        const renderTask = page.render({
          canvasContext: context,
          viewport,
        });
        activeRenderTasks.push(renderTask);

        await renderTask.promise;
      }
    };

    renderPages()
      .catch((err) => {
        if (err?.name === "RenderingCancelledException") return;
        console.error("PDF render error:", err);
        if (isActive) setRenderError("Unable to render this manuscript.");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
      activeRenderTasks.forEach((task) => task.cancel());
    };
  }, [pdfDoc]);

  if (!file) return null;

  return (
    <Modal
      isOpen={Boolean(file)}
      onClose={onClose}
      title={file.title || "Manuscript Preview"}
      maxWidth={isFullscreen ? "max-w-none" : "max-w-6xl"}
      panelClassName={
        isFullscreen
          ? "h-[calc(100vh-1.5rem)] max-h-[calc(100vh-1.5rem)] sm:h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-2rem)]"
          : ""
      }
      headerActions={
        <button
          type="button"
          onClick={() => setIsFullscreen((current) => !current)}
          className="cursor-pointer rounded border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:px-3 sm:text-sm"
        >
          {isFullscreen ? "Minimize" : "Maximize"}
        </button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 border-b border-emerald-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            {pageCount > 0
              ? `${pageCount} ${pageCount === 1 ? "page" : "pages"}`
              : "Manuscript preview"}
          </p>
        </div>

        <div
          className={`relative overflow-auto rounded-lg border border-slate-200 bg-slate-100 p-2 sm:p-4 ${
            isFullscreen ? "max-h-[calc(100vh-11rem)] sm:max-h-[calc(100vh-12rem)]" : "max-h-[68vh]"
          }`}
        >
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-[1px]">
              <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
                <p className="text-sm font-medium text-slate-700">
                  Preparing manuscript preview...
                </p>
              </div>
            </div>
          )}

          {renderError ? (
            <div className="flex min-h-72 items-center justify-center text-sm font-medium text-red-600">
              {renderError}
            </div>
          ) : (
            <div
              ref={pagesRef}
              className={`flex min-h-72 flex-col items-center gap-6 ${
                isLoading ? "opacity-40" : "opacity-100"
              }`}
            >
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
