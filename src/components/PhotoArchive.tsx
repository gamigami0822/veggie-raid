import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PhotoHistoryItem, DetectedMeal } from "../types";
import { Calendar, Award, Flame, Heart, Sparkles, TrendingUp, HelpCircle, LayoutGrid, CalendarDays, Coins, Check, Sword, Lock } from "lucide-react";
import { playClick } from "../utils/sound";

interface PhotoArchiveProps {
  historyList: PhotoHistoryItem[];
  detectedMeals: DetectedMeal[];
  selectedMealId: string | null;
  onSelectMeal: (id: string) => void;
  onAttackWithMeal: (meal: DetectedMeal) => void;
  hasAttackedToday: boolean;
}

export const PhotoArchive: React.FC<PhotoArchiveProps> = ({ 
  historyList, 
  detectedMeals, 
  selectedMealId, 
  onSelectMeal, 
  onAttackWithMeal, 
  hasAttackedToday 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"detected" | "history">("detected");
  const [selectedHistory, setSelectedHistory] = useState<PhotoHistoryItem | null>(null);
  const [selectedDetected, setSelectedDetected] = useState<DetectedMeal | null>(null);

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-5 lg:p-6 space-y-5 shadow-xl">
      {/* メインヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-800/60 pb-4 gap-3">
        <div>
          <h3 className="text-sm font-black text-gray-200 uppercase tracking-widest flex items-center gap-2">
            <Award size={16} className="text-amber-400" />
            <span>マイ野菜ライブラリ</span>
          </h3>
          <p className="text-[10px] text-gray-500 mt-1 font-semibold">あなたがスキャンして見つけた料理や、これまでの戦績ログなり！</p>
        </div>
        
        {/* サブタブ切り替え */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-gray-800/80 self-start sm:self-center">
          <button
            onClick={() => { playClick(); setActiveSubTab("detected"); }}
            className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
              activeSubTab === "detected"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            厳選ストック ({detectedMeals.length})
          </button>
          <button
            onClick={() => { playClick(); setActiveSubTab("history"); }}
            className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
              activeSubTab === "history"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            実績提出ログ ({historyList.length})
          </button>
        </div>
      </div>

      {/* 1. 検出料理ストックタブを表示中 */}
      {activeSubTab === "detected" && (
        <>
          {detectedMeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-950/40 border border-slate-850/60 rounded-2xl gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-gray-800 flex items-center justify-center text-2xl">
                🧪
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-400">厳選ストックがまだありません</h4>
                <p className="text-[10px] text-gray-500 max-w-xs leading-normal">
                  右側の「AI料理を召喚」か「カメラ撮影スキャン」で料理を解析すると、ここにお皿がどんどんストックされるなり！厳選して最強の料理で攻撃に挑むなり！
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
              {detectedMeals.map((item) => {
                const isSelected = item.id === selectedMealId;
                const score = item.scanResult.score;
                const damage = item.scanResult.damage;
                const isTomato = item.scanResult.detectedVeggies.some(v => v.includes("トマト"));
                const isBroccoli = item.scanResult.detectedVeggies.some(v => v.includes("ブロッコリー"));

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => { playClick(); setSelectedDetected(item); }}
                    className={`group bg-slate-950/80 border rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all flex flex-col justify-between ${
                      isSelected ? "border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)]" : "border-slate-850/60 hover:border-emerald-500/30"
                    }`}
                  >
                    {/* 写真画像 */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900 border-b border-slate-850">
                      <img
                        src={item.imageUrl}
                        alt={item.scanResult.dishName}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <span className="absolute top-1.5 right-1.5 text-[8px] bg-black/60 backdrop-blur-sm text-gray-300 py-0.5 px-1.5 rounded font-mono font-bold">
                        {item.timestamp}
                      </span>
                      
                      {/* アタック装備中バッジ */}
                      {isSelected ? (
                        <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500 text-slate-950 shadow-md">
                          <Sword size={8} /> 装備セット中
                        </span>
                      ) : (
                        <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-slate-800 text-gray-300 opacity-60 group-hover:opacity-100">
                          ストック中
                        </span>
                      )}

                      {/* 健康スコアバッジ */}
                      <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-500 text-slate-950 shadow-md">
                        ✨ Score {score}
                      </span>
                    </div>

                    {/* タイトル・ステータス */}
                    <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* 特効アイコン */}
                        <div className="flex items-center gap-1">
                          {isTomato && <span className="text-[10px]" title="特効トマト!">🍅</span>}
                          {isBroccoli && <span className="text-[10px]" title="特効ブロッコリー!">🥦</span>}
                          <h4 className="text-[10px] font-black text-gray-250 line-clamp-1 group-hover:text-emerald-300 transition-colors">
                            {item.scanResult.dishName}
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.scanResult.detectedVeggies.slice(0, 2).map((veg, idx) => (
                            <span key={idx} className="text-[7.5px] bg-slate-900 text-gray-400 px-1 py-0.2 rounded border border-gray-800/80 leading-none">
                              {veg}
                            </span>
                          ))}
                          {item.scanResult.detectedVeggies.length > 2 && (
                            <span className="text-[7.5px] text-gray-500 leading-none self-center">...</span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-900 flex items-center justify-between">
                        <span className="text-[8px] text-gray-500 font-bold">想定ダメージ:</span>
                        <span className="text-[9px] text-emerald-400 font-black font-mono">
                          {damage.toLocaleString()} DMG
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 2. 実績提出ログタブを表示中 */}
      {activeSubTab === "history" && (
        <>
          {historyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-950/40 border border-slate-850/60 rounded-2xl gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-gray-800 flex items-center justify-center text-2xl">
                📷
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-400">提出ログがまだありませんなり</h4>
                <p className="text-[10px] text-gray-500 max-w-xs leading-normal">
                  スキャンしたお皿を実際に「レイド攻撃に提出」すると、ここに本音の実績写真＆確定ログとして保管されるなりよ！
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
              {historyList.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => { playClick(); setSelectedHistory(item); }}
                  className="group bg-slate-950/80 border border-slate-850/60 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:border-emerald-500/30 transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-900 border-b border-slate-850">
                    <img
                      src={item.imageUrl}
                      alt={item.dishName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <span className="absolute top-1.5 right-1.5 text-[8px] bg-black/60 backdrop-blur-sm text-gray-300 py-0.5 px-1.5 rounded font-mono font-bold">
                      {item.timestamp}
                    </span>
                    <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-indigo-500 text-slate-100 shadow-md">
                      ⚔️ 討伐提出済
                    </span>
                    <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500 text-slate-950 shadow-md">
                      ✨ Score {item.score}
                    </span>
                  </div>

                  <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-250 line-clamp-1 group-hover:text-emerald-300 transition-colors">
                        {item.dishName}
                      </h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.detectedVeggies.slice(0, 2).map((veg, idx) => (
                          <span key={idx} className="text-[7.5px] bg-slate-900 text-gray-400 px-1 py-0.2 rounded border border-gray-800/80 leading-none">
                            {veg}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-900 flex items-center justify-between">
                      <span className="text-[8px] text-gray-500 font-bold">ボスダメージ:</span>
                      <span className="text-[9px] text-amber-400 font-black font-mono">
                        {item.damage.toLocaleString()} DMG
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 3. モーダル詳細: A. 厳選した料理ストック詳細 */}
      <AnimatePresence>
        {selectedDetected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
            onClick={() => setSelectedDetected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 大料理写真 */}
              <div className="relative aspect-video w-full bg-slate-950 border-b border-gray-850">
                <img
                  src={selectedDetected.imageUrl}
                  alt={selectedDetected.scanResult.dishName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => { playClick(); setSelectedDetected(null); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-900 text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-gray-800 cursor-pointer"
                >
                  ✕
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none"></div>
                
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-black text-[10px] tracking-wide uppercase shadow-md">
                  ⭐ 栄養スコア {selectedDetected.scanResult.score} 点
                </span>

                {selectedDetected.id === selectedMealId && (
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-emerald-500 text-slate-950 font-black text-[10px] tracking-wide uppercase shadow-md flex items-center gap-1">
                    <Sword size={10} /> レイドアタック装備セット中
                  </span>
                )}
              </div>

              {/* コンテンツ */}
              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-[9px] font-mono leading-none mb-1.5">
                    <Calendar size={10} />
                    <span>検出時刻: {selectedDetected.timestamp}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                    {selectedDetected.scanResult.dishName}
                  </h3>
                  <p className="text-[10px] text-gray-400 leading-normal mt-1.5 bg-slate-950 p-2.5 border border-slate-850 rounded-xl font-medium">
                    {selectedDetected.scanResult.narrative}
                  </p>
                </div>

                {/* 検出野菜 */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-gray-500 font-black block tracking-wider uppercase">
                    検出された主役野菜成分
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDetected.scanResult.detectedVeggies.map((veg, idx) => (
                      <span key={idx} className="bg-slate-950 border border-slate-800 text-[10px] text-emerald-300 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        🥦 {veg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* カラーバランス */}
                <div className="space-y-1.5 bg-slate-950 p-3.5 border border-slate-850/60 rounded-2xl">
                  <span className="text-[9px] text-gray-500 font-black block tracking-wider uppercase mb-2">
                    食事バランス分析（RGBカラー比率）
                  </span>
                  
                  <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-900 mb-2">
                    <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${selectedDetected.scanResult.colorRatio.red}%` }} />
                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${selectedDetected.scanResult.colorRatio.green}%` }} />
                    <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${selectedDetected.scanResult.colorRatio.yellow}%` }} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                    <div className="bg-red-950/20 px-1 py-1 rounded">
                      <span className="text-red-400 block font-black">赤：{selectedDetected.scanResult.colorRatio.red}%</span>
                    </div>
                    <div className="bg-emerald-950/20 px-1 py-1 rounded">
                      <span className="text-emerald-400 block font-black">緑：{selectedDetected.scanResult.colorRatio.green}%</span>
                    </div>
                    <div className="bg-amber-950/20 px-1 py-1 rounded">
                      <span className="text-amber-400 block font-black">黄：{selectedDetected.scanResult.colorRatio.yellow}%</span>
                    </div>
                  </div>
                </div>

                {/* 料理ダメージ・特効マーク */}
                <div className="flex justify-between items-center bg-amber-500/5 px-4 py-3 border border-amber-500/10 rounded-xl leading-none">
                  <div>
                    <span className="text-[10px] text-gray-405 font-bold block">ボスへの予想ダメージ</span>
                    {selectedDetected.scanResult.damageBoost && (
                      <span className="text-[8px] text-amber-400 font-black block mt-0.5">🌟 WEEKLY 弱点特効ボーナス適用中！</span>
                    )}
                  </div>
                  <span className="text-sm font-black text-amber-400 font-mono">
                    {selectedDetected.scanResult.damage.toLocaleString()} DMG
                  </span>
                </div>

                {/* 装備か攻撃アクションエリア */}
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        playClick();
                        onSelectMeal(selectedDetected.id);
                        setSelectedDetected(null);
                      }}
                      className={`py-2.5 text-xs font-black rounded-xl transition-all border cursor-pointer ${
                        selectedDetected.id === selectedMealId
                          ? "bg-slate-950 border-emerald-500 text-emerald-400"
                          : "bg-slate-950 border-slate-800 hover:border-gray-700 text-gray-350"
                      }`}
                    >
                      {selectedDetected.id === selectedMealId ? "✓ アタックに装備済" : "🛡️ レイド攻撃に装備"}
                    </button>
                    
                    <button
                      disabled={hasAttackedToday}
                      onClick={() => {
                        playClick();
                        onAttackWithMeal(selectedDetected);
                        setSelectedDetected(null);
                      }}
                      className={`py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        hasAttackedToday
                          ? "bg-slate-950 border border-slate-800 text-gray-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-lg shadow-red-950/20 hover:brightness-110 active:scale-98"
                      }`}
                    >
                      {hasAttackedToday ? (
                        <>
                          <Lock size={12} /> 本日分提出済
                        </>
                      ) : (
                        <>
                          <Sword size={12} /> 今すぐ提出攻撃！
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[8.5px] text-gray-500 text-center leading-normal leading-relaxed">
                    ※「今すぐ提出攻撃」を実行すると、ボスのHPを削減し、ベジコインを獲得します（1日1回限定なりよ）。
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. モーダル詳細: B. これまでの実績・提出履歴詳細 */}
      <AnimatePresence>
        {selectedHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
            onClick={() => setSelectedHistory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video w-full bg-slate-950 border-b border-gray-850">
                <img
                  src={selectedHistory.imageUrl}
                  alt={selectedHistory.dishName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => { playClick(); setSelectedHistory(null); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-900 text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-gray-800 cursor-pointer"
                >
                  ✕
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none"></div>
                
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-indigo-500 text-white font-black text-[10px] tracking-wide uppercase shadow-md flex items-center gap-1">
                  <Check size={10} /> レイドボス提出ログ確定済
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-[9px] font-mono leading-none mb-1.5">
                    <Calendar size={10} />
                    <span>正式提出日時: {selectedHistory.timestamp}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                    {selectedHistory.dishName}
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] text-gray-500 font-black block tracking-wider uppercase">
                    栄養を支えた主役野菜たち
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedHistory.detectedVeggies.map((veg, idx) => (
                      <span key={idx} className="bg-slate-950 border border-slate-800 text-[10px] text-emerald-300 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        🥦 {veg}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 bg-slate-950 p-3.5 border border-slate-850/60 rounded-2xl">
                  <span className="text-[9px] text-gray-500 font-black block tracking-wider uppercase mb-2">
                    食事バランス分析（RGBカラー比率）
                  </span>
                  
                  <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-900 mb-2">
                    <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${selectedHistory.colorRatio.red}%` }} />
                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${selectedHistory.colorRatio.green}%` }} />
                    <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${selectedHistory.colorRatio.yellow}%` }} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                    <div className="bg-red-950/20 px-1 py-1 rounded">
                      <span className="text-red-400 block font-black">赤：{selectedHistory.colorRatio.red}%</span>
                    </div>
                    <div className="bg-emerald-950/20 px-1 py-1 rounded">
                      <span className="text-emerald-400 block font-black">緑：{selectedHistory.colorRatio.green}%</span>
                    </div>
                    <div className="bg-amber-950/20 px-1 py-1 rounded">
                      <span className="text-amber-400 block font-black">黄：{selectedHistory.colorRatio.yellow}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-emerald-500/5 px-4 py-3 border border-emerald-500/10 rounded-xl leading-none">
                  <span className="text-[10px] text-gray-400 font-extrabold">ボスへ与えた確定ダメージ</span>
                  <span className="text-sm font-black text-emerald-450 font-mono text-emerald-400">
                    {selectedHistory.damage.toLocaleString()} DMG
                  </span>
                </div>

                <button
                  onClick={() => { playClick(); setSelectedHistory(null); }}
                  className="w-full py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-xs font-black text-gray-300 rounded-xl transition-colors cursor-pointer animate-fadeIn"
                >
                  閉じるなり！
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
