import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Award, 
  ChevronRight, 
  Flame, 
  Shield, 
  Sparkles, 
  Sword, 
  Trophy, 
  User, 
  Check, 
  TrendingUp, 
  Compass, 
  Lock, 
  Info, 
  Users,
  Coins,
  ArrowUp
} from "lucide-react";
import { UserProfile } from "../types";
import { playClick } from "../utils/sound";

interface LevelRankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  expPercent: number;
  userProfile: UserProfile;
}

// 称号・レベル帯のマスターデータ
interface LevelMilestone {
  minLv: number;
  maxLv: number;
  title: string;
  buffText: string;
  bonusText: string;
  icon: string;
  color: string;
}

const LEVEL_MILESTONES: LevelMilestone[] = [
  {
    minLv: 1,
    maxLv: 4,
    title: "ベジタブルビギナー",
    buffText: "攻撃力バフなし",
    bonusText: "ビギナーマーク付与",
    icon: "🌱",
    color: "from-blue-500 to-cyan-400"
  },
  {
    minLv: 5,
    maxLv: 9,
    title: "新鮮ブロンズソルジャー",
    buffText: "ボス攻撃力 +2%",
    bonusText: "ベジコイン獲得量 +1%",
    icon: "🥉",
    color: "from-amber-600 to-amber-500"
  },
  {
    minLv: 10,
    maxLv: 14,
    title: "トマトの見習い騎士",
    buffText: "ボス攻撃力 +5%",
    bonusText: "ベジコイン獲得量 +3%",
    icon: "🍅",
    color: "from-red-500 to-rose-400"
  },
  {
    minLv: 15,
    maxLv: 19,
    title: "アスパラ鉄壁ガード",
    buffText: "ボス攻撃力 +8%",
    bonusText: "ベジコイン獲得量 +5% & ショップの一部アイテム解放",
    icon: "⚔️",
    color: "from-emerald-500 to-teal-400"
  },
  {
    minLv: 20,
    maxLv: 29,
    title: "ベジタブル本格ナイト",
    buffText: "ボス攻撃力 +12%",
    bonusText: "ベジコイン獲得量 +8% & クーポンショップ 5% 割引適用",
    icon: "🛡️",
    color: "from-indigo-500 to-purple-400"
  },
  {
    minLv: 30,
    maxLv: 39,
    title: "完熟ロイヤルガード",
    buffText: "ボス攻撃力 +18%",
    bonusText: "ベジコイン獲得量 +12% & クーポンショップ 10% 割引適用",
    icon: "👑",
    color: "from-amber-500 to-yellow-400"
  },
  {
    minLv: 40,
    maxLv: 49,
    title: "ブロッコリースプライト神",
    buffText: "ボス攻撃力 +25%",
    bonusText: "ベジコイン獲得量 +15% & クーポンショップ 15% 割引 + 限定アイコン解放",
    icon: "🥦",
    color: "from-green-500 to-emerald-400"
  },
  {
    minLv: 50,
    maxLv: 149,
    title: "伝説 of オーガニックロード",
    buffText: "ボス攻撃力 +40%",
    bonusText: "ベジコイン獲得量 +25% & 全クーポン 20% 割引 + 神聖なオーラ枠エフェクト",
    icon: "🌌",
    color: "from-fuchsia-600 to-pink-500"
  },
  {
    minLv: 150,
    maxLv: 499,
    title: "最高峰ベジ・クルセイダー",
    buffText: "ボス攻撃力 +70%",
    bonusText: "ベジコイン獲得量 +40% & 全クーポン 25% 割引 + 神秘なる紫の残像",
    icon: "🔮",
    color: "from-indigo-600 via-fuchsia-550 to-purple-550"
  },
  {
    minLv: 500,
    maxLv: 999,
    title: "天下統一ベジマスター",
    buffText: "ボス攻撃力 +120%",
    bonusText: "ベジコイン獲得量 +60% & 全クーポン 30% 割引 + 黄金の威光オーラ",
    icon: "👑",
    color: "from-yellow-400 via-orange-500 to-amber-600"
  },
  {
    minLv: 1000,
    maxLv: 1001,
    title: "究極のお野菜創世神 (GOD)",
    buffText: "ボス攻撃力 +200%",
    bonusText: "最大レベル1000到達！全特典永久解放 & 銀河の頂点称号",
    icon: "🪐",
    color: "from-cyan-400 via-teal-500 to-emerald-500"
  }
];

// ランキング用のMOCKライバルデータ定義
interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  level: number;
  expPercent: number;
  clan: string;
  isSelf?: boolean;
}

export const LevelRankingModal: React.FC<LevelRankingModalProps> = ({
  isOpen,
  onClose,
  level,
  expPercent,
  userProfile
}) => {
  const [activeSubSection, setActiveSubSection] = useState<"details" | "ranking">("details");

  if (!isOpen) return null;

  // 現在のレベルに対応するマイルストーンを判別
  const currentMilestone = LEVEL_MILESTONES.find(
    m => level >= m.minLv && level <= m.maxLv
  ) || LEVEL_MILESTONES[0];

  // 次のマイルストーンを取得
  const currentMilestoneIndex = LEVEL_MILESTONES.indexOf(currentMilestone);
  const nextMilestone = currentMilestoneIndex < LEVEL_MILESTONES.length - 1 
    ? LEVEL_MILESTONES[currentMilestoneIndex + 1] 
    : null;

  // MOCKライバルを設定（ユーザーの位置は引き渡された level + expPercent で動的に再挿入（ソート）する）
  const baseRivals: Omit<LeaderboardUser, "rank">[] = [
    { name: "ベジタブル将軍", avatar: "🥦", level: 48, expPercent: 95, clan: "オーガニック帝国" },
    { name: "サラダ姫", avatar: "🥗", level: 39, expPercent: 12, clan: "新鮮野菜王国" },
    { name: "薬膳の賢者", avatar: "🧙‍♂️", level: 32, expPercent: 45, clan: "漢方ハーブ同盟" },
    { name: "みどりママ", avatar: "👩‍🍳", level: 28, expPercent: 80, clan: "ベジタブル騎士団" },
    { name: "筋トレ仙人", avatar: "💪", level: 26, expPercent: 20, clan: "大豆プロテインズ" },
    { name: "ベジオタ2世", avatar: "🤓", level: 22, expPercent: 90, clan: "ベジタブル騎士団" },
    { name: "ヘルシー親方", avatar: "🏮", level: 18, expPercent: 60, clan: "無農薬ギルド" },
    { name: "タクマ_23", avatar: "🚴", level: 14, expPercent: 10, clan: "新鮮野菜王国" },
    { name: "オーガニック愛好家", avatar: "🪴", level: 12, expPercent: 55, clan: "無農薬ギルド" },
    { name: "ビタミンマスター", avatar: "🍇", level: 8, expPercent: 40, clan: "大豆プロテインズ" },
    { name: "プチトマトくん", avatar: "🍅", level: 3, expPercent: 70, clan: "ベジタブル騎士団" }
  ];

  // ユーザー自身をマージ
  const selfUser: Omit<LeaderboardUser, "rank"> = {
    name: `${userProfile.name} (あなた)`,
    avatar: userProfile.avatar,
    level: level,
    expPercent: expPercent,
    clan: userProfile.joinClan || "ベジタブル騎士団",
    isSelf: true
  };

  const allUsersWithSelf = [...baseRivals, selfUser].sort((a, b) => {
    if (b.level !== a.level) {
      return b.level - a.level;
    }
    return b.expPercent - a.expPercent;
  });

  // ランキング順位（1から順に配列インデックスを設定）
  const leaderboard: LeaderboardUser[] = allUsersWithSelf.map((user, idx) => ({
    ...user,
    rank: idx + 1
  }));

  // ユーザー自身の現在順位
  const selfRank = leaderboard.find(u => u.isSelf)?.rank || 1;

  // レベルに対応した肩書き（称号）を返す
  const getTitleForLevel = (lv: number) => {
    const found = LEVEL_MILESTONES.find(m => lv >= m.minLv && lv <= m.maxLv);
    return found ? found.title : "ベジソルジャー";
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-slate-900 border border-slate-800/90 max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]"
      >
        {/* ヘッダー */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Trophy size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-200 uppercase tracking-widest leading-none">
                アカウントステータス
              </h2>
              <span className="text-[10px] text-gray-500 font-semibold mt-1 block">
                あなたの野菜戦闘力レベル詳細 ＆ グローバル順位
              </span>
            </div>
          </div>
          <button
            onClick={() => { playClick(); onClose(); }}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        {/* タブ */}
        <div className="flex bg-slate-950/80 px-5 pt-3 border-b border-slate-850">
          <button
            onClick={() => { playClick(); setActiveSubSection("details"); }}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
              activeSubSection === "details"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            📊 レベル詳細・ボーナス
          </button>
          <button
            onClick={() => { playClick(); setActiveSubSection("ranking"); }}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1 ${
              activeSubSection === "ranking"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            🏆 レベルランキング 
            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">
              第{selfRank}位
            </span>
          </button>
        </div>

        {/* モニターコンテンツ */}
        <div className="p-5 overflow-y-auto flex-1 scrollbar-thin space-y-4">
          
          {activeSubSection === "details" && (
            <div className="space-y-4 animate-fadeIn">
              {/* 現在のアカウントステータス要約 */}
              <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none"></div>
                
                {/* 左：巨大円形レベル */}
                <div className="relative w-16 h-16 rounded-full bg-slate-900 border-2 border-emerald-500/30 flex-shrink-0 flex flex-col items-center justify-center shadow-lg">
                  <span className="text-[10px] text-gray-500 font-bold leading-none uppercase">Lv</span>
                  <span className="text-xl font-black text-emerald-400 tracking-tight leading-none mt-1">{level}</span>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black shadow shadow-black">
                    {currentMilestone.icon}
                  </div>
                </div>

                {/* 右：詳細進捗 */}
                <div className="flex-1 space-y-1 bg-slate-950/40 p-1.5 rounded-xl border border-gray-900/60">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-black text-gray-200">
                      {getTitleForLevel(level)}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-gray-400">
                      {expPercent}% (次のLvまで {100 - expPercent}%)
                    </span>
                  </div>

                  {/* 経験値進捗バー */}
                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden relative border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                      style={{ width: `${expPercent}%` }}
                    />
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10" />
                  </div>

                  <p className="text-[9px] text-gray-500 leading-normal">
                    ※お皿ををレイド提出（1日1回限定）したり、新しいヘルシーお題に挑戦すると経験値(1回ごとに+15%〜)ががっつり上がるなりよ！
                  </p>
                </div>
              </div>

              {/* 現在のアカウント特典・バフ */}
              <div className="space-y-2">
                <h3 className="text-[10px] text-gray-500 font-black tracking-widest uppercase flex items-center gap-1.5">
                  <Shield size={12} className="text-emerald-400" />
                  <span>現在のレベル適用ボーナス</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/80 border border-slate-850 p-3 rounded-xl space-y-1 text-center">
                    <span className="text-[9px] text-gray-500 font-extrabold block">⚔️ レイド攻撃力補正</span>
                    <span className="text-sm font-black text-amber-400 font-mono tracking-tight">{currentMilestone.buffText}</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-850 p-3 rounded-xl space-y-1 text-center">
                    <span className="text-[9px] text-gray-500 font-extrabold block">🪙 コイン/ショップ優待</span>
                    <span className="text-xs font-black text-emerald-400 leading-tight block">{currentMilestone.bonusText}</span>
                  </div>
                </div>
              </div>

              {/* レベル別称号報酬ロードマップ */}
              <div className="space-y-2">
                <h3 className="text-[10px] text-gray-500 font-black tracking-widest uppercase flex items-center gap-1.5">
                  <Compass size={12} className="text-emerald-400" />
                  <span>称号・ステータスロードマップ</span>
                </h3>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 border border-slate-850/60 rounded-2xl p-2.5 bg-slate-950/40">
                  {LEVEL_MILESTONES.map((milestone, idx) => {
                    const isUnlocked = level >= milestone.minLv;
                    const isCurrent = level >= milestone.minLv && level <= milestone.maxLv;

                    return (
                      <div 
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                          isCurrent 
                            ? "bg-slate-950 border-emerald-500/60 shadow-md shadow-emerald-500/5 text-white"
                            : isUnlocked
                              ? "bg-slate-950/40 border-slate-850 hover:border-gray-800 text-gray-400"
                              : "bg-slate-950/20 border-slate-900 text-gray-600 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base select-none filter drop-shadow">
                            {milestone.icon}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-black tracking-tight bg-slate-900 px-1 py-0.2 rounded text-gray-300">
                                Lv.{milestone.minLv}+
                              </span>
                              <span className="text-xs font-black">
                                {milestone.title}
                              </span>
                              {isCurrent && (
                                <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">
                                  現在地
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-gray-500 mt-0.5">
                              {milestone.buffText} / {milestone.bonusText}
                            </p>
                          </div>
                        </div>

                        <div>
                          {isUnlocked ? (
                            <Check size={12} className="text-emerald-400" />
                          ) : (
                            <Lock size={10} className="text-gray-550" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeSubSection === "ranking" && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* ユーザーランキングのサマリー */}
              <div className="bg-gradient-to-r from-amber-600/10 to-emerald-600/10 border border-emerald-500/20 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-sm font-black shadow-inner shadow-black">
                    🏆
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 font-extrabold">あなたの現在順位</p>
                    <p className="text-xs font-black text-white">
                      リーグ上位 <span className="text-amber-400 font-mono text-sm">第{selfRank}位 / {leaderboard.length}人中</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[8px] text-gray-500 font-extrabold uppercase">次のライバル追い抜きまで</p>
                  <p className="text-[10px] text-emerald-400 font-black flex items-center gap-0.5 justify-end">
                    <ArrowUp size={10} /> あと少しのレベルアップなり！
                  </p>
                </div>
              </div>

              {/* ランキングリスト */}
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {leaderboard.map((user) => {
                  const titleName = getTitleForLevel(user.level);
                  
                  // メダルバッジスタイリング
                  let rankStyle = "bg-slate-950 text-gray-400 border border-slate-850";
                  if (user.rank === 1) {
                    rankStyle = "bg-amber-500 text-slate-950 font-black shadow-[0_0_8px_rgba(245,158,11,0.3)]";
                  } else if (user.rank === 2) {
                    rankStyle = "bg-slate-300 text-slate-950 font-black border border-slate-200";
                  } else if (user.rank === 3) {
                    rankStyle = "bg-amber-700 text-white font-black border border-amber-650";
                  }

                  return (
                    <div
                      key={user.rank}
                      className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        user.isSelf
                          ? "bg-slate-950 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40"
                          : "bg-slate-950/50 border-slate-850/60 hover:bg-slate-950 hover:border-gray-800"
                      }`}
                    >
                      {/* 左：順位 ＆ アバター ＆ 名前 */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* 順位 */}
                        <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${rankStyle}`}>
                          {user.rank}
                        </div>

                        {/* アバター */}
                        <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-sm flex-shrink-0 relative">
                          {user.avatar.startsWith("data:") || user.avatar.startsWith("http") ? (
                            <img src={user.avatar} alt="Rival" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span className="select-none filter drop-shadow">{user.avatar}</span>
                          )}
                          
                          {/* クランバカバッジ */}
                          {user.isSelf && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                          )}
                        </div>

                        {/* 名前 ＆ 称号 */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <h4 className={`text-xs font-bold truncate ${user.isSelf ? "text-emerald-300 font-black" : "text-gray-200"}`}>
                              {user.name}
                            </h4>
                            {user.isSelf && (
                              <span className="text-[7px] bg-emerald-500/20 text-emerald-400 font-extrabold px-1 rounded">
                                YOU
                              </span>
                            )}
                          </div>
                          
                          {/* ギルド/肩書き */}
                          <div className="flex items-center gap-1 text-[8.5px] text-gray-500 font-bold">
                            <span>{titleName}</span>
                            <span>•</span>
                            <span className="truncate max-w-[80px]">{user.clan}</span>
                          </div>
                        </div>
                      </div>

                      {/* 右：レベル ＆ 経験値表示 */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-black text-gray-300 font-mono flex items-baseline justify-end gap-0.5">
                          <span className="text-[8px] text-gray-500">Lv</span>
                          <span className="text-emerald-400 font-black font-mono">{user.level}</span>
                        </div>
                        
                        {/* 簡易経験値メータ */}
                        <div className="flex items-center gap-1.5 justify-end">
                          <div className="w-12 h-1.5 rounded-full bg-slate-900 overflow-hidden relative border border-slate-800/80">
                            <div 
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${user.expPercent}%` }}
                            />
                          </div>
                          <span className="text-[8px] text-gray-500 font-mono leading-none">{user.expPercent}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* フッター */}
        <div className="p-4 bg-slate-950 border-t border-slate-850 text-center">
          <p className="text-[9px] text-gray-500 leading-normal font-semibold">
            野菜をバランス良く美味しく食べることで、アカウントレベルはどんどん成長していくなり！<br/>
            騎士団のみんなと競い合いながら、最強の「オーガニックロード」を目指すなりよ！🥦
          </p>
        </div>
      </motion.div>
    </div>
  );
};
