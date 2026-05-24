import React, { useState } from "react";
import { User, Award, Target, HelpCircle, X, Shield, Settings, Heart, Flame, Upload, Image } from "lucide-react";
import { UserProfile } from "../types";
import { playClick } from "../utils/sound";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
}

const AVAILABLE_AVATARS = [
  "🧑‍🌾", "🥷", "🧙", "🦸", "🤺", "🤠", "👩‍🍳", "🦁", "🐼", "🦊", "🦖", "🍎", "🥦", "🍅", "🥗", "🔥"
];

const AVAILABLE_TITLES = [
  "ベジタブル新兵",
  "オーガニックの護り手",
  "完熟赤トマトの重騎士",
  "森のブロッコリー大将軍",
  "食物繊維ゴッド",
  "カプレーゼ貴族",
  "代謝スパイスの達人"
];

const AVAILABLE_CLANS = [
  "ベジタブル騎士団",
  "マッスルブロッコリーズ",
  "薬膳カレー総本山",
  "オーガニックスイーパーズ",
  "もやし生活互助会"
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [favoriteVeggie, setFavoriteVeggie] = useState(profile.favoriteVeggie);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyGoal);
  const [joinClan, setJoinClan] = useState(profile.joinClan);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("画像のファイルサイズは2MB以下にしてください。");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === "string") {
          setAvatar(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    onSave({
      name: name || "ベジソルジャー",
      title,
      avatar,
      favoriteVeggie,
      dailyGoal: Number(dailyGoal) || 350,
      joinClan
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-950/20"
        id="profile_modal_container"
      >
        {/* ヘッダー */}
        <div className="p-5 border-b border-gray-800/60 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="text-emerald-400" size={18} />
            <span className="text-sm font-black text-gray-200">ソルジャープロフィールの設定</span>
          </div>
          <button
            onClick={() => { playClick(); onClose(); }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* アバターアバター  */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 font-black block mb-1 tracking-wider uppercase">
              アバター (クリックして選択 または 独自アップロード)
            </label>
            <div className="text-center py-3 bg-slate-950 rounded-2xl border border-gray-800/60 mb-2 flex flex-col items-center justify-center min-h-[110px]">
              {avatar.startsWith("data:") || avatar.startsWith("http") ? (
                <img 
                  src={avatar} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/50 shadow-md shadow-emerald-500/20"
                />
              ) : (
                <span className="text-5xl select-none filter drop-shadow">{avatar}</span>
              )}
              <p className="text-[9px] text-emerald-400 font-extrabold mt-1.5">{title}</p>
            </div>
            
            {/* プリセット選択 */}
            <div className="grid grid-cols-8 gap-1.5">
              {AVAILABLE_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => { playClick(); setAvatar(emoji); }}
                  className={`h-9 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                    avatar === emoji
                      ? "bg-emerald-500/10 border-emerald-500/50 border text-emerald-300 scale-105"
                      : "bg-slate-950 hover:bg-slate-800 border border-transparent hover:border-gray-800"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* カスタム画像指定エリア */}
            <div className="mt-4 bg-slate-950/40 p-4 border border-slate-850 rounded-2xl space-y-3">
              <span className="text-[10px] text-emerald-400 font-black block tracking-wider uppercase flex items-center gap-1">
                <Image size={11} className="text-emerald-400" />
                自分の好きな画像（アップロード）
              </span>
              <div className="w-full">
                {/* ファイル選択 */}
                <label className="flex flex-col items-center justify-center border border-dashed border-slate-800 hover:border-emerald-500/40 hover:bg-slate-950/80 rounded-2xl p-4 cursor-pointer bg-slate-950/40 transition-all gap-1.5 text-center group">
                  <Upload size={18} className="text-gray-400 group-hover:text-emerald-400 transition-colors cursor-pointer" />
                  <div>
                    <span className="text-xs font-bold text-gray-300 block">画像をアップロードする</span>
                    <span className="text-[9px] text-gray-500 block mt-0.5">最大 2MB (PNG, JPG)</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* ニックネーム */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-400 font-black block tracking-wider uppercase">
              ソルジャー名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 transition-all font-bold"
              placeholder="あなたのニックネーム"
              maxLength={15}
              required
            />
          </div>

          {/* 称号 */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-400 font-black block tracking-wider uppercase">
              称号・肩書き
            </label>
            <select
              value={title}
              onChange={(e) => { playClick(); setTitle(e.target.value); }}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 transition-all font-bold cursor-pointer"
            >
              {AVAILABLE_TITLES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 好きな野菜 ＆ 野菜目標(g) のグリッド */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-black block tracking-wider uppercase">
                好きな野菜・食材
              </label>
              <input
                type="text"
                value={favoriteVeggie}
                onChange={(e) => setFavoriteVeggie(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 transition-all font-bold"
                placeholder="例: トマト 🍅"
                maxLength={12}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-black block tracking-wider uppercase">
                1日摂取目標 (g)
              </label>
              <input
                type="number"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 transition-all font-mono font-bold"
                placeholder="350"
                min={50}
                max={2000}
              />
            </div>
          </div>

          {/* 所属クランアライアンス */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-400 font-black block tracking-wider uppercase flex items-center gap-1">
              <Shield size={10} className="text-amber-500" />
              所属ギルド・クラン
            </label>
            <div className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-gray-400 font-bold flex items-center justify-between">
              <span>{joinClan || "無所属 (クラン未加入)"}</span>
              <span className="text-[8px] bg-slate-900 border border-slate-800 text-gray-500 px-2 py-0.5 rounded-full font-black">
                変更不可
              </span>
            </div>
            <p className="text-[8.5px] text-gray-500 leading-normal">
              ※ギルド・クランの加入・作成・脱退は、ベース画面の「クラン」施設より行ってくださいなり！
            </p>
          </div>

          {/* 保存 ＆ キャンセル */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => { playClick(); onClose(); }}
              className="flex-1 py-3 px-4 bg-slate-950 border border-slate-850 text-gray-400 hover:text-gray-200 text-xs font-black rounded-xl transition-all cursor-pointer hover:bg-slate-900"
            >
              やめる
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
