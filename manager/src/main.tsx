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
          grid-template-columns: 220px minmax(0, 1fr);
          min-height: 100vh;
          padding: 14px;
          gap: 14px;
          position: relative;
        }

        .sidebar {
          position: sticky;
          top: 14px;
          height: calc(100vh - 28px);
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.38);
          border-radius: 24px;
          background: rgba(77, 57, 38, 0.42);
          box-shadow: 0 24px 70px rgba(74, 50, 26, 0.18);
          backdrop-filter: blur(22px);
          color: #fff7e8;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .brand {
          margin: 0 0 6px;
          padding: 16px 15px;
          border: 1px solid rgba(255, 226, 181, 0.28);
          border-radius: 24px;
          background:
            radial-gradient(circle at 20% 18%, rgba(255, 217, 150, 0.34), transparent 58%),
            linear-gradient(135deg, #211711 0%, #5d3d26 58%, #8c5d30 100%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 18px 40px rgba(36, 25, 16, 0.28);
          color: #fff1d7;
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .nav {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 14px;
          padding: 9px 11px;
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
          padding: 4px 4px 22px;
        }

        .page {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .panel {
          border: 1px solid rgba(255, 255, 255, 0.48);
          border-radius: 24px;
          padding: 18px;
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
          font-size: clamp(2rem, 3.3vw, 3.1rem);
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

        .field-title {
          display: inline-flex;
          color: #59442f;
          font-size: 0.92rem;
          font-weight: 800;
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

        .meta-area--compact {
          min-height: 78px;
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
          padding: 8px 14px;
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
          gap: 14px;
        }

        .birthday-manager__hero {
          overflow: hidden;
          position: relative;
          min-height: 138px;
          display: grid;
          grid-template-columns: minmax(240px, 0.74fr) minmax(0, 1.26fr);
          gap: 14px;
          align-items: stretch;
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
          gap: 10px;
        }

        .birthday-manager__stats div {
          min-height: 98px;
          padding: 14px;
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.54), rgba(255, 235, 203, 0.42));
        }

        .birthday-manager__message {
          grid-column: 1 / -1;
          overflow-wrap: anywhere;
          font-size: 0.9rem;
        }

        .birthday-manager__global-search {
          grid-column: 1 / -1;
          min-width: 0;
        }

        .birthday-manager__global-search input {
          min-height: 38px;
          padding: 8px 12px;
        }

        .birthday-manager__layout {
          grid-template-columns: minmax(220px, 0.52fr) minmax(0, 1.48fr);
          gap: 14px;
        }

        .birthday-manager__works,
        .birthday-manager__workspace,
        .birthday-manager__characters,
        .birthday-manager__editor {
          min-width: 0;
        }

        .birthday-manager__works {
          position: sticky;
          top: 14px;
        }

        .birthday-manager__workspace {
          display: grid;
          gap: 14px;
        }

        .birthday-manager__work,
        .birthday-manager__character {
          padding: 4px;
          background: rgba(255, 253, 246, 0.32);
        }

        .birthday-manager__work .nav,
        .birthday-manager__character .nav {
          min-height: 38px;
        }

        .birthday-manager__character-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .birthday-manager__character .nav {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 7px;
          padding: 8px 9px;
        }

        .birthday-manager__character .nav > span:first-child {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .birthday-manager__work-form,
        .birthday-manager__crop {
          border: 1px solid rgba(255, 255, 255, 0.36);
          border-radius: 22px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.25);
        }

        .birthday-manager__editor {
          background:
            radial-gradient(circle at 92% 8%, rgba(198, 130, 72, 0.15), transparent 18rem),
            rgba(255, 250, 238, 0.58);
        }

        .birthday-manager__image-workbench {
          display: grid;
          grid-template-columns: minmax(180px, 0.34fr) minmax(0, 0.66fr);
          gap: 12px;
        }

        .birthday-manager__preview {
          min-height: 0;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.36);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.25);
        }

        .birthday-manager__preview img {
          width: 100%;
          max-height: 270px;
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
          max-width: 180px;
          object-fit: cover;
        }

        .birthday-manager__upload-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .birthday-manager__upload-button input {
          position: absolute;
          inset: 0;
          cursor: pointer;
          opacity: 0;
        }

        .birthday-manager__crop-card {
          gap: 10px;
        }

        .birthday-manager__crop {
          align-items: end;
        }

        .birthday-manager__crop-stage {
          position: relative;
          width: fit-content;
          max-width: 100%;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.58);
          border-radius: 20px;
          background:
            linear-gradient(45deg, rgba(86, 61, 35, 0.07) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(86, 61, 35, 0.07) 25%, transparent 25%),
            rgba(255, 255, 255, 0.36);
          background-position:
            0 0,
            0 10px;
          background-size: 20px 20px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.42), 0 16px 38px rgba(72, 48, 25, 0.12);
          cursor: crosshair;
          touch-action: none;
          user-select: none;
        }

        .birthday-manager__crop-source {
          display: block;
          width: auto;
          max-width: 100%;
          max-height: 520px;
          object-fit: contain;
        }

        .birthday-manager__crop-frame {
          position: absolute;
          border: 2px solid rgba(255, 255, 255, 0.96);
          border-radius: 16px;
          box-shadow:
            0 0 0 9999px rgba(33, 23, 14, 0.28),
            inset 0 0 0 1px rgba(77, 42, 18, 0.28),
            0 12px 30px rgba(39, 26, 14, 0.24);
          cursor: grab;
          touch-action: none;
        }

        .birthday-manager__crop-frame:active {
          cursor: grabbing;
        }

        .birthday-manager__crop-handle {
          position: absolute;
          right: -9px;
          bottom: -9px;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.98);
          border-radius: 50%;
          background: linear-gradient(135deg, #2c2118, #d27b45);
          box-shadow: 0 8px 18px rgba(39, 26, 14, 0.26);
          cursor: nwse-resize;
        }

        .image-cropper {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.36);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.25);
        }

        .image-cropper__stage {
          position: relative;
          width: fit-content;
          max-width: 100%;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.58);
          border-radius: 18px;
          background:
            linear-gradient(45deg, rgba(86, 61, 35, 0.07) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(86, 61, 35, 0.07) 25%, transparent 25%),
            rgba(255, 255, 255, 0.36);
          background-position:
            0 0,
            0 10px;
          background-size: 20px 20px;
          cursor: crosshair;
          touch-action: none;
          user-select: none;
        }

        .image-cropper__source {
          display: block;
          width: auto;
          max-width: 100%;
          max-height: 460px;
          object-fit: contain;
        }

        .image-cropper__frame {
          position: absolute;
          border: 2px solid rgba(255, 255, 255, 0.96);
          border-radius: 14px;
          box-shadow:
            0 0 0 9999px rgba(33, 23, 14, 0.28),
            inset 0 0 0 1px rgba(77, 42, 18, 0.28),
            0 12px 30px rgba(39, 26, 14, 0.24);
          cursor: grab;
          touch-action: none;
        }

        .image-cropper__handle {
          position: absolute;
          right: -9px;
          bottom: -9px;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.98);
          border-radius: 50%;
          background: linear-gradient(135deg, #2c2118, #d27b45);
          box-shadow: 0 8px 18px rgba(39, 26, 14, 0.26);
          cursor: nwse-resize;
        }

        .advanced-panel {
          border: 1px solid rgba(125, 91, 52, 0.16);
          border-radius: 20px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.22);
        }

        .advanced-panel summary {
          cursor: pointer;
          color: #5f452a;
          font-weight: 900;
        }

        .advanced-panel > * + * {
          margin-top: 12px;
        }

        .dashboard-page {
          gap: 16px;
        }

        .dashboard-hero {
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 18px;
          align-items: end;
          min-height: 178px;
          background:
            radial-gradient(circle at 86% 18%, rgba(255, 199, 111, 0.34), transparent 18rem),
            linear-gradient(135deg, rgba(255, 252, 244, 0.74), rgba(246, 222, 188, 0.52));
        }

        .dashboard-hero::after {
          position: absolute;
          right: -80px;
          bottom: -100px;
          width: 260px;
          height: 260px;
          border: 1px solid rgba(114, 75, 35, 0.1);
          border-radius: 50%;
          content: "";
          background: rgba(255, 255, 255, 0.18);
        }

        .dashboard-hero > * {
          position: relative;
          z-index: 1;
        }

        .dashboard-hero p:not(.eyebrow) {
          max-width: 880px;
          margin-top: 10px;
          color: #5d4936;
          font-size: 1.05rem;
          font-weight: 700;
          line-height: 1.6;
        }

        .dashboard-hero__badge {
          display: grid;
          place-items: center;
          min-width: 138px;
          min-height: 138px;
          border: 1px solid rgba(255, 255, 255, 0.48);
          border-radius: 36px;
          background:
            radial-gradient(circle at 35% 20%, rgba(255, 226, 172, 0.44), transparent 5rem),
            rgba(77, 51, 29, 0.72);
          box-shadow: 0 22px 48px rgba(82, 48, 22, 0.2);
          color: #fff7e8;
        }

        .dashboard-hero__badge strong {
          font-size: 2.4rem;
          line-height: 1;
        }

        .dashboard-hero__badge span {
          font-size: 0.85rem;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
          gap: 14px;
          align-items: stretch;
        }

        .dashboard-card {
          min-width: 0;
        }

        .dashboard-card--wide {
          background:
            linear-gradient(135deg, rgba(255, 253, 246, 0.62), rgba(255, 239, 211, 0.42));
        }

        .dashboard-paths {
          display: grid;
          gap: 10px;
        }

        .dashboard-paths div {
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.42);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.26);
        }

        .dashboard-paths dt {
          margin-bottom: 5px;
          color: #7b6040;
          font-size: 0.78rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .dashboard-paths dd {
          overflow-wrap: anywhere;
          color: #2f2318;
          font-weight: 900;
        }

        .dashboard-metrics {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .dashboard-metric {
          min-height: 112px;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.44);
          border-radius: 20px;
          background:
            radial-gradient(circle at 80% 12%, rgba(255, 204, 122, 0.22), transparent 7rem),
            rgba(255, 255, 255, 0.28);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.34);
        }

        .dashboard-metric strong,
        .dashboard-metric span,
        .dashboard-metric small {
          display: block;
        }

        .dashboard-metric strong {
          font-size: 2rem;
          line-height: 1;
        }

        .dashboard-metric span {
          margin-top: 8px;
          color: #59442f;
          font-weight: 900;
        }

        .dashboard-metric small {
          margin-top: 4px;
          color: #7b6040;
          font-weight: 700;
        }

        .dashboard-workflow {
          background:
            radial-gradient(circle at 95% 8%, rgba(194, 112, 62, 0.14), transparent 20rem),
            rgba(255, 250, 238, 0.58);
        }

        .dashboard-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .dashboard-action {
          min-height: 132px;
          border: 1px solid rgba(127, 91, 52, 0.16);
          border-radius: 22px;
          padding: 18px;
          text-align: left;
          color: #4b3824;
          background: rgba(255, 252, 244, 0.44);
          box-shadow: 0 12px 28px rgba(84, 58, 31, 0.08);
          cursor: pointer;
          transition:
            transform 160ms ease,
            background 160ms ease,
            box-shadow 160ms ease;
        }

        .dashboard-action:hover:not(:disabled) {
          transform: translateY(-2px);
          background: rgba(255, 252, 244, 0.7);
          box-shadow: 0 18px 34px rgba(84, 58, 31, 0.12);
        }

        .dashboard-action:disabled {
          cursor: wait;
          opacity: 0.62;
        }

        .dashboard-action strong,
        .dashboard-action span {
          display: block;
        }

        .dashboard-action strong {
          font-size: 1.12rem;
          font-weight: 900;
        }

        .dashboard-action span {
          margin-top: 8px;
          color: #6f563a;
          font-size: 0.86rem;
          font-weight: 700;
          line-height: 1.5;
        }

        .dashboard-result {
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.48);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.28);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.34);
        }

        .dashboard-result--success {
          border-color: rgba(90, 132, 50, 0.24);
          background:
            radial-gradient(circle at 92% 12%, rgba(142, 190, 92, 0.2), transparent 16rem),
            rgba(249, 255, 240, 0.34);
        }

        .dashboard-result--warning {
          border-color: rgba(190, 126, 45, 0.26);
          background:
            radial-gradient(circle at 92% 12%, rgba(255, 190, 91, 0.22), transparent 16rem),
            rgba(255, 248, 235, 0.36);
        }

        .dashboard-result--error {
          border-color: rgba(166, 67, 45, 0.26);
          background:
            radial-gradient(circle at 92% 12%, rgba(218, 94, 68, 0.18), transparent 16rem),
            rgba(255, 243, 238, 0.4);
        }

        .dashboard-preview-link {
          display: inline-flex;
          width: fit-content;
          margin-top: 12px;
          border: 1px solid rgba(73, 43, 20, 0.16);
          border-radius: 999px;
          padding: 9px 14px;
          background: linear-gradient(135deg, rgba(44, 33, 24, 0.92), rgba(137, 83, 42, 0.86));
          box-shadow: 0 14px 28px rgba(91, 48, 22, 0.18);
          color: #fff5e2;
          font-weight: 900;
          text-decoration: none;
        }

        .dashboard-result__items {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding: 0;
          margin: 12px 0 0;
          list-style: none;
        }

        .dashboard-result__items li {
          padding: 7px 10px;
          border: 1px solid rgba(125, 91, 52, 0.14);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.34);
          color: #4c3a25;
          font-weight: 800;
        }

        .dashboard-raw-output {
          max-height: 280px;
          overflow: auto;
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          font-family: "Cascadia Mono", Consolas, "Courier New", monospace;
          font-size: 0.86rem;
          line-height: 1.55;
        }

        .dashboard-history {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 10px;
        }

        .page-builder__tabs {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          padding: 8px;
          border: 1px solid rgba(125, 91, 52, 0.14);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.2);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.34);
        }

        .page-builder__tab {
          min-height: 74px;
          border: 1px solid rgba(127, 91, 52, 0.14);
          border-radius: 18px;
          padding: 12px 14px;
          text-align: left;
          color: #62462b;
          background: rgba(255, 252, 244, 0.4);
          cursor: pointer;
          transition:
            background 160ms ease,
            box-shadow 160ms ease,
            transform 160ms ease,
            border-color 160ms ease;
        }

        .page-builder__tab:hover {
          transform: translateY(-1px);
          background: rgba(255, 252, 244, 0.66);
        }

        .page-builder__tab.is-active {
          border-color: rgba(119, 71, 31, 0.34);
          background:
            radial-gradient(circle at 16% 18%, rgba(255, 210, 133, 0.36), transparent 9rem),
            linear-gradient(135deg, rgba(79, 49, 27, 0.92), rgba(184, 101, 51, 0.86));
          box-shadow: 0 16px 34px rgba(84, 48, 24, 0.18);
          color: #fff7e8;
        }

        .page-builder__tab span,
        .page-builder__tab small {
          display: block;
        }

        .page-builder__tab span {
          font-size: 1.02rem;
          font-weight: 900;
        }

        .page-builder__tab small {
          margin-top: 5px;
          line-height: 1.35;
          opacity: 0.78;
        }

        .album-editor__image-workbench,
        .page-builder__home-background,
        .page-builder__background-workbench {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .page-builder__home-background {
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.38);
          border-radius: 22px;
          background:
            radial-gradient(circle at 10% 20%, rgba(255, 201, 111, 0.18), transparent 16rem),
            rgba(255, 255, 255, 0.22);
        }

        .album-editor__selector {
          display: grid;
          grid-template-columns: minmax(260px, 0.44fr) minmax(0, 0.56fr);
          gap: 12px;
          align-items: end;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.38);
          border-radius: 20px;
          background:
            radial-gradient(circle at 12% 18%, rgba(255, 210, 133, 0.2), transparent 14rem),
            rgba(255, 255, 255, 0.22);
        }

        .album-editor__selector .hint {
          padding-bottom: 10px;
        }

        .album-editor__photo-grid,
        .page-builder__music-grid,
        .page-builder__background-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 12px;
        }

        .album-editor__photo-card,
        .page-builder__music-card,
        .page-builder__background-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .album-editor__photo-card img,
        .page-builder__background-card img {
          width: 100%;
          max-height: 220px;
          object-fit: contain;
          border: 1px solid rgba(255, 255, 255, 0.54);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.36);
        }

        .page-builder__background-card img {
          aspect-ratio: 16 / 9;
          object-fit: cover;
        }

        .page-builder__music-grid {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .page-builder__music-fetcher,
        .page-builder__manual-url {
          display: grid;
          grid-template-columns: minmax(220px, 1fr) auto;
          gap: 10px;
          align-items: end;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.38);
          border-radius: 20px;
          background:
            radial-gradient(circle at 8% 24%, rgba(255, 201, 111, 0.18), transparent 18rem),
            rgba(255, 255, 255, 0.24);
        }

        .page-builder__music-card {
          padding: 12px;
        }

        .page-builder__music-card .grid-form {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .page-builder__music-title {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .page-builder__music-title img {
          width: 46px;
          height: 46px;
          flex: 0 0 auto;
          border: 1px solid rgba(255, 255, 255, 0.58);
          border-radius: 14px;
          object-fit: cover;
          background: rgba(255, 255, 255, 0.38);
        }

        .page-builder__music-title strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .page-builder__music-cover-upload {
          align-self: end;
          min-height: 42px;
        }

        @media (max-width: 980px) {
          .shell,
          .editor-layout,
          .birthday-manager__layout,
          .birthday-manager__image-workbench,
          .album-editor__image-workbench,
          .album-editor__selector,
            .page-builder__home-background,
            .page-builder__background-workbench,
            .page-builder__music-fetcher,
            .page-builder__manual-url,
            .page-builder__tabs {
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
          .birthday-manager__previews,
          .birthday-manager__character-grid {
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
