import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Award, 
  Check, 
  Lock, 
  Sparkles, 
  Coins, 
  ArrowUp,
  Search,
  Filter,
  Flame,
  Swords,
  Trophy,
  Users
} from "lucide-react";
import { PhotoHistoryItem, UserProfile } from "../types";
import { playClick, playRewardTrumpet } from "../utils/sound";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: "scan" | "damage" | "streak" | "coins" | "level" | "clan";
  targetValue: number;
  rewardLevels: number;
  rewardCoins: number;
  icon: string;
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: "scan_1",
    title: "ルーキーソルジャー",
    description: "野菜写真を1作以上レイドに提出するなり！",
    category: "scan",
    targetValue: 1,
    rewardLevels: 1,
    rewardCoins: 100,
    icon: "🌱"
  },
  {
    id: "scan_5",
    title: "健康サラダ大食漢",
    description: "野菜写真を5作以上レイド提出するなり！",
    category: "scan",
    targetValue: 5,
    rewardLevels: 3,
    rewardCoins: 250,
    icon: "🥗"
  },
  {
    id: "scan_15",
    title: "野菜の極めし大賢者",
    description: "野菜写真を累計15作以上レイド提出するなり！",
    category: "scan",
    targetValue: 15,
    rewardLevels: 8,
    rewardCoins: 500,
    icon: "🎓"
  },
  {
    id: "damage_5000",
    title: "一撃のヘルシー戦士",
    description: "累計レイドダメージ 5,000 以上を叩き出すなり！",
    category: "damage",
    targetValue: 5000,
    rewardLevels: 2,
    rewardCoins: 150,
    icon: "⚔️"
  },
  {
    id: "damage_20000",
    title: "ギガベジクラッシャー",
    description: "累計レイドダメージ 20,000 以上を達成せよ！",
    category: "damage",
    targetValue: 20000,
    rewardLevels: 5,
    rewardCoins: 350,
    icon: "💥"
  },
  {
    id: "damage_80000",
    title: "インフィニティ・ベジタブル",
    description: "累計レイドダメージ 80,000 以上を記録するなり！",
    category: "damage",
    targetValue: 80000,
    rewardLevels: 12,
    rewardCoins: 600,
    icon: "🌠"
  },
  {
    id: "damage_200000",
    title: "ジャンクを総滅せし天界神",
    description: "累計レイドダメージ 200,000 以上！驚異の戦闘力なり！",
    category: "damage",
    targetValue: 200000,
    rewardLevels: 30,
    rewardCoins: 1500,
    icon: "🌌"
  },
  {
    id: "streak_3",
    title: "健康習慣の第一歩",
    description: "野菜提出の連続健康日数を 3日 以上にするなり！",
    category: "streak",
    targetValue: 3,
    rewardLevels: 1,
    rewardCoins: 100,
    icon: "🔥"
  },
  {
    id: "streak_7",
    title: "継続は健康の鎧なり",
    description: "連続健康日数 7日 以上を達成するなり！お見事！",
    category: "streak",
    targetValue: 7,
    rewardLevels: 4,
    rewardCoins: 300,
    icon: "🧘"
  },
  {
    id: "streak_14",
    title: "不世出のオーガニックボディ",
    description: "連続健康日数 14日 以上を突破！お野菜の化身なり！",
    category: "streak",
    targetValue: 14,
    rewardLevels: 15,
    rewardCoins: 800,
    icon: "🧗"
  },
  {
    id: "coins_1000",
    title: "ベジファンド長者",
    description: "所持ベジコインを 1,000 コイン以上にするなり！",
    category: "coins",
    targetValue: 1000,
    rewardLevels: 2,
    rewardCoins: 200,
    icon: "🪙"
  },
  {
    id: "level_50",
    title: "伝説のオーガニックロード",
    description: "アカウントレベルが 50 以上に到達するなり！",
    category: "level",
    targetValue: 50,
    rewardLevels: 8,
    rewardCoins: 600,
    icon: "⭐"
  },
  {
    id: "level_150",
    title: "最高峰ベジ・クルセイダー",
    description: "アカウントレベルが 150 以上に到達するなり！",
    category: "level",
    targetValue: 150,
    rewardLevels: 20,
    rewardCoins: 1000,
    icon: "🔮"
  },
  {
    id: "level_500",
    title: "天下統一ベジマスター",
    description: "アカウントレベルが 500 以上に到達！神の領域なり！",
    category: "level",
    targetValue: 500,
    rewardLevels: 55,
    rewardCoins: 3000,
    icon: "👑"
  },
  {
    id: "clan_member",
    title: "同盟野菜戦士の誓い",
    description: "クラン（ギルド）に加入している、または創設完了するなり！",
    category: "clan",
    targetValue: 1,
    rewardLevels: 2,
    rewardCoins: 150,
    icon: "🛡️"
  }
];

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  veggieCoins: number;
  streak: number;
  photoHistory: PhotoHistoryItem[];
  userProfile: UserProfile;
  claimedIds: string[];
  onClaim: (achievementId: string, levelReward: number, coinReward: number) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  level,
  veggieCoins,
  streak,
  photoHistory,
  userProfile,
  claimedIds,
  onClaim
}) => {
  const [filterType, setFilterType] = useState<"all" | "in_progress" | "claimable" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  // 計算値
  const totalMealsScanned = photoHistory.length;
  const totalDamageDealt = photoHistory.reduce((sum, h) => sum + h.damage, 0);
  const isInClan = userProfile.joinClan && userProfile.joinClan !== "" && userProfile.joinClan !== "未所属";

  // 実績の進捗状況をリアルタイムで取得するヘルパー
  const getProgressDetails = (achievement: Achievement) => {
    let current = 0;
    const target = achievement.targetValue;

    switch (achievement.category) {
      case "scan":
        current = totalMealsScanned;
        break;
      case "damage":
        current = totalDamageDealt;
        break;
      case "streak":
        current = streak;
        break;
      case "coins":
        current = veggieCoins;
        break;
      case "level":
        current = level;
        break;
      case "clan":
        current = isInClan ? 1 : 0;
        break;
    }

    const isCompleted = current >= target;
    const isClaimed = claimedIds.includes(achievement.id);
    const isClaimable = isCompleted && !isClaimed;
    const percent = Math.min(100, Math.floor((current / target) * 100));

    return {
      current,
      target,
      percent,
      isCompleted,
      isClaimed,
      isClaimable
    };
  };

  // リストの加工・絞り込み
  const filteredAchievements = ACHIEVEMENTS_LIST.map((ach) => ({
    ...ach,
    progress: getProgressDetails(ach)
  }))
  .filter((ach) => {
    // 検索フィルタ
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ach.title.toLowerCase().includes(q);
      const matchDesc = ach.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // タブフィルタ
    switch (filterType) {
      case "in_progress":
        return !ach.progress.isCompleted;
      case "claimable":
        return ach.progress.isClaimable;
      case "completed":
        return ach.progress.isClaimed;
      case "all":
      default:
        return true;
    }
  });

  // 進捗サマリー
  const totalCount = ACHIEVEMENTS_LIST.length;
  const completedCount = ACHIEVEMENTS_LIST.filter(a => getProgressDetails(a).isClaimed).length;
  const claimableCount = ACHIEVEMENTS_LIST.filter(a => getProgressDetails(a).isClaimable).length;

  const handleClaimReward = (ach: Achievement) => {
    onClaim(ach.id, ach.rewardLevels, ach.rewardCoins);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-slate-900 border border-slate-800/95 max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]"
      >
        {/* ヘッダー */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 relative">
          <div className="absolute top-0 right-12 w-20 h-20 bg-emerald-500/5 blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 border border-amber-400/30 flex items-center justify-center text-slate-950 shadow-md">
              <Award size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-100 uppercase tracking-widest leading-none flex items-center gap-1.5">
                <span>プレミアムお野菜アチーブメント</span>
                <span className="text-[10px] bg-red-550 text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                  報酬アリ
                </span>
              </h2>
              <span className="text-[10px] text-gray-400 font-semibold mt-1.5 block">
                健康目標を達成して大量のベジコイン ＆ レベル爆上げ補正を獲得するなり！🏆
              </span>
            </div>
          </div>
          <button
            onClick={() => { playClick(); onClose(); }}
            className="w-7 h-7 rounded-full bg-slate-850 hover:bg-slate-750 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs font-black"
          >
            ✕
          </button>
        </div>

        {/* 進捗サマリーボード */}
        <div className="px-5 pt-4">
          <div className="bg-slate-950/70 border border-slate-850 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-[9px] text-emerald-400 font-black tracking-wider uppercase">ARCHIEVEMENT SUMMARY</p>
              <h3 className="text-sm font-black text-white flex items-baseline justify-center sm:justify-start gap-1">
                <span>実績解除率:</span>
                <span className="text-amber-400 font-mono text-base">{completedCount}</span>
                <span className="text-xs text-gray-500 font-bold">/</span>
                <span className="text-xs text-gray-400 font-bold">{totalCount} 完成</span>
              </h3>
              <p className="text-[9px] text-gray-500 leading-none">
                ※最大レベル上限は **1000** なり！アチーブメントでライバルをゴボウ抜きなり！🚀
              </p>
            </div>

            {/* 進捗プログレス円またはバー */}
            <div className="w-full sm:w-44 space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>進捗度</span>
                <span>{Math.round((completedCount / totalCount) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 border border-slate-850 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 絞り込み ＆ 検索バー */}
        <div className="px-5 pt-3.5 space-y-3">
          {/* キーワード検索 */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
            <input
              type="text"
              placeholder="実績名や説明文をキーワード検索なり..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-amber-500 focus:outline-none p-2.5 pl-9 rounded-xl text-xs font-semibold text-gray-200 transition-colors"
            />
          </div>

          {/* フィルタータブ */}
          <div className="flex bg-slate-950/40 p-1 rounded-xl gap-1 border border-slate-850/80">
            <button
              onClick={() => { playClick(); setFilterType("all"); }}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-amber-500 text-slate-950"
                  : "text-gray-400 hover:text-gray-200 hover:bg-slate-950/50"
              }`}
            >
              すべて ({totalCount})
            </button>
            <button
              onClick={() => { playClick(); setFilterType("claimable"); }}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                filterType === "claimable"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              受け取り可能 ({claimableCount})
              {claimableCount > 0 && (
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
              )}
            </button>
            <button
              onClick={() => { playClick(); setFilterType("in_progress"); }}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                filterType === "in_progress"
                  ? "bg-slate-800 text-gray-100"
                  : "text-gray-400 hover:text-gray-200 hover:bg-slate-950/50"
              }`}
            >
              挑戦中 ({totalCount - completedCount - claimableCount})
            </button>
            <button
              onClick={() => { playClick(); setFilterType("completed"); }}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                filterType === "completed"
                  ? "bg-slate-800 text-gray-100"
                  : "text-gray-400 hover:text-gray-200 hover:bg-slate-950/50"
              }`}
            >
              達成済み ({completedCount})
            </button>
          </div>
        </div>

        {/* リスト表示領域 */}
        <div className="p-5 overflow-y-auto flex-1 scrollbar-thin space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredAchievements.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12 bg-slate-950/20 border border-dashed border-slate-850 rounded-2xl space-y-2"
              >
                <div className="text-2xl filter grayscale select-none">🔍</div>
                <p className="text-xs font-bold text-gray-400">該当するアチーブメントが見つからなかったなり...</p>
                <p className="text-[10px] text-gray-500">条件やキーワードを変更して再チェックしてみるなりよ！</p>
              </motion.div>
            ) : (
              filteredAchievements.map((ach) => {
                const isClaimed = ach.progress.isClaimed;
                const isClaimable = ach.progress.isClaimable;
                const isCompleted = ach.progress.isCompleted;

                // カテゴリに応じた単位などの修飾
                let displayUnit = "";
                if (ach.category === "damage") displayUnit = " DMG";
                if (ach.category === "coins") displayUnit = " COIN";
                if (ach.category === "streak") displayUnit = " 日";
                if (ach.category === "level") displayUnit = " Lv";
                if (ach.category === "scan") displayUnit = " 回";

                return (
                  <motion.div
                    key={ach.id}
                    layoutId={`ach_card_${ach.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 relative overflow-hidden ${
                      isClaimed
                        ? "bg-slate-950/30 border-slate-900/60 opacity-65 grayscale-[30%]"
                        : isClaimable
                          ? "bg-slate-900/90 border-amber-500/40 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/20"
                          : "bg-slate-950/70 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    {/* 左側：アイコン ＆ タイトル・説明・プログレス */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* アイコン */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 select-none shadow ${
                        isClaimed
                          ? "bg-slate-950 border border-slate-900"
                          : isClaimable
                            ? "bg-amber-450/15 border border-amber-400/40 text-glow-amber animate-pulse"
                            : "bg-slate-900 border border-slate-800"
                      }`}>
                        {ach.icon}
                      </div>

                      {/* テキスト詳細 */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-xs font-black truncate ${isClaimable ? "text-amber-400" : "text-gray-200"}`}>
                            {ach.title}
                          </h4>
                          
                          {/* 報酬プレビュータグ */}
                          <div className="flex items-center gap-1">
                            <span className="text-[7.5px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded-md font-bold flex items-center gap-0.5">
                              <ArrowUp size={8} /> Lv+{ach.rewardLevels}
                            </span>
                            <span className="text-[7.5px] bg-amber-500/15 text-amber-400 px-1.5 py-0.2 rounded-md font-bold flex items-center gap-0.5">
                              <Coins size={8} /> +{ach.rewardCoins}
                            </span>
                          </div>
                        </div>

                        <p className="text-[9.5px] text-gray-400 font-medium leading-relaxed">
                          {ach.description}
                        </p>

                        {/* プログレスバー（達成済み以外は表示） */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[8px] font-bold">
                            <span className={isCompleted ? "text-emerald-400" : "text-gray-500"}>
                              進捗: {ach.progress.current.toLocaleString()}{displayUnit} / {ach.targetValue.toLocaleString()}{displayUnit}
                            </span>
                            <span className="text-gray-500 font-mono">{ach.progress.percent}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden relative">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                isCompleted 
                                  ? "bg-emerald-500" 
                                  : "bg-gray-700"
                              }`}
                              style={{ width: `${ach.progress.percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 右側：ボタン / 達成状態 */}
                    <div className="shrink-0 pl-1">
                      {isClaimed ? (
                        <div className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl bg-slate-950/50 border border-slate-900 text-slate-550 select-none">
                          <Check size={11} className="text-slate-600 stroke-[3]" />
                          <span className="text-[8px] font-black uppercase tracking-wider">Claimed</span>
                        </div>
                      ) : isClaimable ? (
                        <button
                          onClick={() => { playRewardTrumpet(); handleClaimReward(ach); }}
                          className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] rounded-xl cursor-pointer hover:scale-105 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] active:scale-95 transition-all text-center flex flex-col items-center justify-center animate-bounce shadow-lg shadow-amber-500/10"
                        >
                          <Sparkles size={11} className="animate-spin mb-0.5 text-slate-950" />
                          <span>報酬を受け取る！</span>
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5 px-3 py-2 bg-slate-950 border border-slate-900 text-gray-550 rounded-xl select-none">
                          <Lock size={10} className="text-gray-650" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Locked</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* フッター */}
        <div className="p-4 bg-slate-950 border-t border-slate-850 text-center">
          <p className="text-[9px] text-gray-500 font-semibold leading-relaxed">
            野菜をバランス良く美味しくバトルの仲間と食べることで、アチーブメントが自然に増えていくなり！🥗<br />
            1000レベル到達の最強のオーガニックロードになるその日まで、ヘルシーを鍛えぬくべし！✨
          </p>
        </div>
      </motion.div>
    </div>
  );
};
