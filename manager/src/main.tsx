import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Manager app root not found.");
}

ReactDOM.createRoot(app).render(
  <React.StrictMode>
    <>
      <style>{`
        :root {
          color: #1f1f1f;
          background:
            radial-gradient(circle at top left, rgba(232, 214, 181, 0.7), transparent 30%),
            linear-gradient(180deg, #f7f2e8 0%, #efe7d8 100%);
          font-family: "Segoe UI", "PingFang SC", "Noto Sans SC", sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          min-height: 100vh;
        }

        button,
        input,
        select,
        textarea {
          font: inherit;
        }

        .shell {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          min-height: 100vh;
        }

        .sidebar {
          padding: 24px 18px;
          background: rgba(61, 45, 29, 0.92);
          color: #f4ede2;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .brand {
          margin: 0 0 12px;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .nav {
          border: 0;
          border-radius: 12px;
          padding: 12px 14px;
          text-align: left;
          color: inherit;
          background: rgba(255, 255, 255, 0.08);
          cursor: pointer;
        }

        .nav.active {
          background: #f0c98b;
          color: #3d2d1d;
          font-weight: 700;
        }

        .main-panel {
          padding: 24px;
        }

        .page {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .panel {
          border-radius: 20px;
          padding: 22px;
          background: rgba(255, 251, 245, 0.86);
          box-shadow: 0 14px 36px rgba(77, 56, 33, 0.08);
        }

        .stack > * + * {
          margin-top: 14px;
        }

        .eyebrow {
          margin: 0 0 8px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 0.75rem;
          color: #7b6040;
        }

        h1,
        h2,
        p,
        dl,
        dd,
        dt {
          margin: 0;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }

        .meta-grid div {
          padding: 14px;
          border-radius: 14px;
          background: #f8f0e3;
        }

        .meta-grid dt {
          margin-bottom: 6px;
          font-size: 0.8rem;
          color: #7b6040;
        }

        .toolbar {
          display: flex;
          gap: 16px;
          justify-content: space-between;
          align-items: end;
          flex-wrap: wrap;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 180px;
        }

        .field select {
          border: 1px solid #d1bea1;
          border-radius: 10px;
          background: #fffaf3;
          padding: 10px 12px;
        }

        .field input,
        .field textarea {
          border: 1px solid #d1bea1;
          border-radius: 10px;
          background: #fffaf3;
          padding: 10px 12px;
          width: 100%;
        }

        .content-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 12px;
        }

        .content-item {
          border: 1px solid #e8dcc9;
          border-radius: 14px;
          padding: 16px;
          background: #fffdf9;
        }

        .content-list.compact .content-item {
          padding: 12px 14px;
        }

        .content-head,
        .meta-line {
          display: flex;
          gap: 12px;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
        }

        .meta-line {
          margin: 8px 0 10px;
          color: #7b6040;
          font-size: 0.9rem;
        }

        .grid-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }

        .field-span {
          grid-column: 1 / -1;
        }

        .checkbox-field {
          display: flex;
          gap: 10px;
          align-items: center;
          color: #5d4936;
        }

        .editor-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
          gap: 18px;
        }

        .editor-area {
          min-height: 320px;
        }

        .meta-area,
        .code-area,
        .quote-area {
          min-height: 120px;
        }

        .code-area {
          min-height: 360px;
          font-family: Consolas, "Courier New", monospace;
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .primary-button,
        .secondary-button {
          border-radius: 10px;
          padding: 10px 14px;
          cursor: pointer;
        }

        .primary-button {
          border: 0;
          background: #3d2d1d;
          color: #f8f0e3;
        }

        .secondary-button {
          border: 1px solid #c8b191;
          background: #fffaf3;
          color: #4b3824;
        }

        .pill {
          padding: 4px 10px;
          border-radius: 999px;
          background: #dbecc6;
          color: #35571b;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .pill.muted {
          background: #eadfce;
          color: #6a543c;
        }

        .error {
          color: #8f2d20;
        }

        .hint {
          color: #35571b;
        }

        .preview {
          display: flex;
          flex-direction: column;
          gap: 12px;
          line-height: 1.7;
        }

        .preview h2,
        .preview h3 {
          margin-top: 6px;
        }

        .wiki-link {
          color: #9d4f0f;
          text-decoration: none;
          border-bottom: 1px solid rgba(157, 79, 15, 0.35);
        }

        .note-box {
          border-radius: 14px;
          padding: 14px;
          background: #f8f0e3;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(34, 26, 18, 0.45);
          display: grid;
          place-items: center;
          padding: 24px;
        }

        .dialog {
          width: min(780px, 100%);
          max-height: 80vh;
          overflow: auto;
          border-radius: 18px;
          background: #fffaf3;
          padding: 20px;
          box-shadow: 0 18px 48px rgba(44, 30, 16, 0.2);
        }

        @media (max-width: 860px) {
          .shell {
            grid-template-columns: 1fr;
          }

          .sidebar {
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
          }

          .brand {
            width: 100%;
          }

          .editor-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <App />
    </>
  </React.StrictMode>
);
