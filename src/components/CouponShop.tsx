import React, { useState } from "react";
import { Ticket, Coins, Check, AlertCircle, ShoppingBag, Eye } from "lucide-react";
import { Coupon } from "../types";
import { playCoins, playRewardTrumpet } from "../utils/sound";

interface CouponShopProps {
  veggieCoins: number;
  onSpendCoins: (amount: number) => void;
  myCoupons: { id: string; coupon: Coupon; serial: string; date: string }[];
  onAddCoupon: (coupon: Coupon, serial: string) => void;
  showToast: (title: string, desc: string, icon: string) => void;
}

const AVAILABLE_COUPONS: Coupon[] = [
  {
    id: "coupon_1",
    store: "セブン‐イレブン",
    name: "「カップサラダ」各種 50円引きクーポン",
    description: "毎日にもう一品野菜チャージ！お会計時にバーコードを提示してご使用ください。",
    cost: 300,
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    image: "🍅"
  },
  {
    id: "coupon_2",
    store: "ローソン",
    name: "「緑黄色野菜グリーンスムージー」1点無料引換券",
    description: "砂糖不使用、野菜本来のすっきりした甘み。忙しい朝のお供にパーフェクト！",
    cost: 800,
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    image: "🥦"
  },
  {
    id: "coupon_3",
    store: "ファミリーマート",
    name: "「こだわり惣菜・ポテサラ/もやし」1点無料",
    description: "もう少野菜食べたい時の強い味方！人気のお惣菜どれでも1点と引き換え可能です。",
    cost: 500,
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    image: "🥕"
  },
  {
    id: "coupon_4",
    store: "スーパーマーケット連合",
    name: "「産地直送 旬の国産有機野菜セット」10%引",
    description: "本格自炊派アライアンス推奨。新鮮な大地の恵みをおトクに手に入れて、更なる料理召喚へ！",
    cost: 1200,
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    image: "🌽"
  }
];

export const CouponShop: React.FC<CouponShopProps> = ({
  veggieCoins,
  onSpendCoins,
  myCoupons,
  onAddCoupon,
  showToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"catalog" | "pocket">("catalog");
  const [selectedMyCoupon, setSelectedMyCoupon] = useState<{
    id: string;
    coupon: Coupon;
    serial: string;
    date: string;
  } | null>(null);

  // クーポン交換関数
  const handleExchange = (coupon: Coupon) => {
    if (veggieCoins < coupon.cost) {
      showToast(
        "ベジコイン不足",
        `「${coupon.name}」の引き換えには${coupon.cost} VC必要なり！もっと野菜を食べてスキャンするなりよ！`,
        "⚠️"
      );
      return;
    }

    // コインを引く
    onSpendCoins(coupon.cost);
    playCoins();
    playRewardTrumpet();

    // シリアルナンバー擬似生成
    const randSerial = "VR-" + Math.floor(100000 + Math.random() * 900000) + "-" + coupon.id.toUpperCase().replace("COUPON_", "");
    
    // クーポンを追加
    onAddCoupon(coupon, randSerial);

    // 豪華なConfettiを叩く
    if (typeof (window as any).confetti === "function") {
      (window as any).confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.75 }
      });
    }

    showToast(
      "チケット発券成功なり！",
      `「${coupon.store}」のクーポンをゲットしたなり！「マイポケット」から確認するなりよ！`,
      "🎟️"
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <ShoppingBag className="text-amber-400" size={20} />
            ベジコイン・リアルリワード交換所
          </h3>
          <p className="text-xs text-gray-400 mt-1">野菜を食べるコープに貢献して貯まったベジコインを本物のサラダ割引券に交換！</p>
        </div>

        {/* コイン表示 & ポケット切り替え */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setActiveSubTab("catalog")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all duration-200 ${
              activeSubTab === "catalog"
                ? "bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                : "bg-slate-950 text-gray-400 border-gray-800 hover:text-white"
            }`}
          >
            リワード一覧
          </button>
          <button
            onClick={() => setActiveSubTab("pocket")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all duration-200 gap-1.5 flex items-center ${
              activeSubTab === "pocket"
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                : "bg-slate-950 text-gray-400 border-gray-800 hover:text-white"
            }`}
          >
            マイポケット
            {myCoupons.length > 0 && (
              <span className="bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full text-[9px]">
                {myCoupons.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeSubTab === "catalog" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_COUPONS.map((coupon) => {
            const isAffordable = veggieCoins >= coupon.cost;
            return (
              <div 
                key={coupon.id} 
                className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/50 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 shadow-lg group"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border mb-2 block ${coupon.badgeColor}`}>
                      {coupon.store}
                    </span>
                    <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)] select-none">
                      {coupon.image}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {coupon.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {coupon.description}
                  </p>
                </div>
                
                <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-900">
                  <div className="flex items-center gap-1">
                    <Coins size={14} className="text-amber-400 animate-pulse" />
                    <span className="text-sm font-black text-amber-400">{coupon.cost.toLocaleString()} <span className="text-[10px]">VC</span></span>
                  </div>
                  <button
                    onClick={() => handleExchange(coupon)}
                    className={`font-black text-xs px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                      isAffordable
                        ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95"
                        : "bg-slate-900 border border-gray-800/40 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    交換する
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {myCoupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-800 rounded-2xl text-gray-500 text-center gap-3">
              <Ticket size={32} className="text-slate-700 mx-auto" />
              <div>
                <p className="text-sm font-semibold">現在、獲得したクーポンはありませんなり</p>
                <p className="text-xs text-gray-500 mt-1">アタックを成功させ、ベジコインを貯めて交換するなり！</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {myCoupons.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedMyCoupon(item)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedMyCoupon?.id === item.id 
                        ? "bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-500/5" 
                        : "bg-slate-950 border-gray-800/60 hover:border-gray-700/50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded">
                        {item.coupon.store}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">{item.date}</span>
                    </div>
                    <h5 className="text-xs font-extrabold text-white mt-2 truncate">{item.coupon.name}</h5>
                    <div className="flex justify-between items-center mt-2.5 pt-1.5 border-t border-gray-900 text-[10px]">
                      <span className="text-gray-500 font-mono">シリアル: {item.serial}</span>
                      <span className="text-emerald-400 flex items-center font-bold gap-0.5">
                        <Eye size={10} /> 詳細表示
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* クーポン拡大表示 / バーコード */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-center items-center relative overflow-hidden">
                {selectedMyCoupon ? (
                  <div className="w-full text-center space-y-4">
                    <div className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] select-none">
                      {selectedMyCoupon.coupon.image}
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider block">
                        {selectedMyCoupon.coupon.store}
                      </span>
                      <h4 className="text-sm font-black text-white mt-1">
                        {selectedMyCoupon.coupon.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1 px-4">
                        {selectedMyCoupon.coupon.description}
                      </p>
                    </div>

                    {/* モックバーコード */}
                    <div className="bg-white p-3.5 rounded-xl inline-block shadow-inner w-full max-w-[220px] mx-auto select-none">
                      <div className="h-10 w-full flex justify-between gap-1 items-stretch bg-white">
                        {/* 擬似白黒バーコード */}
                        {[3,1,4,2,3,1,2,4,1,3,2,1,4,2,1,3,1,2].map((w, idx) => (
                          <div 
                            key={idx} 
                            style={{ flexGrow: w }} 
                            className={`${idx % 2 === 0 ? "bg-black" : "bg-white"} h-full`}
                          ></div>
                        ))}
                      </div>
                      <div className="text-[10px] text-black font-mono tracking-[4px] mt-2 text-center font-semibold">
                        {selectedMyCoupon.serial}
                      </div>
                    </div>

                    <div className="text-[9px] text-gray-500">
                      有効期限：発券日より30日間有効
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 space-y-2">
                    <Eye size={24} className="text-slate-800 mx-auto" />
                    <p className="text-xs font-semibold">左の一覧からクーポンを選択して、<br />お会計用のバーコード付き詳細画面を展開するなり。</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
