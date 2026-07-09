import { useEffect, useState } from "react";
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
  "--album-scale": string;
  "--album-tilt": string;
};

const albumHash = (slug: string) => `album-${slug}`;

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

const readSlugFromHash = () => window.location.hash.replace(/^#album-/, "");

const stackPhotosForAlbum = (album: Album) => {
  const photos = album.photos.length > 0 ? album.photos : [{ url: album.cover, alt: album.title }];

  return [photos[1] ?? photos[0], photos[0], photos[2] ?? photos[1] ?? photos[0]];
};

export default function PhotoWallClient({ albums }: { albums: Album[] }) {
  const [selectedSlug, setSelectedSlug] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const selectedAlbum = selectedSlug ? (albums.find((album) => album.slug === selectedSlug) ?? null) : null;

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
        setLightboxIndex(null);
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
  }, [lightboxIndex, selectedAlbum]);

  const lightboxPhoto =
    selectedAlbum && lightboxIndex !== null ? selectedAlbum.photos[lightboxIndex] ?? null : null;
  const backgroundImage = selectedAlbum?.cover ?? albums[0]?.cover ?? "";

  return (
    <div className="photowall-shell" data-photowall-shell>
      {backgroundImage ? (
        <div
          aria-hidden="true"
          className="photowall-backdrop"
          data-album-backdrop
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      ) : null}

      <section className="photowall-hero">
        <div className="photowall-hero__copy">
          <h1>照片墙</h1>
          <p>把每一次练习、采风和临摹整理成相纸，留在这片光影走廊里。</p>
        </div>
      </section>

      <div className="photowall-layout">
        <section className="photowall-albums" aria-label="公开相册">
          {albums.length > 0 ? (
            albums.map((album, albumIndex) => {
              const active = selectedAlbum?.slug === album.slug;
              const stackPhotos = stackPhotosForAlbum(album);
              return (
                <article
                  className={`photowall-album-card${active ? " is-active" : ""}`}
                  id={albumHash(album.slug)}
                  key={album.slug}
                  style={
                    {
                      "--album-scale": `${albumIndex % 3 === 0 ? 0.9 : albumIndex % 3 === 1 ? 0.78 : 0.84}`,
                      "--album-tilt": `${albumIndex % 2 === 0 ? -2.5 : 2.2}deg`,
                    } as AlbumCardStyle
                  }
                >
                  <button
                    className="photowall-album-card__button"
                    onClick={() => setSelectedSlug(album.slug)}
                    type="button"
                  >
                    <span className="photowall-album-stack" data-album-stack>
                      {stackPhotos.map((photo, index) => (
                        <span
                          aria-hidden={index !== 1}
                          className={`photowall-polaroid photowall-polaroid--${index + 1}`}
                          data-album-polaroid
                          key={`${album.slug}-${photo.url}-${index}`}
                        >
                          <img alt={index === 1 ? album.title : ""} src={photo.url} />
                        </span>
                      ))}
                    </span>
                    <div className="photowall-album-card__body">
                      <h2>{album.title}</h2>
                      <p>{album.summary}</p>
                      <div className="photowall-album-card__meta">
                        <span>{formatDateBadge(album.date)}</span>
                        <span>{album.photos.length} 张</span>
                      </div>
                    </div>
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

        {selectedAlbum ? (
          <aside className="photowall-detail" data-album-detail>
            <>
              <button
                className="photowall-detail__back"
                onClick={() => {
                  setLightboxIndex(null);
                  setSelectedSlug("");
                }}
                type="button"
              >
                返回相册
              </button>
              <div className="photowall-detail__hero">
                <img alt={selectedAlbum.title} className="photowall-detail__cover" src={selectedAlbum.cover} />
                <div className="photowall-detail__copy">
                  <p className="eyebrow">Album Detail</p>
                  <h2>{selectedAlbum.title}</h2>
                  <p>{selectedAlbum.summary}</p>
                  <dl className="photowall-detail__facts">
                    <div>
                      <dt>发布时间</dt>
                      <dd>{formatDate(selectedAlbum.date)}</dd>
                    </div>
                    <div>
                      <dt>地点</dt>
                      <dd>{selectedAlbum.location ?? "未标注"}</dd>
                    </div>
                    <div>
                      <dt>图片数量</dt>
                      <dd>{selectedAlbum.photos.length} 张</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {selectedAlbum.body ? <p className="photowall-detail__body">{selectedAlbum.body}</p> : null}

              <div className="photowall-photo-grid" data-photo-masonry>
                {selectedAlbum.photos.map((photo, index) => (
                  <button
                    className="photowall-photo-tile"
                    data-photo-tile
                    key={`${photo.url}-${index}`}
                    onClick={() => setLightboxIndex(index)}
                    type="button"
                  >
                    <img alt={photo.alt} src={photo.url} />
                    <div className="photowall-photo-tile__overlay">
                      <strong>{photo.alt}</strong>
                      {photo.caption ? <span>{photo.caption}</span> : null}
                    </div>
                  </button>
                ))}
              </div>
            </>
          </aside>
        ) : null}
      </div>

      {lightboxPhoto && selectedAlbum ? (
        <div
          aria-label={`${selectedAlbum.title} 大图预览`}
          className="photowall-lightbox"
          data-lightbox
          onClick={() => setLightboxIndex(null)}
          role="dialog"
        >
          <div className="photowall-lightbox__frame" onClick={(event) => event.stopPropagation()}>
            <button
              className="photowall-lightbox__close"
              onClick={() => setLightboxIndex(null)}
              type="button"
            >
              关闭
            </button>
            <img
              alt={lightboxPhoto.alt}
              className="photowall-lightbox__image"
              data-lightbox-image
              src={lightboxPhoto.originalUrl ?? lightboxPhoto.url}
            />
            <div className="photowall-lightbox__caption">
              <strong>{lightboxPhoto.alt}</strong>
              {lightboxPhoto.caption ? <p>{lightboxPhoto.caption}</p> : null}
              {lightboxPhoto.credit ? <span>{lightboxPhoto.credit}</span> : null}
            </div>
            {selectedAlbum.photos.length > 1 ? (
              <div className="photowall-lightbox__nav">
                <button
                  onClick={() =>
                    setLightboxIndex((current) =>
                      current === null ? 0 : (current - 1 + selectedAlbum.photos.length) % selectedAlbum.photos.length,
                    )
                  }
                  type="button"
                >
                  上一张
                </button>
                <button
                  onClick={() =>
                    setLightboxIndex((current) =>
                      current === null ? 0 : (current + 1) % selectedAlbum.photos.length,
                    )
                  }
                  type="button"
                >
                  下一张
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
