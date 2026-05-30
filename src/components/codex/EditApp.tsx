import React, { useCallback, useEffect, useRef, useState } from "react";
import { renderMarkdown } from "../../utils/renderMarkdown";
import { useIsMobile } from "../../hooks/useIsMobile";

// ── Dev-only markdown draft editor ────────────────────────────────────────────
// Three panes: file list · Monaco editor · live preview. Talks to /api/edit.
// Monaco loads from a CDN (no build dependency); falls back to a <textarea> if the
// CDN is unreachable. Designed to be usable through the Cloudflare tunnel on a phone.

const MONACO_VERSION = "0.52.2";
const MONACO_BASE = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/`;
const MONACO_VS = `${MONACO_BASE}vs`;

const ACCENT = "#3fbf7a"; // logs green
const ACCENT_DEEP = "#1f8a5b";
const AMBER = "#ffb84d";
const ROSE = "#ff5d73";
const BG = "#0a1320";
const PANEL = "rgba(255,255,255,0.04)";
const PANEL_HI = "rgba(255,255,255,0.07)";
const BORDER = "rgba(255,255,255,0.12)";
const INK = "rgba(236,242,250,0.95)";
const INK_MUTE = "rgba(236,242,250,0.5)";

const FILENAME_RE = /^[a-z0-9][a-z0-9._-]*$/;

interface DraftFile {
  filename: string;
  title: string;
  date?: string;
  kicker?: string;
  size: number;
  modified: number;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function template(title: string): string {
  return `---
title: "${title}"
date: "${todayISO()}"
kicker: "Draft"
hook: ""
tags: []
---

# ${title}

Start writing…
`;
}

/** Strip leading YAML frontmatter so the preview renders the body only. */
function stripFrontmatter(md: string): string {
  return md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

// ── Monaco loader (singleton across mounts) ───────────────────────────────────
let monacoPromise: Promise<any> | null = null;
function loadMonaco(): Promise<any> {
  if (monacoPromise) return monacoPromise;
  monacoPromise = new Promise((resolve, reject) => {
    const w = window as any;
    if (w.monaco) return resolve(w.monaco);

    // Cross-origin worker shim — load Monaco's worker from the CDN via a data: URL.
    w.MonacoEnvironment = {
      getWorkerUrl() {
        return `data:text/javascript;charset=utf-8,${encodeURIComponent(
          `self.MonacoEnvironment={baseUrl:'${MONACO_BASE}'};importScripts('${MONACO_VS}/base/worker/workerMain.js');`,
        )}`;
      },
    };

    const script = document.createElement("script");
    script.src = `${MONACO_VS}/loader.js`;
    script.onload = () => {
      const require = w.require;
      require.config({ paths: { vs: MONACO_VS } });
      require(["vs/editor/editor.main"], () => resolve(w.monaco), reject);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return monacoPromise;
}

export default function EditApp() {
  const isMobile = useIsMobile();
  const [files, setFiles] = useState<DraftFile[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [savedContent, setSavedContent] = useState<string>("");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [status, setStatus] = useState<{ msg: string; tone: "ok" | "err" | "info" }>({
    msg: "Select or create a draft.",
    tone: "info",
  });
  const [autosave, setAutosave] = useState(false);
  const [monacoFailed, setMonacoFailed] = useState(false);
  const [tab, setTab] = useState<"files" | "edit" | "preview">("files");

  const editorHostRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);
  const activeRef = useRef<string | null>(null);
  const dirty = content !== savedContent;

  // Always-current content, so Monaco can seed itself correctly even if it finishes
  // loading from the CDN after a file has already been opened.
  const contentRef = useRef(content);
  contentRef.current = content;

  // ── Load the file list ──────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/edit?action=list");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to list");
      setFiles(data.files);
    } catch (e: any) {
      setStatus({ msg: e.message || "Failed to load drafts", tone: "err" });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // ── Mount Monaco once ───────────────────────────────────────────────────────
  useEffect(() => {
    let disposed = false;
    if (!editorHostRef.current || monacoFailed) return;
    loadMonaco()
      .then((monaco) => {
        if (disposed || !editorHostRef.current || editorRef.current) return;
        monaco.editor.defineTheme("pawper", {
          base: "vs-dark",
          inherit: true,
          rules: [],
          colors: {
            "editor.background": BG,
            "editorLineNumber.foreground": "#3a4a60",
            "editorCursor.foreground": ACCENT,
            "editor.selectionBackground": "#1f8a5b55",
          },
        });
        const editor = monaco.editor.create(editorHostRef.current, {
          value: contentRef.current,
          language: "markdown",
          theme: "pawper",
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 13,
          wordWrap: "on",
          minimap: { enabled: false },
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
        });
        editor.onDidChangeModelContent(() => setContent(editor.getValue()));
        editorRef.current = editor;
      })
      .catch(() => setMonacoFailed(true));
    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monacoFailed]);

  // Re-layout Monaco when toggling into the edit tab on mobile.
  useEffect(() => {
    if (tab === "edit" && editorRef.current) {
      requestAnimationFrame(() => editorRef.current?.layout());
    }
  }, [tab]);

  // ── Live preview (debounced) ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      renderMarkdown(stripFrontmatter(content)).then((html) => {
        if (!cancelled) setPreviewHtml(html);
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [content]);

  // ── Open a file ─────────────────────────────────────────────────────────────
  const open = useCallback(async (filename: string) => {
    try {
      const res = await fetch(`/api/edit?action=read&filename=${encodeURIComponent(filename)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not read file");
      const text: string = data.content;
      setActive(filename);
      activeRef.current = filename;
      setContent(text);
      setSavedContent(text);
      if (editorRef.current) editorRef.current.setValue(text);
      setStatus({ msg: `Opened ${filename}`, tone: "info" });
      if (isMobile) setTab("edit");
    } catch (e: any) {
      setStatus({ msg: e.message || "Failed to open", tone: "err" });
    }
  }, [isMobile]);

  // ── Save ────────────────────────────────────────────────────────────────────
  const save = useCallback(
    async (filename: string | null, body: string) => {
      if (!filename) return;
      try {
        const res = await fetch("/api/edit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ filename, content: body }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Save failed");
        setSavedContent(body);
        setStatus({ msg: `Saved ${filename} · ${new Date().toLocaleTimeString()}`, tone: "ok" });
        void refresh();
      } catch (e: any) {
        setStatus({ msg: e.message || "Save failed", tone: "err" });
      }
    },
    [refresh],
  );

  // ── Autosave ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!autosave || !active || !dirty) return;
    const t = setTimeout(() => void save(active, content), 1500);
    return () => clearTimeout(t);
  }, [autosave, active, content, dirty, save]);

  // ── Create ──────────────────────────────────────────────────────────────────
  const create = useCallback(async () => {
    const slug = window.prompt("New draft filename (slug, no extension):", "");
    if (!slug) return;
    const clean = slug.trim().toLowerCase();
    if (!FILENAME_RE.test(clean)) {
      setStatus({ msg: "Invalid slug — use a-z, 0-9, dash, dot, underscore", tone: "err" });
      return;
    }
    const filename = `${clean}.md`;
    if (files.some((f) => f.filename === filename)) {
      setStatus({ msg: `${filename} already exists`, tone: "err" });
      return;
    }
    const title = clean.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const body = template(title);
    await save(filename, body);
    setActive(filename);
    activeRef.current = filename;
    setContent(body);
    setSavedContent(body);
    if (editorRef.current) editorRef.current.setValue(body);
    if (isMobile) setTab("edit");
  }, [files, save, isMobile]);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const remove = useCallback(async () => {
    if (!active) return;
    if (!window.confirm(`Delete ${active}? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/edit", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ filename: active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setStatus({ msg: `Deleted ${active}`, tone: "ok" });
      setActive(null);
      activeRef.current = null;
      setContent("");
      setSavedContent("");
      if (editorRef.current) editorRef.current.setValue("");
      void refresh();
      if (isMobile) setTab("files");
    } catch (e: any) {
      setStatus({ msg: e.message || "Delete failed", tone: "err" });
    }
  }, [active, refresh, isMobile]);

  // Warn on unsaved navigation.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // ── UI pieces ─────────────────────────────────────────────────────────────--
  const FileList = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <PaneHeader label="Drafts">
        <button style={ghostBtn(ACCENT)} onClick={create}>+ New</button>
        <button style={ghostBtn(INK_MUTE)} onClick={() => void refresh()} title="Reload">↻</button>
      </PaneHeader>
      <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
        {files.length === 0 && (
          <div style={{ padding: 16, color: INK_MUTE, fontSize: 12 }}>No drafts yet. Create one.</div>
        )}
        {files.map((f) => {
          const isActive = f.filename === active;
          return (
            <button
              key={f.filename}
              onClick={() => void open(f.filename)}
              style={{
                display: "block", width: "100%", textAlign: "left", cursor: "pointer",
                padding: "10px 14px", border: "none",
                borderLeft: `3px solid ${isActive ? ACCENT : "transparent"}`,
                background: isActive ? PANEL_HI : "transparent",
                color: INK, font: "inherit",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {f.title}
              </div>
              <div className="pw-mono" style={{ fontSize: 10.5, color: INK_MUTE, marginTop: 2 }}>
                {f.filename}{f.date ? ` · ${f.date}` : ""}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const Editor = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <PaneHeader label={active ? `Editing · ${active}` : "Editor"}>
        <label className="pw-mono" style={{ fontSize: 11, color: INK_MUTE, display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
          <input type="checkbox" checked={autosave} onChange={(e) => setAutosave(e.target.checked)} />
          auto
        </label>
        <button style={solidBtn(ACCENT_DEEP)} disabled={!active || !dirty} onClick={() => void save(active, content)}>
          {dirty ? "Save" : "Saved"}
        </button>
        <button style={ghostBtn(ROSE)} disabled={!active} onClick={remove}>Delete</button>
      </PaneHeader>
      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        {!active && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: INK_MUTE, fontSize: 13, pointerEvents: "none" }}>
            No draft open
          </div>
        )}
        {monacoFailed ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!active}
            spellCheck={false}
            style={{
              width: "100%", height: "100%", resize: "none", boxSizing: "border-box",
              background: BG, color: INK, border: "none", outline: "none", padding: 12,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 13, lineHeight: 1.5,
            }}
          />
        ) : (
          <div ref={editorHostRef} style={{ position: "absolute", inset: 0 }} />
        )}
      </div>
    </div>
  );

  const Preview = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <PaneHeader label="Preview" />
      <div
        className="edit-preview"
        style={{ overflowY: "auto", flex: 1, minHeight: 0, padding: "16px 20px", color: INK, fontSize: 14, lineHeight: 1.6 }}
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: BG, color: INK }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
        borderBottom: `1px solid ${BORDER}`, flexShrink: 0,
      }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: "0.06em", color: ACCENT, transform: "scaleY(1.15)" }}>
          DRAFT&nbsp;CONSOLE
        </span>
        <span className="pw-mono" style={{ fontSize: 10, color: INK_MUTE, letterSpacing: "0.16em" }}>DEV ONLY</span>
        <span
          className="pw-mono"
          style={{
            marginLeft: "auto", fontSize: 11.5,
            color: status.tone === "err" ? ROSE : status.tone === "ok" ? ACCENT : INK_MUTE,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "55vw",
          }}
        >
          {dirty ? "● " : ""}{status.msg}
        </span>
        <a href="/" className="pw-mono" style={{ fontSize: 11, color: INK_MUTE, textDecoration: "none" }} title="Back to site">← site</a>
      </div>

      {/* Mobile tab bar */}
      {isMobile && (
        <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          {(["files", "edit", "preview"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
                background: tab === t ? PANEL_HI : "transparent",
                color: tab === t ? ACCENT : INK_MUTE,
                borderBottom: `2px solid ${tab === t ? ACCENT : "transparent"}`,
                font: "inherit", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Panes */}
      {isMobile ? (
        <div style={{ flex: 1, minHeight: 0 }}>
          <div style={{ height: "100%", display: tab === "files" ? "block" : "none" }}>{FileList}</div>
          <div style={{ height: "100%", display: tab === "edit" ? "block" : "none" }}>{Editor}</div>
          <div style={{ height: "100%", display: tab === "preview" ? "block" : "none" }}>{Preview}</div>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "260px 1fr 1fr", gridTemplateRows: "minmax(0, 1fr)" }}>
          <div style={{ borderRight: `1px solid ${BORDER}`, minWidth: 0, minHeight: 0 }}>{FileList}</div>
          <div style={{ borderRight: `1px solid ${BORDER}`, minWidth: 0, minHeight: 0 }}>{Editor}</div>
          <div style={{ minWidth: 0, minHeight: 0 }}>{Preview}</div>
        </div>
      )}
    </div>
  );
}

// ── Small styled helpers ──────────────────────────────────────────────────────
function PaneHeader({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
      borderBottom: `1px solid ${BORDER}`, background: PANEL, flexShrink: 0, minHeight: 40,
    }}>
      <span className="pw-mono" style={{
        fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: INK_MUTE,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {label}
      </span>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>{children}</div>
    </div>
  );
}

function ghostBtn(color: string): React.CSSProperties {
  return {
    background: "transparent", border: `1px solid ${color}`, color,
    borderRadius: 4, padding: "4px 9px", fontSize: 11, fontWeight: 600,
    cursor: "pointer", fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
  };
}

function solidBtn(bg: string): React.CSSProperties {
  return {
    background: bg, border: `1px solid ${bg}`, color: "#fff",
    borderRadius: 4, padding: "4px 11px", fontSize: 11, fontWeight: 700,
    cursor: "pointer", fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
  };
}
