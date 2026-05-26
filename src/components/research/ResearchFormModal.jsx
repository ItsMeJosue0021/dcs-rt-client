import { useState } from "react";
import { API_URL, STATUS_OPTIONS, EMPTY_FORM } from "../../config/constants";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { Select } from "../ui/Select";

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
        authors: editData.authors || "",
        abstract: editData.abstract || "",
        adviser: editData.adviser || "",
        critic: editData.critic || "",
        status: editData.status || "MOR",
        website_url: editData.website_url || "",
      };
    }
    return EMPTY_FORM;
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetAndClose = () => {
    if (isSaving) return;
    setFormData(EMPTY_FORM);
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
      const res = await fetch(url, { method, body: data });
      if (!res.ok) throw new Error("Unable to save the research record.");

      await res.json();
      onResearchAdded();
      onNotify?.({
        type: "success",
        title: isEdit ? "Record updated" : "Record added",
        message: "The research repository has been updated.",
      });
      setFormData(EMPTY_FORM);
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
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Title" required>
            <Input name="title" value={formData.title} onChange={handleChange} placeholder="Enter research title" disabled={isSaving} required />
          </Field>

          <Field label="Authors" required>
            <Input name="authors" value={formData.authors} onChange={handleChange} placeholder="Enter author names" disabled={isSaving} required />
          </Field>

          <Field label="Abstract" required className="lg:col-span-2">
            <TextArea name="abstract" value={formData.abstract} onChange={handleChange} placeholder="Enter research abstract" rows="3" disabled={isSaving} required />
          </Field>

          <Field label="Adviser" required>
            <Input name="adviser" value={formData.adviser} onChange={handleChange} placeholder="Enter adviser name" disabled={isSaving} required />
          </Field>

          <Field label="Critic" required>
            <Input name="critic" value={formData.critic} onChange={handleChange} placeholder="Enter critic name" disabled={isSaving} required />
          </Field>

          <Field label="Status" required>
            <Select name="status" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} disabled={isSaving} required />
          </Field>

          <Field label="Manuscript PDF">
            <Input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} disabled={isSaving} />
          </Field>

          <Field label="Website URL" className="lg:col-span-2">
            <Input name="website_url" value={formData.website_url} onChange={handleChange} placeholder="https://example.com" disabled={isSaving} />
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-emerald-100">
          <button
            type="button"
            onClick={resetAndClose}
            disabled={isSaving}
            className="cursor-pointer px-4 py-2 border border-emerald-200 rounded hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="cursor-pointer px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving..." : isEdit ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
