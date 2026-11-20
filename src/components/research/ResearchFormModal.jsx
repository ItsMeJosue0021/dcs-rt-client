import { useState } from "react";
import { API_URL, STATUS_OPTIONS } from "../../config/constants";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { Select } from "../ui/Select";
import { apiFetch } from "../../lib/api";

const TYPE_OPTIONS = [
  { value: "Capstone", label: "Capstone Project" },
  { value: "Thesis", label: "Thesis" }
];

function Field({ label, required = false, className = "", children }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}

export default function ResearchFormModal({
  isOpen,
  onClose,
  onResearchAdded,
  editData,
  isEdit,
  onNotify,
}) {
  
  const [formData, setFormData] = useState(() => {
    if (isEdit && editData) {
      return {
        title: editData.title || "",
        type: editData.type || "Capstone",
        authors: editData.authors || "",
        abstract: editData.status === "Finished" ? (editData.abstract || "") : "",
        description: editData.status === "Finished" ? "" : (editData.description || ""),
        adviser: editData.adviser || "",
        critic: editData.critic || "",
        status: editData.status || "Part A",
        website_url: editData.website_url || "",
        academic_year: editData.academic_year || "",
      };
    }
    return {
      title: "",
      type: "Capstone",
      authors: "",
      abstract: "",
      description: "",
      adviser: "",
      critic: "",
      status: "Part A",
      website_url: "",
      academic_year: "",
    };
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => name === "status"
      ? { ...prev, status: value, abstract: "", description: "" }
      : { ...prev, [name]: value });
  };

  const resetAndClose = () => {
    if (isSaving) return;
    setPdfFile(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    const data = new FormData();

    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (pdfFile) data.append("pdf_file", pdfFile);

    const url = isEdit ? `${API_URL}/api/research/${editData.id}` : `${API_URL}/api/research`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await apiFetch(url, { method, body: data });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || "Unable to save the research record.");
      }
      const refreshed = await onResearchAdded();
      onNotify?.({
        type: refreshed === false ? "error" : "success",
        title: refreshed === false
          ? (isEdit ? "Record updated; list could not refresh" : "Record added; list could not refresh")
          : (isEdit ? "Record updated" : "Record added"),
        message: refreshed === false
          ? "The change was saved, but the repository could not reload. Refresh the page to see it."
          : "The research repository has been updated.",
      });
      setPdfFile(null);
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      onNotify?.({
        type: "error",
        title: "Save failed",
        message: err.message || "Please check the details and try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={isEdit ? "Edit Research Record" : "Add Research Record"}
      maxWidth="max-w-5xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title" required>
            <Input name="title" value={formData.title} onChange={handleChange} placeholder="Enter title" disabled={isSaving} required />
          </Field>

          <Field label="Classification Type" required>
            <Select name="type" value={formData.type} onChange={handleChange} options={TYPE_OPTIONS} disabled={isSaving} required />
          </Field>

          <Field label="Authors" required>
            <Input name="authors" value={formData.authors} onChange={handleChange} placeholder="Enter author names" disabled={isSaving} required />
          </Field>

          <Field label="Status" required>
            <Select name="status" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} disabled={isSaving} required />
          </Field>

          <Field label={formData.status === "Finished" ? "Abstract" : "Description"} required className="md:col-span-2">
            {formData.status === "Finished" ? (
              <TextArea name="abstract" value={formData.abstract} onChange={handleChange} placeholder="Enter research abstract" rows="4" disabled={isSaving} required />
            ) : (
              <TextArea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the research project and its current work" rows="4" disabled={isSaving} required />
            )}
          </Field>

          <Field label="Adviser" required>
            <Input name="adviser" value={formData.adviser} onChange={handleChange} placeholder="Enter adviser name" disabled={isSaving} required />
          </Field>

          <Field label="Critic" required>
            <Input name="critic" value={formData.critic} onChange={handleChange} placeholder="Enter critic name" disabled={isSaving} required />
          </Field>

          <Field label="Academic Year" required>
            <Input name="academic_year" value={formData.academic_year} onChange={handleChange} placeholder="2024-2025" pattern="[0-9]{4}-[0-9]{4}" title="Use the format YYYY-YYYY, for example 2024-2025." disabled={isSaving} required />
          </Field>

          <Field label="Manuscript PDF">
            <Input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} disabled={isSaving} />
          </Field>

          <Field label="Website URL">
            <Input type="url" name="website_url" value={formData.website_url} onChange={handleChange} placeholder="https://example.com" maxLength={500} disabled={isSaving} />
            <span className="block text-xs font-normal text-slate-500">Enter a full URL beginning with https:// or http://, or leave this blank.</span>
          </Field>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-emerald-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetAndClose}
            disabled={isSaving}
            className="cursor-pointer rounded border border-emerald-200 px-4 py-2 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="cursor-pointer rounded bg-emerald-700 px-4 py-2 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving..." : isEdit ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
