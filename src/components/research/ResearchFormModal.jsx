import { useState } from "react";
import { API_URL, STATUS_OPTIONS } from "../../config/constants";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { Select } from "../ui/Select";
import { getAuthHeaders } from "../../utils/auth";

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
  authToken,
}) {
  
  const [formData, setFormData] = useState(() => {
    if (isEdit && editData) {
      return {
        title: editData.title || "",
        type: editData.type || "Capstone",
        authors: editData.authors || "",
        abstract: editData.abstract || "",
        adviser: editData.adviser || "",
        critic: editData.critic || "",
        status: editData.status || "Part A",
        website_url: editData.website_url || "",
      };
    }
    return {
      title: "",
      type: "Capstone",
      authors: "",
      abstract: "",
      adviser: "",
      critic: "",
      status: "Part A",
      website_url: "",
    };
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(authToken),
        body: data,
      });
      if (!res.ok) throw new Error("Unable to save the research record.");

      await res.json();
      onResearchAdded();
      onNotify?.({
        type: "success",
        title: isEdit ? "Record updated" : "Record added",
        message: "The research repository has been updated.",
      });
      setPdfFile(null);
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      onNotify?.({
        type: "error",
        title: "Save failed",
        message: "Please check the details and try again.",
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

          <Field label="Abstract" required className="md:col-span-2">
            <TextArea name="abstract" value={formData.abstract} onChange={handleChange} placeholder="Enter research abstract" rows="4" disabled={isSaving} required />
          </Field>

          <Field label="Adviser" required>
            <Input name="adviser" value={formData.adviser} onChange={handleChange} placeholder="Enter adviser name" disabled={isSaving} required />
          </Field>

          <Field label="Critic" required>
            <Input name="critic" value={formData.critic} onChange={handleChange} placeholder="Enter critic name" disabled={isSaving} required />
          </Field>

          <Field label="Manuscript PDF">
            <Input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} disabled={isSaving} />
          </Field>

          <Field label="Website URL">
            <Input name="website_url" value={formData.website_url} onChange={handleChange} placeholder="https://example.com" disabled={isSaving} />
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
