import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import type { AssetImageCrop } from "../types";

type ImageUploadCropperProps = {
  title: string;
  hint: string;
  imageUrl: string;
  aspectRatio: number;
  uploadLabel: string;
  cropLabel: string;
  onUpload: (file: File) => void;
  onCrop: (crop: AssetImageCrop) => void;
};

type ImageMetrics = {
  naturalWidth: number;
  naturalHeight: number;
  renderedWidth: number;
  renderedHeight: number;
};

type DragState = {
  mode: "move" | "resize";
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startCrop: AssetImageCrop;
};

const clampNumber = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function ImageUploadCropper({
  title,
  hint,
  imageUrl,
  aspectRatio,
  uploadLabel,
  cropLabel,
  onUpload,
  onCrop
}: ImageUploadCropperProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [metrics, setMetrics] = useState<ImageMetrics | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [crop, setCrop] = useState<AssetImageCrop>({ x: 0, y: 0, width: 1200, height: 800 });

  useEffect(() => {
    setMetrics(null);
    setDrag(null);
  }, [imageUrl]);

  const constrainCrop = (nextCrop: AssetImageCrop, nextMetrics = metrics): AssetImageCrop => {
    if (!nextMetrics) {
      return {
        x: Math.max(0, Math.round(nextCrop.x)),
        y: Math.max(0, Math.round(nextCrop.y)),
        width: Math.max(1, Math.round(nextCrop.width)),
        height: Math.max(1, Math.round(nextCrop.height))
      };
    }

    const maxWidth = Math.min(nextMetrics.naturalWidth, nextMetrics.naturalHeight * aspectRatio);
    const width = clampNumber(Math.round(nextCrop.width), 1, Math.max(1, Math.round(maxWidth)));
    const height = Math.max(1, Math.round(width / aspectRatio));
    const x = clampNumber(Math.round(nextCrop.x), 0, Math.max(0, nextMetrics.naturalWidth - width));
    const y = clampNumber(Math.round(nextCrop.y), 0, Math.max(0, nextMetrics.naturalHeight - height));

    return { x, y, width, height };
  };

  const readMetrics = (): ImageMetrics | null => {
    const image = imageRef.current;
    if (!image || !image.naturalWidth || !image.naturalHeight) {
      return null;
    }

    const rect = image.getBoundingClientRect();
    return {
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      renderedWidth: rect.width,
      renderedHeight: rect.height
    };
  };

  const handleImageLoad = () => {
    const nextMetrics = readMetrics();
    if (!nextMetrics) {
      return;
    }

    const baseWidth = Math.min(nextMetrics.naturalWidth, nextMetrics.naturalHeight * aspectRatio);
    const baseHeight = baseWidth / aspectRatio;
    const centeredCrop = constrainCrop(
      {
        x: (nextMetrics.naturalWidth - baseWidth) / 2,
        y: (nextMetrics.naturalHeight - baseHeight) / 2,
        width: baseWidth,
        height: baseHeight
      },
      nextMetrics
    );

    setMetrics(nextMetrics);
    setCrop(centeredCrop);
  };

  const getFrameStyle = (): CSSProperties => {
    if (!metrics) {
      return { display: "none" };
    }

    const scaleX = metrics.renderedWidth / metrics.naturalWidth;
    const scaleY = metrics.renderedHeight / metrics.naturalHeight;

    return {
      left: `${crop.x * scaleX}px`,
      top: `${crop.y * scaleY}px`,
      width: `${crop.width * scaleX}px`,
      height: `${crop.height * scaleY}px`
    };
  };

  const beginDrag = (event: PointerEvent<HTMLElement>, mode: DragState["mode"], nextCrop = crop) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      mode,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startCrop: nextCrop
    });
  };

  const handleStagePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const nextMetrics = readMetrics();
    const image = imageRef.current;
    if (!nextMetrics || !image) {
      return;
    }

    const rect = image.getBoundingClientRect();
    const nextCrop = constrainCrop(
      {
        ...crop,
        x: ((event.clientX - rect.left) / rect.width) * nextMetrics.naturalWidth - crop.width / 2,
        y: ((event.clientY - rect.top) / rect.height) * nextMetrics.naturalHeight - crop.height / 2
      },
      nextMetrics
    );

    setCrop(nextCrop);
    beginDrag(event, "move", nextCrop);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag || drag.pointerId !== event.pointerId || !metrics) {
      return;
    }

    const scaleX = metrics.renderedWidth / metrics.naturalWidth;
    const scaleY = metrics.renderedHeight / metrics.naturalHeight;
    const deltaX = (event.clientX - drag.startClientX) / scaleX;
    const deltaY = (event.clientY - drag.startClientY) / scaleY;

    if (drag.mode === "resize") {
      setCrop(
        constrainCrop(
          {
            ...drag.startCrop,
            width: drag.startCrop.width + Math.max(deltaX, deltaY * aspectRatio),
            height: (drag.startCrop.width + Math.max(deltaX, deltaY * aspectRatio)) / aspectRatio
          },
          metrics
        )
      );
      return;
    }

    setCrop(
      constrainCrop(
        {
          ...drag.startCrop,
          x: drag.startCrop.x + deltaX,
          y: drag.startCrop.y + deltaY
        },
        metrics
      )
    );
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (drag?.pointerId === event.pointerId) {
      setDrag(null);
    }
  };

  return (
    <div className="image-cropper">
      <div className="toolbar">
        <div>
          <dt>{title}</dt>
          <p className="hint">{hint}</p>
        </div>
        <label className="secondary-button birthday-manager__upload-button">
          {uploadLabel}
          <input
            accept="image/webp,image/png,image/jpeg"
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onUpload(file);
              }
            }}
          />
        </label>
      </div>

      {imageUrl ? (
        <div
          className="image-cropper__stage"
          onPointerCancel={handlePointerEnd}
          onPointerDown={handleStagePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
        >
          <img ref={imageRef} alt={title} className="image-cropper__source" onLoad={handleImageLoad} src={imageUrl} />
          <div className="image-cropper__frame" onPointerDown={(event) => beginDrag(event, "move")} style={getFrameStyle()}>
            <span
              aria-label="调整裁切大小"
              className="image-cropper__handle"
              onPointerDown={(event) => beginDrag(event, "resize")}
              role="button"
              tabIndex={0}
            />
          </div>
        </div>
      ) : (
        <dd>未设置图片</dd>
      )}

      {imageUrl ? (
        <div className="actions">
          <button className="primary-button" onClick={() => onCrop(crop)} type="button">
            {cropLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
