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

  const enterSite = () => {
    window.sessionStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  const leaveSite = () => {
    window.location.href = "https://www.bilibili.com/video/BV1L4421S7Kr";
  };

  return (
    <div className="splash-screen" data-splash-screen>
      <div className="splash-screen__backdrop" />
      <section className="splash-screen__panel glass-card" aria-label="年龄确认">
        <p className="splash-screen__notice">このWebサイトは18歳未満の方には有害な情報を一切含んでおりません。</p>
        <p className="splash-screen__question">あなたは18歳以上ですか？</p>
        <div className="splash-screen__actions">
          <button className="splash-screen__button" onClick={enterSite} type="button">
            <span>YES</span>
            <small>はい</small>
          </button>
          <button className="splash-screen__button" onClick={leaveSite} type="button">
            <span>NO</span>
            <small>いいえ</small>
          </button>
        </div>
      </section>
    </div>
  );
}
