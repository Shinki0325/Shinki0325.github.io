import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";

type AlbumPhoto = {
  url: string;
  originalUrl?: string;
  alt: string;
  caption?: string;
  credit?: string;
  relatedReferences?: string[];
  relatedArticles?: string[];
};

type Album = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  location?: string;
  tags: string[];
  body?: string;
  cover: string;
  photos: AlbumPhoto[];
};

type AlbumCardStyle = CSSProperties & {
  "--album-rise": string;
  "--album-tilt": string;
};

const albumHash = (slug: string) => `album-${encodeURIComponent(slug)}`;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));

const formatDateBadge = (value: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(value))
    .replaceAll("/", "-");

const readSlugFromHash = () => {
  const value = window.location.hash.replace(/^#album-/, "");
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
};

const distinctPhotosForAlbum = (album: Album) => {
  const seen = new Set<string>();
  const photos = [{ url: album.cover, alt: album.title }, ...album.photos].filter((photo) => {
    if (!photo.url || seen.has(photo.url)) return false;
    seen.add(photo.url);
    return true;
  });

  return {
    lead: photos[0] ?? { url: "", alt: album.title },
    backing: photos.slice(1, 3),
  };
};

export default function PhotoWallClient({ albums }: { albums: Album[] }) {
  const [selectedSlug, setSelectedSlug] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const activatedAlbumSlug = useRef("");
  const overviewScrollY = useRef(0);
  const openedPhotoButton = useRef<HTMLButtonElement | null>(null);
  const lightboxCloseButton = useRef<HTMLButtonElement | null>(null);

  const selectedAlbum = selectedSlug ? (albums.find((album) => album.slug === selectedSlug) ?? null) : null;
  const photoCount = albums.reduce((total, album) => total + album.photos.length, 0);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    window.requestAnimationFrame(() => openedPhotoButton.current?.focus());
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      const slug = readSlugFromHash();
      if (slug && albums.some((album) => album.slug === slug)) {
        setSelectedSlug(slug);
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [albums]);

  useEffect(() => {
    if (!selectedAlbum) {
      if (window.location.hash.startsWith("#album-")) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      return;
    }

    if (window.location.hash !== `#${albumHash(selectedAlbum.slug)}`) {
      window.history.replaceState(null, "", `#${albumHash(selectedAlbum.slug)}`);
    }
  }, [selectedAlbum]);

  useEffect(() => {
    if (lightboxIndex === null) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (!selectedAlbum) {
        return;
      }

      if (event.key === "ArrowRight") {
        setLightboxIndex((current) => {
          if (current === null) {
            return 0;
          }

          return (current + 1) % selectedAlbum.photos.length;
        });
      }

      if (event.key === "ArrowLeft") {
        setLightboxIndex((current) => {
          if (current === null) {
            return selectedAlbum.photos.length - 1;
          }

          return (current - 1 + selectedAlbum.photos.length) % selectedAlbum.photos.length;
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeLightbox, lightboxIndex, selectedAlbum]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    lightboxCloseButton.current?.focus();
  }, [lightboxIndex]);

  const lightboxPhoto =
    selectedAlbum && lightboxIndex !== null ? selectedAlbum.photos[lightboxIndex] ?? null : null;

  const openAlbum = (slug: string) => {
    activatedAlbumSlug.current = slug;
    overviewScrollY.current = window.scrollY;
    setSelectedSlug(slug);
  };

  const openLightbox = (index: number, button: HTMLButtonElement) => {
    openedPhotoButton.current = button;
    setLightboxIndex(index);
  };

  const returnToOverview = () => {
    const slug = activatedAlbumSlug.current;
    setLightboxIndex(null);
    setSelectedSlug("");
    window.history.replaceState(null, "", window.location.pathname);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: overviewScrollY.current });
      if (!slug) return;
      rootRef.current
        ?.querySelector<HTMLButtonElement>(`[data-album-slug="${CSS.escape(slug)}"]`)
        ?.focus();
    });
  };

  return (
    <div className="photowall-shell" data-photowall-shell ref={rootRef}>
      {selectedAlbum ? (
        <section className="photowall-detail" data-album-detail>
          <header className="photowall-detail__header">
            <button
              aria-label="返回相册"
              className="photowall-detail__back"
              onClick={returnToOverview}
              title="返回相册"
              type="button"
            >
              <ArrowLeft aria-hidden="true" size={20} strokeWidth={1.8} />
            </button>
            <div className="photowall-detail__copy">
              <p className="eyebrow">PHOTO FILE / {selectedAlbum.photos.length.toString().padStart(2, "0")}</p>
              <h1>{selectedAlbum.title}</h1>
              <p>{selectedAlbum.summary}</p>
            </div>
            <dl className="photowall-detail__facts">
              <div>
                <dt>DATE</dt>
                <dd>{formatDate(selectedAlbum.date)}</dd>
              </div>
              <div>
                <dt>LOCATION</dt>
                <dd>{selectedAlbum.location ?? "未标注"}</dd>
              </div>
              <div>
                <dt>COUNT</dt>
                <dd>{selectedAlbum.photos.length} 张</dd>
              </div>
            </dl>
          </header>

          {selectedAlbum.body ? <p className="photowall-detail__body">{selectedAlbum.body}</p> : null}

          <div className="photowall-photo-grid" data-photo-masonry>
            {selectedAlbum.photos.map((photo, index) => (
              <button
                className="photowall-photo-tile"
                data-photo-tile
                key={`${photo.url}-${index}`}
                onClick={(event) => openLightbox(index, event.currentTarget)}
                type="button"
              >
                <img alt={photo.alt} src={photo.url} />
                <span className="photowall-photo-tile__caption">
                  <strong>{photo.alt}</strong>
                  {photo.caption ? <span>{photo.caption}</span> : null}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <>
          <header className="photowall-masthead" data-photo-special-masthead>
            <div>
              <p className="eyebrow">PHOTO SPECIAL</p>
              <h1>照片墙</h1>
            </div>
            <p className="photowall-masthead__status">
              <span>{albums.length.toString().padStart(2, "0")} ALBUMS</span>
              <span>{photoCount.toString().padStart(2, "0")} PHOTOS</span>
            </p>
          </header>

          <section className="photowall-albums" aria-label="公开相册">
            {albums.length > 0 ? (
              albums.map((album, albumIndex) => {
                const preview = distinctPhotosForAlbum(album);
                return (
                  <article
                    className="photowall-album-card"
                    id={albumHash(album.slug)}
                    key={album.slug}
                    style={
                      {
                        "--album-rise": `${albumIndex % 2 === 0 ? 0 : 18}px`,
                        "--album-tilt": `${albumIndex % 2 === 0 ? -1.8 : 1.6}deg`,
                      } as AlbumCardStyle
                    }
                  >
                    <button
                      className="photowall-album-card__button"
                      data-album-paper
                      data-album-slug={album.slug}
                      onClick={() => openAlbum(album.slug)}
                      type="button"
                    >
                      <span aria-hidden="true" className="photowall-album-card__backings">
                        {preview.backing.map((photo, index) => (
                          <span
                            className={`photowall-album-backing photowall-album-backing--${index + 1}`}
                            data-album-backing
                            key={photo.url}
                          >
                            <img alt="" src={photo.url} />
                          </span>
                        ))}
                      </span>
                      {albumIndex === 0 ? (
                        <span aria-hidden="true" className="photowall-album-card__new" data-album-new>
                          NEW
                        </span>
                      ) : null}
                      <span className="photowall-album-card__image-well">
                        <img alt={preview.lead.alt} src={preview.lead.url} />
                      </span>
                      <span className="photowall-album-card__body">
                        <h2>{album.title}</h2>
                        <p>{album.summary}</p>
                        <span className="photowall-album-card__meta">
                          <span>{formatDateBadge(album.date)}</span>
                          <span>{album.photos.length} 张</span>
                        </span>
                      </span>
                    </button>
                  </article>
                );
              })
            ) : (
              <article className="photowall-empty glass-card">
                <h2>还没有可浏览的相册</h2>
                <p>等相册内容发布后，这里会自动摆出新的相纸。</p>
              </article>
            )}
          </section>
        </>
      )}

      {typeof document !== "undefined" && lightboxPhoto && selectedAlbum ? createPortal(
        <div
          aria-modal="true"
          aria-label={`${selectedAlbum.title} 大图预览`}
          className="photowall-lightbox"
          data-lightbox
          onClick={closeLightbox}
          role="dialog"
        >
          <div className="photowall-lightbox__frame" onClick={(event) => event.stopPropagation()}>
            <button
              aria-label="关闭大图"
              className="photowall-lightbox__close"
              onClick={closeLightbox}
              ref={lightboxCloseButton}
              title="关闭"
              type="button"
            >
              <X aria-hidden="true" size={22} strokeWidth={1.8} />
            </button>
            {selectedAlbum.photos.length > 1 ? (
              <>
                <button
                  aria-label="上一张"
                  className="photowall-lightbox__previous"
                  onClick={() =>
                    setLightboxIndex((current) =>
                      current === null
                        ? 0
                        : (current - 1 + selectedAlbum.photos.length) % selectedAlbum.photos.length,
                    )
                  }
                  title="上一张"
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" size={28} strokeWidth={1.6} />
                </button>
                <button
                  aria-label="下一张"
                  className="photowall-lightbox__next"
                  onClick={() =>
                    setLightboxIndex((current) =>
                      current === null ? 0 : (current + 1) % selectedAlbum.photos.length,
                    )
                  }
                  title="下一张"
                  type="button"
                >
                  <ChevronRight aria-hidden="true" size={28} strokeWidth={1.6} />
                </button>
              </>
            ) : null}
            <img
              alt={lightboxPhoto.alt}
              className="photowall-lightbox__image"
              data-lightbox-image
              src={lightboxPhoto.originalUrl ?? lightboxPhoto.url}
            />
            <div className="photowall-lightbox__caption">
              <div>
                <strong>{lightboxPhoto.alt}</strong>
                {lightboxPhoto.caption ? <p>{lightboxPhoto.caption}</p> : null}
                {lightboxPhoto.credit ? <span>{lightboxPhoto.credit}</span> : null}
              </div>
              <span data-lightbox-count>
                {(lightboxIndex ?? 0) + 1} / {selectedAlbum.photos.length}
              </span>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
