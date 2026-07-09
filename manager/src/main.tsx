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
          color: #2b2117;
          background:
            radial-gradient(circle at 12% 8%, rgba(255, 231, 183, 0.82), transparent 28rem),
            radial-gradient(circle at 86% 14%, rgba(255, 184, 132, 0.36), transparent 24rem),
            radial-gradient(circle at 62% 82%, rgba(163, 190, 138, 0.24), transparent 26rem),
            linear-gradient(135deg, #f8f0df 0%, #ead7bd 48%, #dcc7ab 100%);
          font-family: "Avenir Next", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
          font-synthesis-weight: none;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          min-height: 100vh;
          background:
            linear-gradient(rgba(255, 255, 255, 0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.14) 1px, transparent 1px);
          background-size: 42px 42px;
        }

        body::before {
          position: fixed;
          inset: 0;
          pointer-events: none;
          content: "";
          background:
            radial-gradient(circle at 24% 18%, rgba(255, 255, 255, 0.46), transparent 16rem),
            radial-gradient(circle at 78% 58%, rgba(255, 247, 224, 0.35), transparent 18rem);
          mix-blend-mode: screen;
        }

        button,
        input,
        select,
        textarea {
          font: inherit;
        }

        button:disabled,
        input:disabled,
        select:disabled,
        textarea:disabled {
          cursor: not-allowed;
          opacity: 0.58;
        }

        .shell {
          display: grid;
          grid-template-columns: 274px minmax(0, 1fr);
          min-height: 100vh;
          padding: 18px;
          gap: 18px;
          position: relative;
        }

        .sidebar {
          position: sticky;
          top: 18px;
          height: calc(100vh - 36px);
          padding: 18px;
          border: 1px solid rgba(255, 255, 255, 0.38);
          border-radius: 30px;
          background: rgba(77, 57, 38, 0.42);
          box-shadow: 0 24px 70px rgba(74, 50, 26, 0.18);
          backdrop-filter: blur(22px);
          color: #fff7e8;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .brand {
          margin: 0 0 10px;
          padding: 22px 20px;
          border: 1px solid rgba(255, 226, 181, 0.28);
          border-radius: 24px;
          background:
            radial-gradient(circle at 20% 18%, rgba(255, 217, 150, 0.34), transparent 58%),
            linear-gradient(135deg, #211711 0%, #5d3d26 58%, #8c5d30 100%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 18px 40px rgba(36, 25, 16, 0.28);
          color: #fff1d7;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .nav {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 17px;
          padding: 12px 14px;
          text-align: left;
          color: inherit;
          background: rgba(255, 255, 255, 0.12);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
          cursor: pointer;
          transition:
            background 160ms ease,
            box-shadow 160ms ease,
            transform 160ms ease;
        }

        .nav:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(2px);
        }

        .nav.active {
          border-color: rgba(255, 221, 153, 0.64);
          background: linear-gradient(135deg, #f6c76f 0%, #e6814f 100%);
          box-shadow: 0 12px 28px rgba(148, 82, 34, 0.24);
          color: #332113;
          font-weight: 800;
          transform: translateX(4px);
        }

        .main-panel {
          min-width: 0;
          padding: 8px 6px 28px;
        }

        .page {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .panel {
          border: 1px solid rgba(255, 255, 255, 0.48);
          border-radius: 28px;
          padding: 24px;
          background: rgba(255, 250, 238, 0.58);
          box-shadow: 0 22px 60px rgba(86, 58, 30, 0.12);
          backdrop-filter: blur(20px);
        }

        .stack > * + * {
          margin-top: 14px;
        }

        .eyebrow {
          margin: 0 0 8px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 0.72rem;
          color: #8b5e2e;
          font-weight: 800;
        }

        h1,
        h2,
        p,
        dl,
        dd,
        dt {
          margin: 0;
        }

        h1 {
          font-size: clamp(2rem, 4vw, 3.75rem);
          line-height: 0.95;
          letter-spacing: -0.06em;
        }

        h2 {
          letter-spacing: -0.025em;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }

        .meta-grid div {
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.45);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.34);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.36);
        }

        .meta-grid dt {
          margin-bottom: 6px;
          font-size: 0.8rem;
          color: #7b6040;
          font-weight: 800;
        }

        .meta-grid dd {
          font-size: 1.45rem;
          font-weight: 800;
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
          gap: 7px;
          min-width: 180px;
          color: #59442f;
          font-size: 0.92rem;
          font-weight: 700;
        }

        .field select,
        .field input,
        .field textarea {
          width: 100%;
          border: 1px solid rgba(125, 91, 52, 0.2);
          border-radius: 15px;
          background: rgba(255, 252, 245, 0.58);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.42), 0 10px 24px rgba(84, 58, 31, 0.06);
          color: #2f2318;
          padding: 11px 13px;
          outline: none;
          transition:
            border-color 160ms ease,
            box-shadow 160ms ease,
            background 160ms ease;
        }

        .field select:focus,
        .field input:focus,
        .field textarea:focus {
          border-color: rgba(197, 115, 56, 0.58);
          background: rgba(255, 253, 248, 0.82);
          box-shadow: 0 0 0 4px rgba(227, 148, 81, 0.16), 0 12px 30px rgba(84, 58, 31, 0.08);
        }

        .content-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 12px;
        }

        .content-item {
          border: 1px solid rgba(255, 255, 255, 0.48);
          border-radius: 20px;
          padding: 16px;
          background: rgba(255, 253, 246, 0.42);
          box-shadow: 0 12px 32px rgba(88, 58, 30, 0.08);
        }

        .content-list.compact .content-item {
          padding: 10px;
        }

        .content-item .nav {
          display: flex;
          gap: 12px;
          justify-content: space-between;
          align-items: center;
          color: #332417;
          background: rgba(255, 255, 255, 0.3);
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
          align-items: start;
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
          font-family: "Cascadia Mono", Consolas, "Courier New", monospace;
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .primary-button,
        .secondary-button {
          border-radius: 999px;
          padding: 10px 16px;
          cursor: pointer;
          font-weight: 800;
          transition:
            box-shadow 160ms ease,
            transform 160ms ease,
            background 160ms ease;
        }

        .primary-button:hover:not(:disabled),
        .secondary-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .primary-button {
          border: 1px solid rgba(73, 43, 20, 0.16);
          background: linear-gradient(135deg, #2c2118 0%, #6e4428 58%, #d27b45 100%);
          box-shadow: 0 14px 30px rgba(91, 48, 22, 0.22);
          color: #fff5e2;
        }

        .secondary-button {
          border: 1px solid rgba(127, 91, 52, 0.24);
          background: rgba(255, 252, 244, 0.58);
          box-shadow: 0 10px 22px rgba(84, 58, 31, 0.08);
          color: #4b3824;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 24px;
          padding: 4px 10px;
          border: 1px solid rgba(84, 122, 43, 0.16);
          border-radius: 999px;
          background: rgba(220, 236, 195, 0.72);
          color: #35571b;
          font-size: 0.8rem;
          font-weight: 800;
        }

        .pill.muted {
          border-color: rgba(128, 91, 48, 0.14);
          background: rgba(234, 223, 206, 0.72);
          color: #6a543c;
        }

        .error {
          color: #8f2d20;
          font-weight: 800;
        }

        .hint {
          color: #35571b;
          font-weight: 700;
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
          border: 1px solid rgba(255, 255, 255, 0.42);
          border-radius: 18px;
          padding: 14px;
          background: rgba(248, 240, 227, 0.7);
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(34, 26, 18, 0.45);
          display: grid;
          place-items: center;
          padding: 24px;
          backdrop-filter: blur(10px);
        }

        .dialog {
          width: min(780px, 100%);
          max-height: 80vh;
          overflow: auto;
          border: 1px solid rgba(255, 255, 255, 0.48);
          border-radius: 24px;
          background: rgba(255, 250, 243, 0.82);
          padding: 22px;
          box-shadow: 0 24px 70px rgba(44, 30, 16, 0.24);
          backdrop-filter: blur(18px);
        }

        .birthday-manager {
          gap: 20px;
        }

        .birthday-manager__hero {
          overflow: hidden;
          position: relative;
          min-height: 220px;
          display: flex;
          justify-content: space-between;
          background:
            radial-gradient(circle at 84% 12%, rgba(255, 201, 111, 0.36), transparent 18rem),
            linear-gradient(135deg, rgba(255, 253, 245, 0.72), rgba(245, 222, 189, 0.54));
        }

        .birthday-manager__hero::after {
          position: absolute;
          right: -70px;
          bottom: -110px;
          width: 260px;
          height: 260px;
          border: 1px solid rgba(111, 76, 38, 0.1);
          border-radius: 50%;
          content: "";
          background: rgba(255, 255, 255, 0.18);
        }

        .birthday-manager__hero > * {
          position: relative;
          z-index: 1;
        }

        .birthday-manager__stats {
          grid-template-columns: repeat(4, minmax(120px, 1fr));
        }

        .birthday-manager__stats div {
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.54), rgba(255, 235, 203, 0.42));
        }

        .birthday-manager__layout {
          grid-template-columns: minmax(260px, 0.72fr) minmax(0, 1.28fr);
        }

        .birthday-manager__works,
        .birthday-manager__workspace,
        .birthday-manager__characters,
        .birthday-manager__editor {
          min-width: 0;
        }

        .birthday-manager__works {
          position: sticky;
          top: 18px;
        }

        .birthday-manager__workspace {
          display: grid;
          gap: 18px;
        }

        .birthday-manager__work,
        .birthday-manager__character {
          padding: 8px;
          background: rgba(255, 253, 246, 0.32);
        }

        .birthday-manager__work .nav,
        .birthday-manager__character .nav {
          min-height: 54px;
        }

        .birthday-manager__work-form,
        .birthday-manager__image-import,
        .birthday-manager__crop {
          border: 1px solid rgba(255, 255, 255, 0.36);
          border-radius: 22px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.25);
        }

        .birthday-manager__editor {
          background:
            radial-gradient(circle at 92% 8%, rgba(198, 130, 72, 0.15), transparent 18rem),
            rgba(255, 250, 238, 0.58);
        }

        .birthday-manager__previews {
          grid-template-columns: repeat(2, minmax(220px, 1fr));
        }

        .birthday-manager__preview {
          min-height: 260px;
        }

        .birthday-manager__preview img {
          width: 100%;
          max-height: 320px;
          object-fit: contain;
          border: 1px solid rgba(255, 255, 255, 0.54);
          border-radius: 18px;
          background:
            linear-gradient(45deg, rgba(86, 61, 35, 0.06) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(86, 61, 35, 0.06) 25%, transparent 25%),
            rgba(255, 255, 255, 0.38);
          background-position:
            0 0,
            0 10px;
          background-size: 20px 20px;
          box-shadow: 0 14px 32px rgba(72, 48, 25, 0.1);
        }

        .birthday-manager__preview:first-child img {
          aspect-ratio: 1;
          max-width: 220px;
          object-fit: cover;
        }

        .birthday-manager__image-import {
          align-items: end;
        }

        .birthday-manager__crop {
          align-items: end;
        }

        @media (max-width: 980px) {
          .shell,
          .editor-layout,
          .birthday-manager__layout {
            grid-template-columns: 1fr;
          }

          .shell {
            padding: 12px;
          }

          .sidebar,
          .birthday-manager__works {
            position: static;
            height: auto;
          }

          .sidebar {
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
          }

          .brand {
            width: 100%;
          }

          .nav {
            width: auto;
            flex: 1 1 170px;
          }

          .content-item .nav {
            width: 100%;
          }
        }

        @media (max-width: 680px) {
          .main-panel {
            padding: 0 0 18px;
          }

          .panel {
            border-radius: 22px;
            padding: 18px;
          }

          .toolbar {
            align-items: stretch;
          }

          .primary-button,
          .secondary-button {
            width: 100%;
          }

          .birthday-manager__stats,
          .birthday-manager__previews {
            grid-template-columns: 1fr;
          }

          .birthday-manager__preview:first-child img {
            max-width: 100%;
          }
        }
      `}</style>
      <App />
    </>
  </React.StrictMode>
);
