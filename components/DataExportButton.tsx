"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export function DataExportButton() {
  const [pending, setPending] = useState(false);

  const exportData = async () => {
    setPending(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) {
        alert("export failed · try again");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename =
        res.headers
          .get("Content-Disposition")
          ?.match(/filename="?([^"]+)"?/)?.[1] ?? "chatter-export.json";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={exportData}
      disabled={pending}
      className="btn-primary inline-flex"
    >
      <Download size={16} strokeWidth={1.5} />
      {pending ? "preparing…" : "download my data"}
    </button>
  );
}
