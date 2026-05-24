import React from "react";
import { motion } from "motion/react";
import { Skull, Zap, Calendar, Heart } from "lucide-react";

interface BossCardProps {
  currentHp: number;
  maxHp: number;
  isFlinching: boolean;
}

export const BossCard: React.FC<BossCardProps> = ({ currentHp, maxHp, isFlinching }) => {
  const hpPercentage = Math.max(0, (currentHp / maxHp) * 100);

  // フリンチ（ダメージ被弾）時の振動設定
  const shakeAnimation = {
    x: isFlinching ? [-6, 6, -6, 6, -3, 3, 0] : 0,
    y: isFlinching ? [-3, 3, -3, 3, 0] : 0,
    filter: isFlinching ? ["drop-shadow(0 0 25px rgba(239, 68, 68, 0.9))", "drop-shadow(0 0 5px rgba(244, 63, 94, 0.4))"] : "drop-shadow(0 0 10px rgba(244, 63, 94, 0.4))",
    transition: { duration: 0.4 }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-zinc-950 to-slate-950 border border-red-950/40 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(244,63,94,0.15)]">
      {/* 背景のグリッドパターン */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1a24_1px,transparent_1px),linear-gradient(to_bottom,#1f1a24_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none"></div>

      {/* ヘッダーメタ情報 */}
      <div className="relative z-10 flex justify-between items-center mb-5">
        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
          <Skull size={13} className="animate-pulse" /> WEEKLY RAID BOSS
        </span>
        <span className="text-gray-400 text-xs font-semibold flex items-center gap-1">
          <Calendar size={12} className="text-rose-400" />
          残り期間: <span className="text-rose-400 font-bold">2日 04:32</span>
        </span>
      </div>

      {/* ボスビジュアル */}
      <div className="relative z-10 flex flex-col items-center justify-center py-4">
        {/* ボス画像 (Emoji ＆ SVGによる表現) */}
        <motion.div 
          animate={shakeAnimation}
          className="relative h-44 w-44 flex items-center justify-center select-none cursor-pointer"
        >
          {/* オーラエフェクト */}
          <div className="absolute inset-0 rounded-full bg-rose-600/10 blur-3xl animate-pulse"></div>
          
          {/* ボス本体 */}
          <div className="text-8xl filter drop-shadow-[0_15px_20px_rgba(239,68,68,0.4)] relative z-10 hover:scale-105 active:scale-95 transition-transform duration-100">
            😈🍔
          </div>
          
          {/* ジャンクフードの取り巻き */}
          <span className="absolute -top-1 -left-2 text-3xl animate-bounce" style={{ animationDelay: "0.2s" }}>🍟</span>
          <span className="absolute top-1/2 -right-4 text-3xl animate-bounce" style={{ animationDelay: "0.7s" }}>🥤</span>
          <span className="absolute -bottom-1 left-2 text-3xl animate-bounce" style={{ animationDelay: "0.4s" }}>🍩</span>
        </motion.div>

        <h3 className="text-2xl font-black tracking-tight mt-6 text-rose-500 text-center flex items-center gap-2">
          ジャンク・プレジデント
        </h3>
        <p className="text-xs text-gray-400 mt-2 font-bold bg-slate-900/80 px-4 py-1.5 rounded-full border border-gray-800 text-center">
          「野菜なんてウマくない！脂と砂糖と塩分こそ至高なり！」
        </p>
      </div>

      {/* HPバー */}
      <div className="relative z-10 mt-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
            <Heart size={12} className="text-rose-500 fill-rose-500" /> 
            全プレイヤーの総野菜ダメージ目標
          </span>
          <span className="text-sm font-black text-rose-400">
            HP {currentHp.toLocaleString()} / {maxHp.toLocaleString()}
          </span>
        </div>
        {/* プログレスバー */}
        <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden border border-gray-800 p-0.5 shadow-inner relative">
          <div 
            className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(239,68,68,0.5)]" 
            style={{ width: `${hpPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* ボスの弱点 (特効野菜) */}
      <div className="relative z-10 mt-6 border-t border-gray-800/60 pt-4">
        <h4 className="text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-widest flex items-center gap-1">
          <Zap size={12} className="text-amber-400 fill-amber-400" /> 今週の特効弱点 (大ダメージ対象)
        </h4>
        <div className="flex gap-3">
          <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-2xl p-3 flex items-center space-x-2.5 flex-1 hover:bg-emerald-950/35 transition-colors">
            <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">🍅</span>
            <div>
              <span className="text-xs block font-extrabold text-emerald-400 leading-none">完熟トマト</span>
              <span className="text-[10px] text-gray-400 font-bold block mt-1">ダメージ 2.0x</span>
            </div>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-2xl p-3 flex items-center space-x-2.5 flex-1 hover:bg-emerald-950/35 transition-colors">
            <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">🥦</span>
            <div>
              <span className="text-xs block font-extrabold text-emerald-400 leading-none">ブロッコリー</span>
              <span className="text-[10px] text-gray-400 font-bold block mt-1">ダメージ 1.5x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
