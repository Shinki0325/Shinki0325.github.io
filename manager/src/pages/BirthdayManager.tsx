import { useEffect, useState } from "react";
import {
  copyBirthdayImage,
  cropBirthdayAvatar,
  deleteBirthdayCharacter,
  getBirthdayData,
  saveBirthdayCharacter,
  saveBirthdayWork,
  uploadBirthdayImage
} from "../api";
import type {
  BirthdayAvatarCrop,
  BirthdayCharacterDraft,
  BirthdayDataResponse,
  BirthdayDate,
  BirthdayGender,
  BirthdayImageKind,
  BirthdayWorkDraft
} from "../types";

const EMPTY_WORK: BirthdayWorkDraft = {
  id: "",
  title: "",
  localizedTitle: "",
  sourceUrl: ""
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });

const getWorkSourceUrl = (works: BirthdayWorkDraft[], workId: string) =>
  works.find((work) => work.id === workId)?.sourceUrl ?? "";

const makeEmptyCharacter = (workId: string, works: BirthdayWorkDraft[]): BirthdayCharacterDraft => ({
  id: "",
  workId,
  name: "",
  reading: "",
  birthday: "01-01",
  gender: "female",
  avatar: null,
  image: null,
  sourceUrl: getWorkSourceUrl(works, workId),
  sourceId: "",
  bangumiId: "",
  verificationStatus: "verified"
});

export default function BirthdayManager() {
  const [data, setData] = useState<BirthdayDataResponse | null>(null);
  const [selectedWorkId, setSelectedWorkId] = useState("");
  const [workForm, setWorkForm] = useState<BirthdayWorkDraft>(EMPTY_WORK);
  const [characterSearch, setCharacterSearch] = useState("");
  const [editor, setEditor] = useState<BirthdayCharacterDraft | null>(null);
  const [sourcePath, setSourcePath] = useState("");
  const [crop, setCrop] = useState<BirthdayAvatarCrop>({ x: 0, y: 0, size: 512 });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void getBirthdayData()
      .then((response) => {
        setData(response);
        setSelectedWorkId((current) => current || response.works[0]?.id || "");
        setMessage(null);
      })
      .catch((error: Error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    if (!data) {
      return;
    }

    const selectedWork = data.works.find((work) => work.id === selectedWorkId);
    setWorkForm(selectedWork ? { ...selectedWork } : EMPTY_WORK);
  }, [data, selectedWorkId]);

  const works = data?.works ?? [];
  const characters = data?.characters ?? [];
  const stats = data?.stats;
  const selectedWork = works.find((work) => work.id === selectedWorkId) ?? null;
  const selectedWorkCharacters = characters.filter((character) => character.workId === selectedWorkId);
  const searchTerm = characterSearch.trim().toLowerCase();
  const visibleCharacters = selectedWorkCharacters.filter((character) => {
    if (!searchTerm) {
      return true;
    }

    return [character.id, character.name, character.reading ?? ""].some((value) =>
      value.toLowerCase().includes(searchTerm)
    );
  });

  const updateData = (response: BirthdayDataResponse) => {
    setData(response);
    setSelectedWorkId((current) => {
      if (current && response.works.some((work) => work.id === current)) {
        return current;
      }
      return response.works[0]?.id ?? "";
    });
  };

  const updateEditor = <K extends keyof BirthdayCharacterDraft>(key: K, value: BirthdayCharacterDraft[K]) => {
    setEditor((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateEditorImage = (character: BirthdayCharacterDraft, kind: BirthdayImageKind, url: string) => {
    setEditor((current) =>
      current && current.id === character.id && current.workId === character.workId
        ? { ...current, [kind]: url }
        : current
    );
    setData((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        characters: current.characters.map((item) =>
          item.id === character.id && item.workId === character.workId
            ? { ...item, [kind]: url }
            : item
        )
      };
    });
  };

  const handleSaveWork = async () => {
    try {
      const response = await saveBirthdayWork(workForm);
      updateData(response);
      setSelectedWorkId(workForm.id);
      setMessage(`已保存作品 ${workForm.title || workForm.id}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleSelectCharacter = (character: BirthdayCharacterDraft) => {
    setEditor({ ...character });
    setMessage(null);
  };

  const handleNewCharacter = () => {
    const workId = selectedWorkId || works[0]?.id || "";
    setEditor(makeEmptyCharacter(workId, works));
    setMessage("已创建空白角色草稿");
  };

  const handleSaveCharacter = async () => {
    if (!editor) {
      return;
    }

    try {
      const response = await saveBirthdayCharacter(editor);
      updateData(response);
      setSelectedWorkId(editor.workId);
      setEditor({ ...editor });
      setMessage(`已保存角色 ${editor.name || editor.id}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleDeleteCharacter = async () => {
    if (!editor) {
      return;
    }

    if (!window.confirm(`确认删除 ${editor.name || editor.id}？`)) {
      return;
    }

    try {
      const response = await deleteBirthdayCharacter(editor.id);
      updateData(response);
      setEditor(null);
      setMessage("已删除角色");
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const requireEditableCharacter = () => {
    if (!editor) {
      setMessage("请先选择或新建角色。");
      return null;
    }

    if (!editor.id || !editor.workId) {
      setMessage("请先填写角色 ID 和作品 ID。");
      return null;
    }

    return editor;
  };

  const handleUploadImage = async (file: File | null, kind: BirthdayImageKind) => {
    const character = requireEditableCharacter();
    if (!character || !file) {
      return;
    }

    if (file.type !== "image/webp") {
      setMessage("请上传 WebP 图片，或使用本机路径导入。");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const result = await uploadBirthdayImage(dataUrl, character.workId, character.id, kind);
      updateEditorImage(character, kind, result.url);
      setMessage(`已上传${kind === "avatar" ? "头像" : "大图"} ${result.url}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleCopyImage = async (kind: BirthdayImageKind) => {
    const character = requireEditableCharacter();
    if (!character) {
      return;
    }

    try {
      const result = await copyBirthdayImage(sourcePath, character.workId, character.id, kind);
      updateEditorImage(character, kind, result.url);
      setMessage(`已导入${kind === "avatar" ? "头像" : "大图"} ${result.url}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleCropAvatar = async () => {
    const character = requireEditableCharacter();
    if (!character) {
      return;
    }

    if (!character.image) {
      setMessage("请先为角色设置大图。");
      return;
    }

    try {
      const result = await cropBirthdayAvatar(character.image, character.workId, character.id, crop);
      updateEditorImage(character, "avatar", result.url);
      setMessage(`已裁切头像 ${result.url}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <main className="page birthday-manager">
      <section className="panel stack birthday-manager__hero">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Birthdays</p>
            <h1>生日角色</h1>
            <p>维护作品、角色生日、Bangumi ID 与本地 WebP 图片资源。</p>
          </div>
          <button className="primary-button" onClick={handleNewCharacter} type="button">
            新建角色
          </button>
        </div>

        <dl className="meta-grid birthday-manager__stats">
          <div>
            <dt>作品</dt>
            <dd>{stats?.works ?? 0}</dd>
          </div>
          <div>
            <dt>角色</dt>
            <dd>{stats?.characters ?? 0}</dd>
          </div>
          <div>
            <dt>缺头像</dt>
            <dd>{stats?.missingAvatar ?? 0}</dd>
          </div>
          <div>
            <dt>缺大图</dt>
            <dd>{stats?.missingImage ?? 0}</dd>
          </div>
        </dl>

        {message ? <p className={message.startsWith("Request failed") ? "error" : "hint"}>{message}</p> : null}
      </section>

      <section className="editor-layout birthday-manager__layout">
        <aside className="panel stack birthday-manager__works">
          <div>
            <p className="eyebrow">Works</p>
            <h2>作品列表</h2>
          </div>

          <ul className="content-list compact">
            {works.map((work) => (
              <li key={work.id} className="content-item birthday-manager__work">
                <button
                  className={work.id === selectedWorkId ? "nav active" : "nav"}
                  onClick={() => setSelectedWorkId(work.id)}
                  type="button"
                >
                  <span>{work.localizedTitle || work.title || work.id}</span>
                  <span className="pill">
                    {data?.stats.characterCountByWork?.[work.id] ??
                      characters.filter((character) => character.workId === work.id).length}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="stack birthday-manager__work-form">
            <div className="toolbar">
              <h2>作品编辑</h2>
              <button className="secondary-button" onClick={() => setWorkForm(EMPTY_WORK)} type="button">
                清空
              </button>
            </div>
            <label className="field">
              <span>作品 ID</span>
              <input value={workForm.id} onChange={(event) => setWorkForm({ ...workForm, id: event.target.value })} />
            </label>
            <label className="field">
              <span>标题</span>
              <input
                value={workForm.title}
                onChange={(event) => setWorkForm({ ...workForm, title: event.target.value })}
              />
            </label>
            <label className="field">
              <span>中文标题</span>
              <input
                value={workForm.localizedTitle ?? ""}
                onChange={(event) => setWorkForm({ ...workForm, localizedTitle: event.target.value })}
              />
            </label>
            <label className="field">
              <span>来源 URL</span>
              <input
                value={workForm.sourceUrl}
                onChange={(event) => setWorkForm({ ...workForm, sourceUrl: event.target.value })}
              />
            </label>
            <button className="primary-button" onClick={handleSaveWork} type="button">
              保存作品
            </button>
          </div>
        </aside>

        <div className="stack birthday-manager__workspace">
          <section className="panel stack birthday-manager__characters">
            <div className="toolbar">
              <div>
                <p className="eyebrow">Characters</p>
                <h2>{selectedWork?.localizedTitle || selectedWork?.title || "角色浏览"}</h2>
              </div>
              <span className="pill muted">{selectedWorkCharacters.length} 人</span>
            </div>

            <label className="field">
              <span>按 ID / 名字 / 读音搜索</span>
              <input value={characterSearch} onChange={(event) => setCharacterSearch(event.target.value)} />
            </label>

            <ul className="content-list compact">
              {visibleCharacters.map((character) => (
                <li key={character.id} className="content-item birthday-manager__character">
                  <button className="nav" onClick={() => handleSelectCharacter(character)} type="button">
                    <span>{character.name || character.id}</span>
                    <span className="meta-line">
                      {character.birthday} · {character.reading || "未填写读音"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel stack birthday-manager__editor">
            <div className="toolbar">
              <div>
                <p className="eyebrow">Editor</p>
                <h2>角色编辑</h2>
              </div>
              <div className="actions">
                <button className="primary-button" disabled={!editor} onClick={handleSaveCharacter} type="button">
                  保存角色
                </button>
                <button className="secondary-button" disabled={!editor} onClick={handleDeleteCharacter} type="button">
                  删除角色
                </button>
              </div>
            </div>

            {editor ? (
              <>
                <div className="grid-form birthday-manager__character-form">
                  <label className="field">
                    <span>ID</span>
                    <input value={editor.id} onChange={(event) => updateEditor("id", event.target.value)} />
                  </label>
                  <label className="field">
                    <span>作品</span>
                    <select
                      value={editor.workId}
                      onChange={(event) => {
                        const workId = event.target.value;
                        setEditor((current) =>
                          current
                            ? {
                                ...current,
                                workId,
                                sourceUrl: current.sourceUrl || getWorkSourceUrl(works, workId)
                              }
                            : current
                        );
                      }}
                    >
                      {works.map((work) => (
                        <option key={work.id} value={work.id}>
                          {work.localizedTitle || work.title || work.id}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>名字</span>
                    <input value={editor.name} onChange={(event) => updateEditor("name", event.target.value)} />
                  </label>
                  <label className="field">
                    <span>读音</span>
                    <input value={editor.reading ?? ""} onChange={(event) => updateEditor("reading", event.target.value)} />
                  </label>
                  <label className="field">
                    <span>生日</span>
                    <input
                      value={editor.birthday}
                      onChange={(event) => updateEditor("birthday", event.target.value as BirthdayDate)}
                    />
                  </label>
                  <label className="field">
                    <span>性别</span>
                    <select
                      value={editor.gender}
                      onChange={(event) => updateEditor("gender", event.target.value as BirthdayGender)}
                    >
                      <option value="female">female</option>
                      <option value="male">male</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Bangumi ID</span>
                    <input value={editor.bangumiId ?? ""} onChange={(event) => updateEditor("bangumiId", event.target.value)} />
                  </label>
                  <label className="field">
                    <span>sourceId</span>
                    <input value={editor.sourceId ?? ""} onChange={(event) => updateEditor("sourceId", event.target.value)} />
                  </label>
                  <label className="field field-span">
                    <span>sourceUrl</span>
                    <input value={editor.sourceUrl} onChange={(event) => updateEditor("sourceUrl", event.target.value)} />
                  </label>
                </div>

                <section className="stack birthday-manager__images">
                  <div>
                    <p className="eyebrow">Images</p>
                    <h2>图片资源</h2>
                  </div>

                  <div className="meta-grid birthday-manager__previews">
                    <div className="preview birthday-manager__preview">
                      <dt>头像</dt>
                      {editor.avatar ? <img alt={`${editor.name} 头像`} src={editor.avatar} /> : <dd>未设置头像</dd>}
                      <label className="field">
                        <span>上传头像 WebP</span>
                        <input
                          accept="image/webp"
                          type="file"
                          onChange={(event) => void handleUploadImage(event.target.files?.[0] ?? null, "avatar")}
                        />
                      </label>
                    </div>
                    <div className="preview birthday-manager__preview">
                      <dt>大图</dt>
                      {editor.image ? <img alt={`${editor.name} 大图`} src={editor.image} /> : <dd>未设置大图</dd>}
                      <label className="field">
                        <span>上传大图 WebP</span>
                        <input
                          accept="image/webp"
                          type="file"
                          onChange={(event) => void handleUploadImage(event.target.files?.[0] ?? null, "image")}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid-form birthday-manager__image-import">
                    <label className="field field-span">
                      <span>本机源路径</span>
                      <input
                        placeholder="例如 /mnt/d/materials/character.webp"
                        value={sourcePath}
                        onChange={(event) => setSourcePath(event.target.value)}
                      />
                    </label>
                    <div className="actions">
                      <button className="secondary-button" onClick={() => void handleCopyImage("image")} type="button">
                        导入为大图
                      </button>
                      <button className="secondary-button" onClick={() => void handleCopyImage("avatar")} type="button">
                        导入为头像
                      </button>
                    </div>
                  </div>

                  <div className="grid-form birthday-manager__crop">
                    <div className="field-span">
                      <p className="eyebrow">头像裁切</p>
                      <h2>从大图裁切头像</h2>
                    </div>
                    <label className="field">
                      <span>x</span>
                      <input
                        min="0"
                        type="number"
                        value={crop.x}
                        onChange={(event) => setCrop({ ...crop, x: Number(event.target.value) })}
                      />
                    </label>
                    <label className="field">
                      <span>y</span>
                      <input
                        min="0"
                        type="number"
                        value={crop.y}
                        onChange={(event) => setCrop({ ...crop, y: Number(event.target.value) })}
                      />
                    </label>
                    <label className="field">
                      <span>size</span>
                      <input
                        min="1"
                        type="number"
                        value={crop.size}
                        onChange={(event) => setCrop({ ...crop, size: Number(event.target.value) })}
                      />
                    </label>
                    <div className="actions">
                      <button className="primary-button" onClick={handleCropAvatar} type="button">
                        裁切头像
                      </button>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <p className="hint">请选择一个角色，或点击“新建角色”开始编辑。</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
