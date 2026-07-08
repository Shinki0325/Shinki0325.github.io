import { useEffect, useState } from "react";

const STORAGE_KEY = "blog-shell-splash-dismissed";

export default function SplashScreen() {
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = window.sessionStorage.getItem(STORAGE_KEY) === "true";
    setIsVisible(!dismissed);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    document.body.classList.toggle("has-splash-screen", isVisible);

    return () => {
      document.body.classList.remove("has-splash-screen");
    };
  }, [isReady, isVisible]);

  if (!isReady || !isVisible) {
    return null;
  }

  return (
    <div className="splash-screen" data-splash-screen>
      <div className="splash-screen__backdrop" />
      <section className="splash-screen__panel glass-card">
        <span className="splash-screen__eyebrow">资料岛外壳</span>
        <h2>欢迎回来</h2>
        <p>音乐、导航和照片墙已经就绪，继续上次的浏览节奏吧。</p>
        <button
          className="splash-screen__button"
          onClick={() => {
            window.sessionStorage.setItem(STORAGE_KEY, "true");
            setIsVisible(false);
          }}
          type="button"
        >
          进入站点
        </button>
      </section>
    </div>
  );
}
