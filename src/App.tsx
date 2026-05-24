import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, 
  Coins, 
  Sparkles, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Heart, 
  TrendingUp, 
  Sword, 
  CheckCircle,
  Camera,
  HelpCircle,
  User,
  Users,
  Award,
  BookOpen
} from "lucide-react";
import { LiveLog, Coupon, ScanResult, UserProfile, PhotoHistoryItem, DetectedMeal } from "./types";
import { BossCard } from "./components/BossCard";
import { LiveLogs } from "./components/LiveLogs";
import { CouponShop } from "./components/CouponShop";
import { CameraSelector } from "./components/CameraSelector";
import { ProfileModal } from "./components/ProfileModal";
import { PhotoArchive } from "./components/PhotoArchive";
import { LevelRankingModal } from "./components/LevelRankingModal";
import { AchievementsModal, ACHIEVEMENTS_LIST } from "./components/AchievementsModal";
import { ClanModal } from "./components/ClanModal";
import { 
  playClick, 
  playSummon, 
  playScanTick, 
  playDamage, 
  playCoins, 
  playRewardTrumpet 
} from "./utils/sound";

// メンバー擬似ログ用データ
const MOCK_NAMES = ["みどりママ", "タクマ_23", "ヘルシー親方", "サラダ姫", "ベジオタ2世", "ベジタブル将軍", "薬膳の賢者", "筋トレ仙人"];
const MOCK_DISHES = [
  { name: "ピリ辛もやしのナムル風サラダ", tag: "トリプルもやし", minDmg: 1200, maxDmg: 1800, icon: "🥗" },
  { name: "すっきり緑黄色スムージー", tag: "トリプルグリーン", minDmg: 2200, maxDmg: 3000, icon: "🥦" },
  { name: "完熟トマトのカプレーゼピッツァ", tag: "🍅トマトコンボ", minDmg: 2400, maxDmg: 3500, icon: "🍅" },
  { name: "アスパラとキノコのオーガニックホイル焼き", tag: "食物繊維バリア破り", minDmg: 1400, maxDmg: 2000, icon: "🍄" },
  { name: "ごろごろ夏野菜の薬膳薬膳カレー", tag: "黄の衝撃", minDmg: 2500, maxDmg: 3800, icon: "🍛" },
  { name: "完熟アボカドのサーモンカルパッチョ", tag: "オメガ3バフ", minDmg: 2000, maxDmg: 2800, icon: "🥑" },
  { name: "まるごとブロッコリーの温野菜ホット温サラダ", tag: "🥦森のパワー", minDmg: 2300, maxDmg: 3200, icon: "🥦" },
  { name: "特上大根おろしと厚揚げのみぞれ煮", tag: "低カロリー斬り", minDmg: 1100, maxDmg: 1600, icon: "🍲" }
];

export default function App() {
  // アプリケーション状態
  const [activeTab, setActiveTab] = useState<"action" | "shop" | "history">("action");
  const [mobileTab, setMobileTab] = useState<"battle" | "summon" | "shop" | "history">("battle");
  
  const [level, setLevel] = useState<number>(() => {
    const saved = localStorage.getItem("veggie_raid_level");
    return saved ? Math.min(1000, parseInt(saved, 10)) : 24;
  });
  const [expPercent, setExpPercent] = useState<number>(75);
  const [veggieCoins, setVeggieCoins] = useState<number>(() => {
    const saved = localStorage.getItem("veggie_raid_coins");
    return saved ? parseInt(saved, 10) : 1240;
  });
  const [streak, setStreak] = useState<number>(5);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);

  // アチーブメント状態
  const [claimedAchievements, setClaimedAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem("veggie_raid_claimed_achievements");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);

  // 1日1回のアタック制限管理
  const [hasAttackedToday, setHasAttackedToday] = useState<boolean>(() => {
    const saved = localStorage.getItem("veggie_raid_last_attack_date");
    const today = new Date().toISOString().slice(0, 10);
    return saved === today;
  });

  // 検出した過去の料理一覧 (厳選プール)
  const [detectedMeals, setDetectedMeals] = useState<DetectedMeal[]>(() => {
    const saved = localStorage.getItem("veggie_raid_detected_meals");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Ignore json error
      }
    }
    return [
      {
        id: "detected_init_1",
        timestamp: "05-23 09:12",
        imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=650",
        scanResult: {
          dishName: "完熟トマトと有機バジルの本格カプレーゼ",
          detectedVeggies: ["完熟トマト", "有機バジル", "ルッコラ"],
          colorRatio: { red: 60, green: 30, yellow: 10 },
          score: 85,
          damage: 3400,
          damageBoost: true,
          narrative: "リコピンとビタミンの宝庫なり！赤と緑のバランスが最高でボスへの特効ダメージが倍増するなり！",
          healthyLevel: "極上ベジタブル"
        }
      },
      {
        id: "detected_init_2",
        timestamp: "05-22 13:40",
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=650",
        scanResult: {
          dishName: "新鮮ブロッコリーと温野菜サラダ",
          detectedVeggies: ["ブロッコリー", "大豆もやし", "ちぎりキャベツ"],
          colorRatio: { red: 5, green: 75, yellow: 20 },
          score: 72,
          damage: 2100,
          damageBoost: true,
          narrative: "食物繊維とビタミンCが豊富なブロッコリーをメインにした一品！特効コンボが発動！",
          healthyLevel: "本格ヘルシー"
        }
      }
    ];
  });

  const [selectedMealId, setSelectedMealId] = useState<string | null>("detected_init_1");

  const handleResetAttackLimit = () => {
    localStorage.removeItem("veggie_raid_last_attack_date");
    setHasAttackedToday(false);
    showToast("デバッグ：リミット解除なり！", "本日の提出制限を解除したなり。もう一度提出(アタック)をテストできるなりよ！", "🛠️");
  };

  // ユーザープロフィール状態
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "ベジソルジャー",
    title: "完熟赤トマトの重騎士",
    avatar: "🧑‍🌾",
    favoriteVeggie: "トマト 🍅",
    dailyGoal: 350,
    joinClan: "ベジタブル騎士団"
  });

  // プロフィール編集モーダルの開閉
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // レベル・ランキング詳細モーダルの開閉
  const [isLevelRankingOpen, setIsLevelRankingOpen] = useState<boolean>(false);

  // クラン管理モーダルの開閉
  const [isClanOpen, setIsClanOpen] = useState<boolean>(false);

  // 提出された野菜写真ログのコレクション
  const [photoHistory, setPhotoHistory] = useState<PhotoHistoryItem[]>([
    {
      id: "hist_init_1",
      timestamp: "05-23 09:12",
      imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=650",
      dishName: "完熟トマトと有機バジルの本格カプレーゼ",
      detectedVeggies: ["完熟トマト", "有機バジル", "ルッコラ"],
      damage: 3400,
      colorRatio: { red: 60, green: 30, yellow: 10 },
      score: 85
    },
    {
      id: "hist_init_2",
      timestamp: "05-22 13:40",
      imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=650",
      dishName: "新鮮ブロッコリーと温野菜サラダ",
      detectedVeggies: ["ブロッコリー", "大豆もやし", "ちぎりキャベツ"],
      damage: 2100,
      colorRatio: { red: 5, green: 75, yellow: 20 },
      score: 72
    }
  ]);

  
  // ボスステート
  const [bossHp, setBossHp] = useState<number>(423500);
  const maxBossHp = 1000000;
  const [isBossFlinching, setIsBossFlinching] = useState<boolean>(false);

  // ログ状態
  const [logs, setLogs] = useState<LiveLog[]>([
    {
      id: "log_1_init",
      user: "みどりママ",
      timeText: "3分前",
      avatar: "🥗",
      dishName: "緑黄色野菜野菜の濃縮スープ",
      tag: "🥦 トリプルグリーン",
      damage: 3800,
      icon: "🥣"
    },
    {
      id: "log_2_init",
      user: "タクマ_23",
      timeText: "7分前",
      avatar: "🍕",
      dishName: "特製カプレーゼ",
      tag: "🍅 トマトコンボ",
      damage: 2400,
      icon: "🍅"
    },
    {
      id: "log_3_init",
      user: "サラダ姫",
      timeText: "15分前",
      avatar: "🥑",
      dishName: "たっぷりアボカドのコブサラダ",
      tag: "健康バランス",
      damage: 1500,
      icon: "🥗"
    }
  ]);

  // チケット状態
  const [myCoupons, setMyCoupons] = useState<{ id: string; coupon: Coupon; serial: string; date: string }[]>([]);

  // AIアクション状態
  const [summonPrompt, setSummonPrompt] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  
  const [isSummonLoading, setIsSummonLoading] = useState<boolean>(false);
  const [summonStageMessage, setSummonStageMessage] = useState<string>("");
  const [summonedImg, setSummonedImg] = useState<string>("");
  const [currentSource, setCurrentSource] = useState<"summon" | "camera" | "upload" | "">("");

  // スキャナー演出状態
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // トースト状態
  const [toast, setToast] = useState<{ visible: boolean; title: string; desc: string; icon: string }>({
    visible: false,
    title: "",
    desc: "",
    icon: "🔔"
  });

  // 音声ラッパー
  const withSound = (fn: () => void) => {
    if (isSoundOn) {
      fn();
    }
  };

  // トーストポップアップ
  const showToast = (title: string, desc: string, icon = "🔔") => {
    setToast({ visible: true, title, desc, icon });
  };

  // トースト自動消滅
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // レベル、コイン、実績進捗の永続化同期
  useEffect(() => {
    localStorage.setItem("veggie_raid_level", level.toString());
  }, [level]);

  useEffect(() => {
    localStorage.setItem("veggie_raid_coins", veggieCoins.toString());
  }, [veggieCoins]);

  useEffect(() => {
    localStorage.setItem("veggie_raid_claimed_achievements", JSON.stringify(claimedAchievements));
  }, [claimedAchievements]);

  // 共闘ログの自動スクロール＆模擬生成
  useEffect(() => {
    const handleAddLiveLog = () => {
      const randomName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
      const randomDish = MOCK_DISHES[Math.floor(Math.random() * MOCK_DISHES.length)];
      const damage = Math.floor(randomDish.minDmg + Math.random() * (randomDish.maxDmg - randomDish.minDmg));
      
      const newLog: LiveLog = {
        id: "mock_" + Date.now(),
        user: randomName + " #[C-" + Math.floor(100+Math.random()*900) + "]",
        timeText: "ちょうど今",
        avatar: randomDish.icon,
        dishName: randomDish.name,
        tag: randomDish.tag,
        damage,
        icon: randomDish.icon
      };

      setLogs(prev => [newLog, ...prev.slice(0, 19)]);
      setBossHp(prev => Math.max(0, prev - damage));
    };

    // 15秒ごとに他のプレイヤーのアクションを模倣して更新
    const interval = setInterval(handleAddLiveLog, 15000);
    return () => clearInterval(interval);
  }, []);

  // モバイル向けタブマネジメント
  const handleMobileTabChange = (tab: "battle" | "summon" | "shop" | "history") => {
    withSound(playClick);
    setMobileTab(tab);
    if (tab === "summon") {
      setActiveTab("action");
    } else if (tab === "shop") {
      setActiveTab("shop");
    } else if (tab === "history") {
      setActiveTab("history");
    }
  };

  // プリセット用プロンプトセレクト
  const selectPreset = (type: string, promptText: string) => {
    withSound(playClick);
    setSummonPrompt(type);
    setCustomPrompt(promptText);
    showToast(
      `お題「${type}」読み込み`,
      "特効お題を満たすヘルシーなプロンプトをセットしたなり！",
      type === "トマト" ? "🍅" : "🥦"
    );
  };

  // 【API連携 1】AI料理画像を召喚する
  const handleSummonImage = async () => {
    withSound(playClick);
    
    const finalPrompt = customPrompt.trim() || 
      (summonPrompt === "トマト" ? "Fresh Caprese Salad with sliced ripe red organic tomatoes, mozzarella balls, sweet basil leaves, olive oil drops" :
       summonPrompt === "ブロッコリー" ? "Creamy local broccoli soup potage in a rustic bowl, garnished with toasted pumpkin seeds and green olive oil drizzle" :
       "Mediterranean colorful garden roasted vegetable salad, lemon herb marinade");

    setIsSummonLoading(true);
    setSummonStageMessage("Imagen AI 起動中...");
    setSummonedImg("");
    setScanResult(null);

    // バックグラウンドテキスト変更演出（ユーザーへの配慮）
    const loadingPhases = [
      "健康お題の栄養素を解析中...",
      "最適な野菜野菜をチョイス中...",
      "色とりどりの盛り付けをレンダリング中...",
      "美味しい光彩を配合中なり！あと少し...",
    ];
    let phaseIndex = 0;
    const intervalId = setInterval(() => {
      if (phaseIndex < loadingPhases.length) {
        setSummonStageMessage(loadingPhases[phaseIndex++]);
      }
    }, 2500);

    try {
      const response = await fetch("/api/meal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt })
      });
      const data = await response.json();
      clearInterval(intervalId);

      if (data.success) {
        setSummonedImg(data.imageUrl);
        setCurrentSource("summon");
        withSound(playSummon);
        showToast("料理召喚に成功！", "AIが極めて美味しいそうな野菜プレートを空間に呼び出したなり！", "✨");
      } else {
        throw new Error("API Response failure state");
      }
    } catch (e) {
      clearInterval(intervalId);
      // 万が一のフロント側ハードフォールバック
      const dummyUrl = summonPrompt === "トマト" 
        ? "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=650"
        : summonPrompt === "ブロッコリー"
        ? "https://images.unsplash.com/photo-1547592165-e1d17fed6006?auto=format&fit=crop&q=80&w=650"
        : "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=650";

      setSummonedImg(dummyUrl);
      setCurrentSource("summon");
      showToast("召喚接続制限あり", "（予備用フードマテリアルの座標をデプロイして召喚したなり）", "🥗");
    } finally {
      setIsSummonLoading(false);
    }
  };

  // 外側からのキャプチャ・アップロード受け取り
  const handleCapturedImage = (base64: string, source: "camera" | "upload") => {
    setSummonedImg(base64);
    setCurrentSource(source);
    setScanResult(null);
    withSound(playSummon);
  };

  const handleClearImage = () => {
    setSummonedImg("");
    setCurrentSource("");
    setScanResult(null);
    withSound(playClick);
  };

  // 【API連携 2】写真をAI認識してスキャナーに一時装填（厳選用・何度でも可能）
  const handleScanAndAttack = () => {
    if (isScanning || !summonedImg) return;
    
    withSound(playClick);
    setIsScanning(true);
    setScanProgress(0);

    // スキャン走査＆カウントアップ演出
    const tickInterval = setInterval(() => {
      setScanProgress(prev => {
        const next = prev + 4;
        if (next >= 100) {
          clearInterval(tickInterval);
          executeScanRequest();
          return 100;
        }
        // ピコピコ音
        if (next % 12 === 0) {
          withSound(() => playScanTick(next));
        }
        return next;
      });
    }, 120);
  };

  // 本物のAIまたはシミュレーションを叩く（成分分析プレビューのみ）
  const executeScanRequest = async () => {
    try {
      const response = await fetch("/api/meal/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: currentSource === "summon" ? "" : summonedImg, // 召喚時はバックエンド側でも解決可能
          isPresetUrl: currentSource === "summon",
          promptUsed: customPrompt || summonPrompt || "mixed salad"
        })
      });
      const res = await response.json();

      if (res.success && res.data) {
        const result: ScanResult = res.data;
        setScanResult(result);

        const newMeal: DetectedMeal = {
          id: "meal_" + Date.now(),
          timestamp: new Date().toLocaleDateString("ja-JP", {
            month: "2-digit",
            day: "2-digit"
          }) + " " + new Date().toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit"
          }),
          imageUrl: summonedImg || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=350",
          scanResult: result
        };

        setDetectedMeals(prev => {
          const next = [newMeal, ...prev];
          localStorage.setItem("veggie_raid_detected_meals", JSON.stringify(next));
          return next;
        });
        setSelectedMealId(newMeal.id);

        showToast(
          "スキャン分析完了なり！",
          `「${result.dishName}」の検出に成功。厳選プールおよびWEEKLY BOSS攻撃用リストにセットしたなりよ！`,
          "🔬"
        );
      } else {
        throw new Error("Scan api failed");
      }
    } catch (err) {
      showToast("解析失敗なり！", "食料にバグが混入したなり。もう一度お試しください。", "⚠️");
    } finally {
      setIsScanning(false);
    }
  };

  // 【1日1回限定】特定または選択された料理で本提出（ボス攻撃とログ確定）
  const handleFinalAttack = (targetMeal?: DetectedMeal) => {
    // 引数がない場合は、selectedMealId から取得、それも無ければ既存の scanResult
    const meal = targetMeal || detectedMeals.find(m => m.id === selectedMealId) || (scanResult ? {
      id: "scan_fallback",
      timestamp: "いま",
      imageUrl: summonedImg || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=350",
      scanResult: scanResult
    } : null);

    if (!meal) {
      showToast("提出する料理がありません", "先に料理を召喚または撮影して、スキャン分析を完了させてくださいな！", "⚠️");
      return;
    }

    if (hasAttackedToday) {
      showToast("本日の限定アタック完了済みなり！", "また明日、お腹をヘルシーにしてアタックするなりよ！", "🔒");
      return;
    }

    const mResult = meal.scanResult;

    withSound(playClick);

    // ゲーム数値のコミット
    // 1. ボスHP減
    setBossHp(prev => Math.max(0, prev - mResult.damage));
    // 2. 被弾振動
    setIsBossFlinching(true);
    withSound(playDamage);
    
    setTimeout(() => {
      setIsBossFlinching(false);
    }, 500);

    // 3. ベジコイン獲得
    const addedCoins = Math.floor(mResult.score / 10);
    setVeggieCoins(prev => prev + addedCoins);
    
    // 4. 連続記録を1加算
    setStreak(prev => prev + 1);

    // 5. 経験値上昇
    setExpPercent(prev => {
      const next = prev + 15;
      if (next >= 100) {
        if (level >= 1000) {
          showToast("MAX LEVEL なリ！", "お見事！レベルは最大レベル1000に到達しているなりよ！", "🔥");
          return 100;
        }
        const nextLevel = Math.min(1000, level + 1);
        setLevel(nextLevel);
        showToast("LEVEL UP なリ！", `お見事！レベル ${nextLevel} に到達したなりよ！`, "🎉");
        return next - 100;
      }
      return next;
    });

    // 5.5 野菜写真ログ図鑑にアイテムをスタック
    const newHistoryItem: PhotoHistoryItem = {
      id: "hist_" + Date.now(),
      timestamp: new Date().toLocaleDateString("ja-JP", {
        month: "2-digit",
        day: "2-digit"
      }) + " " + new Date().toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      imageUrl: meal.imageUrl,
      dishName: mResult.dishName,
      detectedVeggies: mResult.detectedVeggies,
      damage: mResult.damage,
      colorRatio: mResult.colorRatio,
      score: mResult.score
    };
    setPhotoHistory(prev => [newHistoryItem, ...prev]);

    // 6. アライアンス共闘ログへの追加
    const isTomato = mResult.detectedVeggies.some(v => v.includes("トマト"));
    const isBroccoli = mResult.detectedVeggies.some(v => v.includes("ブロッコリー"));
    const tagText = mResult.damageBoost 
      ? (isTomato ? "🍅 トマトコンボ" : isBroccoli ? "🥦 森の特効コンボ" : "ヘルシーコンボ") 
      : "ヘルシーアタック";

    const playerLog: LiveLog = {
      id: "player_" + Date.now(),
      user: `${userProfile.name} [${userProfile.joinClan}]`,
      timeText: "たった今",
      avatar: userProfile.avatar,
      dishName: mResult.dishName,
      tag: tagText,
      damage: mResult.damage,
      icon: isTomato ? "🍅" : isBroccoli ? "🥦" : "🥗"
    };
    setLogs(prev => [playerLog, ...prev]);

    // 今日の攻撃を登録
    const todayStr = new Date().toISOString().slice(0, 10);
    localStorage.setItem("veggie_raid_last_attack_date", todayStr);
    setHasAttackedToday(true);

    // 紙吹雪
    if (typeof (window as any).confetti === "function") {
      (window as any).confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    showToast(
      "提出アタック大成功！",
      `${mResult.dishName} を提出！ ${mResult.damage.toLocaleString()} ダメージをジャンク大王に与えて、ログに固定完了なり！`,
      "⚔️"
    );
  };

  // クーポン獲得時
  const handleSpendCoins = (amount: number) => {
    setVeggieCoins(prev => Math.max(0, prev - amount));
  };

  // アチーブメント達成時の報酬受取処理
  const handleClaimAchievement = (achId: string, levelReward: number, coinReward: number) => {
    setLevel(prev => {
      const nextLevel = Math.min(1000, prev + levelReward);
      showToast(
        "実績クリアなり！🎉",
        `レベルが ${prev} ➔ ${nextLevel} に上昇！さらにベジコインを ${coinReward} 枚獲得したなりよ！`,
        "🏆"
      );
      return nextLevel;
    });

    setVeggieCoins(prev => prev + coinReward);
    setClaimedAchievements(prev => {
      if (prev.includes(achId)) return prev;
      return [...prev, achId];
    });

    if (typeof (window as any).confetti === "function") {
      (window as any).confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 }
      });
    }
  };

  // 受け取り可能な実績数の動的集計
  const claimableCount = ACHIEVEMENTS_LIST.filter(ach => {
    if (claimedAchievements.includes(ach.id)) return false;
    
    let current = 0;
    const target = ach.targetValue;
    const totalMealsScanned = photoHistory.length;
    const totalDamageDealt = photoHistory.reduce((sum, h) => sum + h.damage, 0);
    const isInClan = userProfile.joinClan && userProfile.joinClan !== "" && userProfile.joinClan !== "未所属";

    switch (ach.category) {
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
    return current >= target;
  }).length;

  const handleAddMyCoupon = (coupon: Coupon, serial: string) => {
    const formattedDate = new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    setMyCoupons(prev => [
      { id: "claimed_" + Date.now(), coupon, serial, date: formattedDate },
      ...prev
    ]);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* 1. ヘッダー */}
      <header className="border-b border-gray-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-3 sm:px-4 py-2.5 sm:py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* 左：ロゴ (モバイルでよりコンパクトに) */}
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => withSound(playClick)}>
            <div className="bg-gradient-to-tr from-emerald-500 to-green-400 p-2 rounded-xl sm:rounded-2xl text-slate-950 shadow-md shadow-emerald-500/20 flex-shrink-0">
              <Sword size={16} className="stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-xl font-black tracking-wider bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 bg-clip-text text-transparent block leading-tight">
                VEGGIE RAID
              </span>
              <span className="text-[8px] sm:text-[10px] hidden xs:block text-gray-400 font-extrabold tracking-widest leading-none mt-1 truncate">
                AI野菜栄養レイド健康管理RPG
              </span>
            </div>
          </div>

          {/* 右：ステータスダッシュボード (モバイルではフレックスラップやコンパクトな余白を適用) */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
            
            {/* 音声トグル */}
            <button 
              onClick={() => setIsSoundOn(!isSoundOn)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-slate-900 border border-transparent hover:border-gray-800 transition-colors cursor-pointer"
              title={isSoundOn ? "サウンドを切る" : "サウンドをON"}
            >
              {isSoundOn ? <Volume2 size={14} className="text-emerald-400" /> : <VolumeX size={14} className="text-gray-500" />}
            </button>

            {/* プレイヤーアバター＆クリック時プロフィール設定起動 */}
            <button
              onClick={() => { withSound(playClick); setIsProfileOpen(true); }}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 hover:border-emerald-500/40 border border-gray-800 rounded-xl px-2 py-0.5 sm:py-1 transition-all cursor-pointer shadow-inner shadow-black group text-[10px] sm:text-xs font-black text-slate-200 h-8 sm:h-9"
              title={`プロフィールを編集 (${userProfile.title})`}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden flex items-center justify-center bg-slate-950 flex-shrink-0">
                {userProfile.avatar.startsWith("data:") || userProfile.avatar.startsWith("http") ? (
                  <img 
                    src={userProfile.avatar} 
                    alt="Player Icon" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <span className="text-xs sm:text-sm select-none filter drop-shadow animate-fadeIn">{userProfile.avatar}</span>
                )}
              </div>
              <span className="hidden sm:inline max-w-[80px] truncate text-gray-300 font-extrabold group-hover:text-emerald-300 transition-colors">{userProfile.name}</span>
            </button>

            {/* クラン本拠地ボタン 🛡️ */}
            <button
              onClick={() => { withSound(playClick); setIsClanOpen(true); }}
              className="flex items-center gap-1 sm:gap-2.5 bg-slate-900 border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-slate-850 rounded-xl px-2.5 py-1 transition-all cursor-pointer shadow-inner shadow-black group text-[10px] sm:text-xs font-black h-8 sm:h-9"
              title="クラン本拠地を見る 🛡️"
            >
              <Users size={13} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="hidden xs:inline-block max-w-[75px] sm:max-w-[90px] truncate text-gray-300 group-hover:text-emerald-300 transition-colors">
                {userProfile.joinClan || "未所属"}
              </span>
            </button>

            {/* アチーブメントボタン 🏆 */}
            <button
              onClick={() => { withSound(playClick); setIsAchievementsOpen(true); }}
              className="flex items-center gap-1 sm:gap-2 bg-slate-900 border border-amber-500/20 hover:border-amber-500/50 hover:bg-slate-850 rounded-xl px-2.5 py-1 transition-all cursor-pointer shadow-inner shadow-black group text-[10px] sm:text-xs font-black h-8 sm:h-9 relative"
              title="アチーブメント（報酬受け取り）を見る 🏆"
            >
              <Award size={13} className="text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden xs:inline-block max-w-[70px] truncate text-gray-350 group-hover:text-amber-300 transition-colors">
                実績
              </span>
              {/* 受け取り可能な報酬がある場合、赤丸バッジを点滅 */}
              {claimableCount > 0 && (
                <span className="absolute -top-1.5 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>

            {/* レベル表示 ＆ クリック時レベル詳細・ランキングを起動 */}
            <button
              onClick={() => { withSound(playClick); setIsLevelRankingOpen(true); }}
              className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-900 border border-emerald-500/20 rounded-xl px-2.5 py-1 transition-all cursor-pointer hover:border-emerald-500/50 hover:bg-slate-850 shadow-inner group text-[10px] sm:text-xs font-black h-8 sm:h-9"
              title="レベル詳細・ランキングを見る 🏆"
            >
              <div className="flex flex-col items-start leading-none text-left">
                <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors">Lv.{level}</span>
                {/* 経験値進捗ミニバー */}
                <div className="w-8 sm:w-12 h-1 bg-slate-950 rounded-full mt-0.5 overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${expPercent}%` }} />
                </div>
              </div>
              <span className="hidden md:inline-block text-[8px] text-gray-500 font-extrabold bg-slate-950 px-1 py-0.2 rounded border border-slate-805">
                🏆 ランク
              </span>
            </button>

            {/* 連続記録 */}
            <div className="bg-slate-900/60 border border-amber-500/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center space-x-1 sm:space-x-1.5 shadow-sm">
              <Flame size={12} className="text-amber-500 fill-amber-500 animate-bounce" />
              <span className="text-[10px] sm:text-xs font-black text-amber-400">
                <span>{streak}</span>日
              </span>
            </div>

            {/* ベジコイン */}
            <div className="bg-slate-900/60 border border-emerald-500/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center space-x-1 sm:space-x-1.5 shadow-sm">
              <Coins size={12} className="text-yellow-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-black text-white">
                <span className="text-yellow-400 font-mono">{veggieCoins}</span>
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* 2. メイングリッド (モバイルでの余白・詰まりとボトムナビ配慮) */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 pb-24 lg:pb-6">
        
        {/* レフトカラム: ボス ＆ 協力ログ (5/12) */}
        <section className={`lg:col-span-5 flex flex-col space-y-6 ${mobileTab === "battle" ? "flex" : "hidden lg:flex"}`}>
          
          {/* ボスカード */}
          <BossCard 
            currentHp={bossHp} 
            maxHp={maxBossHp} 
            isFlinching={isBossFlinching} 
          />

          {/* ⚔️ WEEKLY RAID BOSS 提出お皿セレクター ＆ アタック */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800/60 pb-2.5">
              <span className="text-xs font-black text-gray-200 tracking-wider flex items-center gap-1.5 uppercase">
                <Sword size={14} className="text-rose-500 animate-pulse" />
                <span>レイド提出お皿の選択 ＆ 攻撃</span>
              </span>
              <span className="text-[10px] text-gray-550 font-bold">
                ストックから装備
              </span>
            </div>

            {/* スキャン済みの食事がない場合 */}
            {detectedMeals.length === 0 ? (
              <div className="p-4 bg-slate-950/40 border border-gray-850/60 rounded-2xl text-center">
                <p className="text-[11px] text-gray-400 font-bold leading-normal">
                  スキャンした野菜料理がありませんなり 🥺
                </p>
                <p className="text-[9px] text-gray-500 mt-1 leading-normal">
                  右側の「AI料理を召喚」か「カメラ撮影スキャン」で料理をまずは1つ登録・分析（厳選）して、ここからボス攻撃を行うなり！
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* 料理クイック切替カルーセル/セレクター */}
                <div className="space-y-1.5">
                  <label className="text-[9px] text-gray-500 font-black tracking-widest uppercase block">
                    厳選ストックから攻撃お皿を選択：
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin max-w-full">
                    {detectedMeals.map((meal) => {
                      const isSelected = meal.id === selectedMealId;
                      return (
                        <button
                          key={meal.id}
                          onClick={() => {
                            withSound(playClick);
                            setSelectedMealId(meal.id);
                          }}
                          className={`flex-shrink-0 p-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-500/10 text-white"
                              : "bg-slate-950/40 border-slate-850 hover:border-gray-700 text-gray-400 hover:text-gray-200"
                          }`}
                        >
                          <img
                            src={meal.imageUrl}
                            alt={meal.scanResult.dishName}
                            className={`w-7 h-7 rounded-lg object-cover ${isSelected ? "ring-2 ring-emerald-500/50" : ""}`}
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-left font-bold text-[9px] max-w-[90px]">
                            <div className="leading-tight text-gray-200 truncate">{meal.scanResult.dishName}</div>
                            <div className="text-[8px] text-emerald-400 leading-none mt-0.5 truncate">{meal.scanResult.damage.toLocaleString()} DMG</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 現在選択中の料理プレビュー */}
                {(() => {
                  const meal = detectedMeals.find(m => m.id === selectedMealId);
                  if (!meal) return null;

                  const isTomato = meal.scanResult.detectedVeggies.some(v => v.includes("トマト"));
                  const isBroccoli = meal.scanResult.detectedVeggies.some(v => v.includes("ブロッコリー"));

                  return (
                    <div className="bg-slate-950/90 rounded-2xl border border-slate-850 p-3 flex items-start gap-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl pointer-events-none"></div>

                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-slate-800 relative bg-slate-900">
                        <img
                          src={meal.imageUrl}
                          alt={meal.scanResult.dishName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-0.5 left-0.5 bg-black/60 px-1 py-0.2 rounded text-[7px] text-amber-400 font-bold">
                          ★ {meal.scanResult.score}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isTomato && <span className="text-xs" title="特効トマト 2.0x">🍅</span>}
                          {isBroccoli && <span className="text-xs" title="特効ブロッコリー 1.5x">🥦</span>}
                          <span className="text-[9px] bg-slate-900 text-gray-400 px-1.5 py-0.2 rounded font-bold border border-slate-800 scale-95 origin-left">
                            {meal.scanResult.healthyLevel}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-gray-200 mt-1 truncate">
                          {meal.scanResult.dishName}
                        </h4>
                        <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-gray-900">
                          <span className="text-[9px] text-gray-500 font-bold">攻撃時のダメージ:</span>
                          <span className="text-xs font-black text-amber-400 font-mono">
                            {meal.scanResult.damage.toLocaleString()} DMG
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 提出攻撃アクション実行エリア */}
                <div className="pt-1 space-y-2.5">
                  {hasAttackedToday ? (
                    <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl text-center space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 flex items-center justify-center gap-1">
                        <span>🔒</span> 本日分のレイドアタックは提出済みなり！
                      </p>
                      <p className="text-[8px] text-gray-650 font-medium">
                        今日の攻撃は完了。明日、新しいお皿で挑戦してね！
                      </p>
                      <button
                        onClick={handleResetAttackLimit}
                        className="text-[9px] text-gray-500 hover:text-emerald-400 font-bold border border-slate-800 px-2 py-0.5 rounded bg-slate-950/40 cursor-pointer mt-1"
                      >
                        🛠️ デバッグ：提出制限を解除
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          const meal = detectedMeals.find(m => m.id === selectedMealId);
                          if (meal) handleFinalAttack(meal);
                        }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 font-black text-xs text-white shadow-lg shadow-red-950/20 hover:brightness-110 cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <Sword size={13} />
                        この一皿でボスに攻撃する！ (1日1回限定) ⚔️
                      </button>
                      <p className="text-[8px] text-gray-500 text-center leading-normal">
                        ※厳選されたお皿を使って、本日1回のみ本番レイドダメージをジャンク大王へ叩き込むなり！
                      </p>
                    </div>
                  )}

                  {/* レベル・ランキング詳細 ＆ クラン本拠地 へのショートカット */}
                  <div className="pt-0.5 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { withSound(playClick); setIsLevelRankingOpen(true); }}
                      className="text-[9px] text-emerald-400 hover:text-emerald-300 font-extrabold flex items-center gap-1 bg-slate-950/60 hover:bg-slate-950 border border-slate-850/80 px-2 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-black justify-center"
                    >
                      🏆 レベルバフ確認
                    </button>
                    <button
                      onClick={() => { withSound(playClick); setIsClanOpen(true); }}
                      className="text-[9px] text-amber-400 hover:text-amber-300 font-extrabold flex items-center gap-1 bg-slate-950/60 hover:bg-slate-950 border border-slate-850/80 px-2 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-black justify-center"
                    >
                      🛡️ 部隊(クラン)名簿と除退籍
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 協力アクションログ */}
          <LiveLogs logs={logs} />
        </section>

        {/* ライトカラム: AI召喚 / スキャン / リワード (7/12) */}
        <section className={`lg:col-span-7 flex flex-col space-y-6 ${mobileTab !== "battle" ? "flex" : "hidden lg:flex"}`}>
          
          {/* タブ切り替え (PC向けにのみ表示し、モバイルではボトムナビが存在するため非表示) */}
          <div className="hidden lg:flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
            <button 
              onClick={() => { withSound(playClick); setActiveTab("action"); }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold transition-all gap-2 flex items-center justify-center cursor-pointer ${
                activeTab === "action" 
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/15" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Camera size={14} /> 野菜をスキャン
            </button>
            <button 
              onClick={() => { withSound(playClick); setActiveTab("history"); }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold transition-all gap-2 flex items-center justify-center cursor-pointer ${
                activeTab === "history" 
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/15" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <BookOpen size={14} /> 野菜写真ログ図鑑
            </button>
            <button 
              onClick={() => { withSound(playClick); setActiveTab("shop"); }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold transition-all gap-2 flex items-center justify-center cursor-pointer ${
                activeTab === "shop" 
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/15" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Coins size={14} /> リアル特典ショップ
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "action" ? (
              <motion.div 
                key="action_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                
                {/* ミニガイド */}
                <div className="bg-emerald-950/15 border border-emerald-500/20 rounded-2xl p-4 flex gap-3 text-emerald-300">
                  <span className="text-xl">🥗</span>
                  <p className="text-xs leading-relaxed font-semibold">
                    <strong>【野菜AIアプリ実験室】</strong><br />
                    カメラでお手元の本物の野菜料理を撮影するか、写真をアップロードしてセットしましょう。装填した料理イメージを「AI栄養解析スキャナー」に通すことで、自動で野菜の要素やヘルシー度を判定し、強力なボムをレイドボスへ叩き込めます！
                  </p>
                </div>

                {/* カメラ ＆ D&D アップローダー */}
                <CameraSelector 
                  onImageCaptured={handleCapturedImage}
                  onClearImage={handleClearImage}
                  currentImageUrl={summonedImg}
                  currentImageSource={currentSource}
                />

                {/* スキャナービュー */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 flex flex-col items-center shadow-lg relative">
                  <h3 className="text-sm font-black text-gray-200 w-full flex items-center justify-between border-b border-gray-800 pb-3 mb-5">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-black">1</span>
                      検出中の料理とAI栄養分析機
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {isScanning ? `${scanProgress}% スキャン中...` : summonedImg ? "料理装填済" : "スキャナー待機中"}
                    </span>
                  </h3>

                  {/* プレビュー画像、および走査レーザー演出 */}
                  <div className="relative w-full max-w-sm aspect-square bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex flex-col items-center justify-center shadow-inner">
                    
                    {/* レーザーライン */}
                    {isScanning && (
                      <motion.div 
                        initial={{ top: "0%" }}
                        animate={{ top: ["0%", "98%", "0%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] z-20"
                      />
                    )}

                    {summonedImg ? (
                      <img 
                        src={summonedImg} 
                        alt="Target Meal"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="text-center p-6 space-y-4 text-gray-500 pointer-events-none">
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-gray-800">
                          <Sword size={26} className="text-slate-700" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-300">野菜料理を上に装填してくださいなり</p>
                          <p className="text-[10px] text-gray-500 mt-1">「カメラでパシャリ撮影」するか「お手元の料理写真をアップロード」するとスキャナーが自動解放されます。</p>
                        </div>
                      </div>
                    )}

                    {/* AI処理ローディング (召喚中) */}
                    {isSummonLoading && (
                      <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center p-6 space-y-4">
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-t-emerald-400 rounded-full animate-spin"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-emerald-400 animate-pulse">{summonStageMessage}</p>
                          <p className="text-[9px] text-gray-500 mt-1.5">※Imagen AIモデルを初めて起動する場合、15秒ほどかかる時があるなり。</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 攻撃トリガーボタン */}
                  {summonedImg && !isSummonLoading && (
                    <div className="w-full mt-5">
                      <button
                        onClick={handleScanAndAttack}
                        disabled={isScanning}
                        className={`w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 font-black text-sm text-slate-950 shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                          isScanning 
                            ? "bg-slate-800 text-gray-500 cursor-not-allowed border border-gray-800 shadow-none scale-100" 
                            : "hover:brightness-115 active:scale-98 shadow-emerald-500/15 cursor-pointer scale-100"
                        }`}
                      >
                        {isScanning ? (
                          <>
                            <div className="w-4.5 h-4.5 border-3 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                            AIお腹栄養素スキャン駆動中... ({scanProgress}%)
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} className="animate-pulse" />
                            AIで食事を分析プレビュー（何度でも厳選可能） 🔬
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-gray-500 text-center mt-2.5 font-bold">
                        ※スキャンは納得いくまで何度でも行ってお皿を厳選できるなりよ！
                      </p>
                    </div>
                  )}

                  {/* 分析結果出力カード（スキャン完了後） */}
                  <AnimatePresence>
                    {scanResult && !isScanning && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full mt-6 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 overflow-hidden"
                      >
                        <div className="flex justify-between items-start border-b border-gray-900 pb-3">
                          <div>
                            <h4 className="text-sm font-black text-emerald-300">
                              {scanResult.dishName}
                            </h4>
                            <span className="text-[10px] text-gray-500 block mt-1">AI特定グレード：{scanResult.healthyLevel}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-500 block font-bold">食材スコア値</span>
                            <span className="text-lg font-black text-yellow-400 font-mono">
                              {scanResult.score.toLocaleString()} <span className="text-[11px] font-bold">pts</span>
                            </span>
                          </div>
                        </div>

                        {/* 検出素材 */}
                        <div>
                          <span className="text-[10px] text-gray-500 block mb-2 font-bold uppercase tracking-wider">見つかった健康野菜パーツ：</span>
                          <div className="flex flex-wrap gap-1.5">
                            {scanResult.detectedVeggies.map((veg, idx) => (
                              <span 
                                key={idx}
                                className="bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 hover:border-emerald-500/30 transition-all cursor-pointer"
                              >
                                <CheckCircle size={10} className="text-emerald-400 flex-shrink-0" />
                                {veg}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* 3色カラーバッファ */}
                        <div className="space-y-2 pt-1 border-t border-gray-900/40">
                          <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-wider">3色の栄養バランス：</span>
                          
                          {/* 赤 */}
                          <div className="space-y-1">
                            <div className="flex items-center text-[10px] justify-between">
                              <span className="text-gray-400 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                                レッド (トマト他：抗酸化作用・美肌・血管防衛)
                              </span>
                              <span className="font-extrabold text-white">{scanResult.colorRatio.red}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-2 rounded-full p-0.5 overflow-hidden">
                              <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${scanResult.colorRatio.red}%` }} />
                            </div>
                          </div>

                          {/* 緑 */}
                          <div className="space-y-1">
                            <div className="flex items-center text-[10px] justify-between">
                              <span className="text-gray-400 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                グリーン (ブロッコリー他：食物繊維・解毒・鉄分)
                              </span>
                              <span className="font-extrabold text-white">{scanResult.colorRatio.green}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-2 rounded-full p-0.5 overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${scanResult.colorRatio.green}%` }} />
                            </div>
                          </div>

                          {/* 黄 */}
                          <div className="space-y-1">
                            <div className="flex items-center text-[10px] justify-between">
                              <span className="text-gray-400 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                                イエロー/他 (パプリカ他：ビタミンC・エネルギー調整)
                              </span>
                              <span className="font-extrabold text-white">{scanResult.colorRatio.yellow}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-2 rounded-full p-0.5 overflow-hidden">
                              <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${scanResult.colorRatio.yellow}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* 実況戦闘ナレーション */}
                        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl leading-relaxed text-xs text-gray-300 font-medium">
                          <span className="font-extrabold text-amber-400 block mb-1">【戦闘実況ログ】</span>
                          {scanResult.narrative}
                        </div>

                        {/* リワード要約 */}
                        <div className="bg-gradient-to-r from-emerald-950/20 via-emerald-950/5 to-slate-950 border border-emerald-500/25 rounded-xl p-3.5 flex justify-between items-center shadow-inner">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 font-black text-sm">
                              🪙
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-500 block">獲得した金貨</span>
                              <span className="text-xs font-black text-white">+{Math.floor(scanResult.score / 10)} VC</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[10px] text-rose-400 font-extrabold flex items-center gap-1.5 justify-end mb-1">
                              ⚔️ ボス被物理ダメージ
                            </span>
                            <span className="text-lg font-black text-rose-500 tracking-tight animate-bounce inline-block">
                              -{scanResult.damage.toLocaleString()} <span className="text-[10px] font-bold">DMG</span>
                            </span>
                            {scanResult.damageBoost && (
                              <span className="block text-[8px] text-emerald-400 font-extrabold tracking-widest mt-1">
                                [トマト/ブロッコリー弱点特効 2.0x!]
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 本提出アタック＆制限の表示 */}
                        <div className="pt-4 border-t border-gray-900/60 space-y-2">
                          {hasAttackedToday ? (
                            <div className="bg-slate-905 border border-slate-800/80 p-3.5 rounded-xl text-center space-y-1.5">
                              <p className="text-xs font-bold text-gray-400 flex items-center justify-center gap-1.5">
                                <span>🔒</span> 本日分の提出レイドアタックは提出済みなりよ！
                              </p>
                              <p className="text-[10px] text-gray-500 leading-normal font-medium">
                                今日の野菜戦力はすでにジャンク大王へ叩き込まれたなり。<br/>
                                厳選シミュレーターは何度でも楽しめるので、色々な野菜料理を試して遊んでみてね！
                              </p>
                              <button
                                onClick={handleResetAttackLimit}
                                className="text-[9px] text-gray-500 hover:text-emerald-400 font-bold border border-gray-805/80 px-2 py-1 rounded bg-slate-950/40 cursor-pointer mt-1"
                              >
                                🛠️ デバッグ：提出リミットをリセット
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <button
                                onClick={handleFinalAttack}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 font-black text-sm text-white shadow-xl shadow-red-950/20 active:scale-98 hover:brightness-110 cursor-pointer transition-all flex items-center justify-center gap-2"
                              >
                                <Sword size={16} />
                                この一皿をレイド攻撃に提出する！ (1日1回限定) ⚔️
                              </button>
                              <p className="text-[10px] text-gray-500 text-center leading-normal">
                                ※提出ボタンを押すことで、ボスへの実ダメージ反映、ベジコイン VC 獲得、共闘ログ登録、およびマイ図鑑の記録が確定（本日1回のみ）するなり！
                              </p>
                            </div>
                          )}
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

              </motion.div>
            ) : activeTab === "history" ? (
              <motion.div 
                key="history_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <PhotoArchive 
                  historyList={photoHistory} 
                  detectedMeals={detectedMeals}
                  selectedMealId={selectedMealId}
                  onSelectMeal={(id) => setSelectedMealId(id)}
                  onAttackWithMeal={(meal) => handleFinalAttack(meal)}
                  hasAttackedToday={hasAttackedToday}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="shop_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <CouponShop 
                  veggieCoins={veggieCoins}
                  onSpendCoins={handleSpendCoins}
                  myCoupons={myCoupons}
                  onAddCoupon={handleAddMyCoupon}
                  showToast={showToast}
                />
              </motion.div>
            )}
          </AnimatePresence>

        </section>

      </main>

      {/* 2.5 モバイル用ボトムナビゲーション (画面サイズlg以上で非表示) */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50 bg-slate-950/95 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2.5 flex items-center justify-around shadow-2xl shadow-black/90">
        <button
          onClick={() => handleMobileTabChange("battle")}
          className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-[10px] font-black cursor-pointer ${
            mobileTab === "battle"
              ? "text-emerald-400 bg-slate-800/70 border border-emerald-500/15 shadow-md shadow-emerald-500/5"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Sword size={15} />
          <span>⚔️ バトル</span>
        </button>

        <button
          onClick={() => handleMobileTabChange("summon")}
          className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-[10px] font-black cursor-pointer ${
            mobileTab === "summon"
              ? "text-emerald-400 bg-slate-800/70 border border-emerald-500/15 shadow-md shadow-emerald-500/5"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Camera size={15} />
          <span>🥗 スキャン</span>
        </button>

        <button
          onClick={() => handleMobileTabChange("history")}
          className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-[10px] font-black cursor-pointer ${
            mobileTab === "history"
              ? "text-emerald-400 bg-slate-800/70 border border-emerald-500/15 shadow-md shadow-emerald-500/5"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <BookOpen size={15} />
          <span>📸 マイ図鑑</span>
        </button>

        <button
          onClick={() => handleMobileTabChange("shop")}
          className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-[10px] font-black cursor-pointer ${
            mobileTab === "shop"
              ? "text-emerald-400 bg-slate-800/70 border border-emerald-500/15 shadow-md shadow-emerald-500/5"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Coins size={15} />
          <span>🎟️ 特典</span>
        </button>
      </div>

      {/* 3. フッター */}
      <footer className="border-t border-gray-800/80 bg-slate-950/40 py-6 px-4 mt-12 text-center text-xs text-gray-500 pb-28 lg:pb-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Veggie Raid.食生活に美味しいエンタメを、カラダに最高のビタミンを。</p>
          <div className="flex gap-4">
            <span className="hover:text-emerald-400 cursor-pointer">利用規約</span>
            <span className="hover:text-emerald-400 cursor-pointer">プライバシー保護ポリシー</span>
            <span className="hover:text-emerald-400 cursor-pointer">実験室ノート</span>
          </div>
        </div>
      </footer>

      {/* 4. アプリケーション トースト通知 */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-[100] max-w-sm w-full bg-slate-900 border border-emerald-500/30 text-white rounded-2xl p-4 shadow-2xl shadow-black shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer"
            onClick={() => setToast(prev => ({ ...prev, visible: false }))}
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-slate-950 flex-shrink-0 border border-slate-800">
                {toast.icon.startsWith("data:") || toast.icon.startsWith("http") ? (
                  <img 
                    src={toast.icon} 
                    alt="Toast Icon" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">{toast.icon}</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-xs text-emerald-300 uppercase tracking-widest">{toast.title}</h4>
                <p className="text-[11px] text-gray-300 mt-1 leading-relaxed font-medium">{toast.desc}</p>
                <span className="text-[8px] text-gray-500 block text-right mt-2 font-mono">タップして閉じる</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. プロフィール編集モーダル */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onSave={(updated) => {
          setUserProfile(updated);
          showToast(
            "プロフィール登録を更新",
            `称号 ❰${updated.title}❱ の ${updated.name} として登録変更したなりよ！`,
            updated.avatar
          );
        }}
      />

      {/* 6. アカウントレベル・ランキングモーダル */}
      <LevelRankingModal
        isOpen={isLevelRankingOpen}
        onClose={() => setIsLevelRankingOpen(false)}
        level={level}
        expPercent={expPercent}
        userProfile={userProfile}
      />

      {/* 6.5 アチーブメントモーダル */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        level={level}
        veggieCoins={veggieCoins}
        streak={streak}
        photoHistory={photoHistory}
        userProfile={userProfile}
        claimedIds={claimedAchievements}
        onClaim={handleClaimAchievement}
      />

      {/* 7. クラン管理（除籍・退籍対応）モーダル */}
      <ClanModal
        isOpen={isClanOpen}
        onClose={() => setIsClanOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={(updated) => setUserProfile(prev => ({ ...prev, ...updated }))}
        veggieCoins={veggieCoins}
        onUpdateCoins={setVeggieCoins}
        level={level}
      />

    </div>
  );
}
