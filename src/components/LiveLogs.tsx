import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, ShieldAlert, Trophy, Shield, HelpCircle, Activity } from "lucide-react";
import { LiveLog } from "../types";
import { playClick } from "../utils/sound";

interface LiveLogsProps {
  logs: LiveLog[];
}

interface GuildRank {
  rank: number;
  name: string;
  points: number;
  members: number;
  specialty: string;
  isPlayerGuild: boolean;
  icon: string;
}

const GUILD_RANKINGS: GuildRank[] = [
  {
    rank: 1,
    name: "マッスルブロッコリーズ",
    points: 342000,
    members: 48,
    specialty: "🥦 ブロッコリー特効コンボ中",
    isPlayerGuild: false,
    icon: "💪🥦"
  },
  {
    rank: 2,
    name: "ベジタブル騎士団",
    points: 298500,
    members: 42,
    specialty: "🍅 トマトお題コンボ、バランス回復",
    isPlayerGuild: true,
    icon: "🛡️🍅"
  },
  {
    rank: 3,
    name: "薬膳カレー総本山",
    points: 215000,
    members: 36,
    specialty: "🍛 黄の代謝強化、スパイス代謝バフ",
    isPlayerGuild: false,
    icon: "🔥🍛"
  },
  {
    rank: 4,
    name: "オーガニックスイーパーズ",
    points: 192400,
    members: 31,
    specialty: "🥗 サラダ食物繊維バリア貫通",
    isPlayerGuild: false,
    icon: "🧹🥗"
  },
  {
    rank: 5,
    name: "もやし生活互助会",
    points: 140800,
    members: 50,
    specialty: "🌱 ローコストヘルシー、超速アタック",
    isPlayerGuild: false,
    icon: "💸🌱"
  }
];

export const LiveLogs: React.FC<LiveLogsProps> = ({ logs }) => {
  const [activeTab, setActiveTab] = useState<"logs" | "clans">("logs");

  const handleTabChange = (tab: "logs" | "clans") => {
    playClick();
    setActiveTab(tab);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 flex flex-col flex-grow min-h-[350px] max-h-[450px] shadow-xl">
      {/* 統合ヘッダー＆タブ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-800/60 pb-3 mb-4">
        <h3 className="text-sm font-black text-gray-200 uppercase tracking-widest flex items-center gap-2">
          <Users size={16} className="text-emerald-400" />
          <span>アライアンス戦略指揮所</span>
        </h3>

        {/* コントロールトグル */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-gray-800/80 self-stretch sm:self-auto">
          <button
            onClick={() => handleTabChange("logs")}
            className={`flex-1 sm:flex-none px-3.5 py-1 rounded-lg text-[10px] font-black transition-all gap-1 flex items-center justify-center cursor-pointer ${
              activeTab === "logs"
                ? "bg-slate-800 text-emerald-400 border border-emerald-500/10 shadow-sm"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Activity size={10} />
            共闘ログ
          </button>
          <button
            onClick={() => handleTabChange("clans")}
            className={`flex-1 sm:flex-none px-3.5 py-1 rounded-lg text-[10px] font-black transition-all gap-1 flex items-center justify-center cursor-pointer ${
              activeTab === "clans"
                ? "bg-slate-800 text-amber-400 border border-amber-500/10 shadow-sm"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Trophy size={10} />
            クランランキング
          </button>
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto flex-grow pr-1 scrollbar-thin">
        <AnimatePresence mode="wait">
          {activeTab === "logs" ? (
            <motion.div
              key="logs_view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start space-x-3 text-xs p-3 rounded-2xl border transition-colors duration-200 ${
                    log.id.startsWith("player")
                      ? "bg-emerald-950/20 border-emerald-500/30"
                      : "bg-slate-950/40 border-slate-800/60 hover:border-slate-700/40"
                  }`}
                >
                  {/* アバター */}
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow-inner shadow-black overflow-hidden">
                      {log.avatar.startsWith("data:") || log.avatar.startsWith("http") ? (
                        <img 
                          src={log.avatar} 
                          alt="User Icon" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        log.avatar
                      )}
                    </div>
                    {log.icon && (
                      <span className="absolute -bottom-1.5 -right-1.5 text-[9px] bg-slate-950 px-1 py-0.5 rounded-md scale-95 border border-slate-800 leading-none font-sans" title="召喚したお題カテゴリ">
                        {log.icon}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className={`font-bold truncate ${log.id.startsWith("player") ? "text-emerald-400" : "text-gray-300"}`}>
                        {log.user}
                      </span>
                      <span className="text-gray-500 text-[8px] font-mono whitespace-nowrap">{log.timeText}</span>
                    </div>
                    
                    <p className="text-gray-400 mt-1 leading-relaxed">
                      <span className="font-extrabold text-gray-200">「{log.dishName}」</span>を検知！
                      {log.tag && (
                        <span className="text-red-400 font-extrabold bg-red-500/5 px-1 py-0.5 rounded border border-red-500/10 mx-1">
                          {log.tag}
                        </span>
                      )}
                      ボスに{" "}
                      <span className="text-amber-400 font-black animate-pulse bg-amber-950/10 px-1 py-0.5 rounded">
                        {log.damage.toLocaleString()} DMG
                      </span>{" "}
                      を与えたなり！
                    </p>
                  </div>
                </div>
              ))}

              {logs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2 py-8">
                  <ShieldAlert size={28} className="stroke-slate-700" />
                  <p className="text-xs">ログの読み込み完了を待機中...</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="clans_view"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-2.5"
            >
              {GUILD_RANKINGS.map((guild) => {
                // 順位に応じた色・メダルの設定
                const medalColors = 
                  guild.rank === 1 ? "bg-amber-500/10 text-amber-400 border-amber-500/30 font-black" : 
                  guild.rank === 2 ? "bg-slate-300/10 text-slate-300 border-slate-300/20 font-bold" : 
                  guild.rank === 3 ? "bg-amber-700/10 text-amber-600 border-amber-700/20" : 
                  "bg-slate-950 text-gray-400 border-gray-800/50";

                return (
                  <div
                    key={guild.rank}
                    className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                      guild.isPlayerGuild
                        ? "bg-emerald-950/20 border-emerald-500/40 shadow-md shadow-emerald-500/5 hover:border-emerald-500/60"
                        : "bg-slate-950/40 border-slate-800/40 hover:border-slate-750/50"
                    }`}
                  >
                    {/* 左側：順位・アイコン・クラン名 */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* メダル */}
                      <span className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center border flex-shrink-0 ${medalColors}`}>
                        {guild.rank}
                      </span>

                      {/* クランエンブレム (絵文字) */}
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-center text-lg shadow-inner select-none flex-shrink-0">
                        {guild.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-extrabold text-white truncate leading-none">
                            {guild.name}
                          </h4>
                          {guild.isPlayerGuild && (
                            <span className="text-[8px] bg-emerald-500 text-slate-950 font-black px-1 py-0.5 rounded-sm uppercase tracking-wide flex items-center gap-0.5 scale-90 border border-slate-950">
                              <Shield size={7} />
                              所属
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-gray-500 font-bold mt-1.5 flex items-center gap-1 leading-none">
                          <span>特性:</span>
                          <span className="text-emerald-300/80">{guild.specialty}</span>
                        </p>
                      </div>
                    </div>

                    {/* 右側：合計野菜ダメージ値 & メンバー数 */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-black text-amber-400 font-mono">
                        {guild.points.toLocaleString()} <span className="text-[9px] font-bold">VC</span>
                      </span>
                      <span className="block text-[8px] text-gray-500 mt-1 font-semibold">
                        メンバー: {guild.members}名
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="bg-slate-950/50 p-2.5 rounded-xl border border-gray-800/50 flex gap-2 items-center text-[10px] text-gray-500 mt-4 leading-normal font-medium">
                <HelpCircle size={12} className="text-amber-500 flex-shrink-0" />
                <span>獲得ベジコイン(VC)のギルド総量がランキングに登録され、毎週お題のボーナス報酬がアライアンス全員に配分されますなり！</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

