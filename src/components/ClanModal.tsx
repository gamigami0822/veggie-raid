import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  UserMinus, 
  UserPlus, 
  Plus, 
  LogOut, 
  Trophy, 
  Shield, 
  Coins, 
  Sparkles, 
  Check, 
  Lock, 
  ShieldAlert, 
  Sword,
  Compass,
  FileText,
  Trash2,
  Send,
  MessageCircle
} from "lucide-react";
import { UserProfile } from "../types";
import { playClick } from "../utils/sound";

interface ClanModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  veggieCoins: number;
  onUpdateCoins: (updater: (prev: number) => number) => void;
  level: number;
}

// クランメンバーのインターフェース
interface ClanMember {
  id: string;
  name: string;
  title: string;
  avatar: string;
  level: number;
  role: "マスター" | "サブマスター" | "一般隊員";
  favoriteVeggie: string;
  weeklyVeggieWeight: number; // 今週の野菜摂取量(g)
}

// チャットメッセージのインターフェース
interface ChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  text: string;
  timestamp: string;
}

// デフォルト・各クランメンバーマスターデータ
const INITIAL_CLAN_MEMBERS: Record<string, ClanMember[]> = {
  "ベジタブル騎士団": [
    { id: "cm_1", name: "みどりママ", title: "健康オーガニック司祭", avatar: "👩‍🍳", level: 28, role: "マスター", favoriteVeggie: "ブロッコリー 🥦", weeklyVeggieWeight: 1450 },
    { id: "cm_2", name: "タクマ_23", title: "アスパラ快速スプリンター", avatar: "🚴", level: 14, role: "サブマスター", favoriteVeggie: "アスパラガス 🌿", weeklyVeggieWeight: 800 },
    { id: "cm_3", name: "ベジオタ2世", title: "プロテイン収集家", avatar: "🤓", level: 22, role: "一般隊員", favoriteVeggie: "アボカド 🥑", weeklyVeggieWeight: 1100 },
    { id: "cm_4", name: "プチトマトくん", title: "フレッシュレッド新兵", avatar: "🍅", level: 3, role: "一般隊員", favoriteVeggie: "トマト 🍅", weeklyVeggieWeight: 250 }
  ],
  "新鮮野菜王国": [
    { id: "cm_5", name: "サラダ姫", title: "健康オーガニック王女", avatar: "🥗", level: 39, role: "マスター", favoriteVeggie: "レタス 🥬", weeklyVeggieWeight: 2100 },
    { id: "cm_6", name: "薬膳の賢者", avatar: "🧙‍♂️", title: "漢方ハーブ薬師", level: 32, role: "サブマスター", favoriteVeggie: "春菊 🌿", weeklyVeggieWeight: 1200 },
    { id: "cm_7", name: "オーガニック愛好家", avatar: "🪴", title: "ベジファースト伝道師", level: 12, role: "一般隊員", favoriteVeggie: "にんじん 🥕", weeklyVeggieWeight: 450 }
  ],
  "大豆プロテインズ": [
    { id: "cm_8", name: "筋トレ仙人", avatar: "💪", title: "超バルク大豆ファイター", level: 26, role: "マスター", favoriteVeggie: "枝豆 🫛", weeklyVeggieWeight: 1900 },
    { id: "cm_9", name: "ビタミンマスター", avatar: "🍇", title: "マルチビタミンサポーター", level: 8, role: "一般隊員", favoriteVeggie: "ほうれん草 🥬", weeklyVeggieWeight: 350 }
  ],
  "オーガニック帝国": [
    { id: "cm_10", name: "ベジタブル将軍", avatar: "🥦", title: "無敵無農薬カイザー", level: 48, role: "マスター", favoriteVeggie: "ジャンボ小松菜 🥬", weeklyVeggieWeight: 3100 }
  ]
};

// クラン最大人数は40人までに改定
const PRESET_CLANS: ClanPreset[] = [
  { name: "ベジタブル騎士団", description: "みんなで美味しくベジを食べて、健康で平和な世界を守るなり！初心者・大歓迎なり ⚔️", badge: "🛡️", memberCount: 4, maxMemberCount: 40, totalLvl: 67 },
  { name: "新鮮野菜王国", description: "シャキシャキの生サラダ愛好家が集うエリートクラン。毎日お野菜マウント大歓迎 🥬", badge: "🥗", memberCount: 3, maxMemberCount: 40, totalLvl: 83 },
  { name: "大豆プロテインズ", description: "大豆・枝豆・ブロッコリーなど、高タンパク・ベジを主食とするトレーニー達のクラン 💪", badge: "🫛", memberCount: 2, maxMemberCount: 40, totalLvl: 34 },
  { name: "オーガニック帝国", description: "ガチの無農薬・有機野菜のみを厳選して摂るストイックな健康覇王ギルド 👑", badge: "🌋", memberCount: 1, maxMemberCount: 40, totalLvl: 48 }
];

interface ClanPreset {
  name: string;
  description: string;
  badge: string;
  memberCount: number;
  maxMemberCount: number;
  totalLvl: number;
}

// NPC新規追加用のランダムプロフィール
const SCOUTABLE_NPCS = [
  { name: "キャロット小僧", title: "ベータカロテンランナー", avatar: "🥕", level: 5, favoriteVeggie: "にんじん 🥕" },
  { name: "パプリカ伯爵", title: "七色のビタミンアーチャー", avatar: "🫑", level: 16, favoriteVeggie: "赤パプリカ 🫑" },
  { name: "アボカド大魔王", title: "良質脂質ガーディアン", avatar: "🥑", level: 25, favoriteVeggie: "完熟アボカド 🥑" },
  { name: "オニオン仮面", title: "血液サラサラ剣士", avatar: "🧅", level: 11, favoriteVeggie: "新タマネギ 🧅" },
  { name: "スウィートポテトクイーン", title: "食物繊維の妖精", avatar: "🍠", level: 9, favoriteVeggie: "さつまいも 🍠" },
  { name: "パンプキンバトラー", title: "カロリー補給ソルジャー", avatar: "🎃", level: 18, favoriteVeggie: "カボチャ 🎃" }
];

// 初期チャットメッセージデータを返却
const getInitialChatMessages = (clanName: string): ChatMessage[] => {
  if (clanName === "ベジタブル騎士団") {
    return [
      { id: "msg_1", senderName: "みどりママ", senderAvatar: "👩‍🍳", senderRole: "マスター", text: "新人さんもベテランさんも、皆さん入団ありがとうございますなり！🥬", timestamp: "今日 09:15" },
      { id: "msg_2", senderName: "タクマ_23", senderAvatar: "🚴", senderRole: "サブマスター", text: "今日もお野菜の画像をスキャンして、レイドボスのジャンク大王に大ダメージお見舞いするなり！🔥", timestamp: "今日 09:40" },
      { id: "msg_3", senderName: "ベジオタ2世", senderAvatar: "🤓", senderRole: "一般隊員", text: "私はブロッコリーをレンジでチンしてお弁当に入れました！ビタミンCバフ美味しいです🥦", timestamp: "今日 10:20" }
    ];
  } else if (clanName === "新鮮野菜王国") {
    return [
      { id: "msg_1", senderName: "サラダ姫", senderAvatar: "🥗", senderRole: "マスター", text: "新鮮野菜王国へようこそ。美しく、健康を愛する者がここに集いますわ✨", timestamp: "今日 08:30" },
      { id: "msg_2", senderName: "薬膳の賢者", senderAvatar: "🧙‍♂️", senderRole: "サブマスター", text: "春菊やケールを少しブレンドするだけで、サラダの効能が格段に増すのじゃ。お試しあれ。🌿", timestamp: "今日 09:05" }
    ];
  } else if (clanName === "大豆プロテインズ") {
    return [
      { id: "msg_1", senderName: "筋トレ仙人", senderAvatar: "💪", senderRole: "マスター", text: "うおおおーっ！今日のベンチプレスの前に茹で枝豆を120グラム摂取ッ！プロテイン良好ッ！💪🔥", timestamp: "今日 07:10" },
      { id: "msg_2", senderName: "ビタミンマスター", senderAvatar: "🍇", senderRole: "一般隊員", text: "ブロッコリーと大豆ミートハンバーグを合わせると筋肉に最適という噂ですね。今度スキャンしてみます！", timestamp: "今日 08:00" }
    ];
  } else if (clanName === "オーガニック帝国") {
    return [
      { id: "msg_1", senderName: "ベジタブル将軍", senderAvatar: "🥦", senderRole: "マスター", text: "我ら帝国の一員に、健康の加護があらんことを。農薬なき究極の王道を追求せよ！👑", timestamp: "今日 06:15" }
    ];
  } else {
    return [
      { id: "msg_1", senderName: "システム案内人", senderAvatar: "🤖", senderRole: "マスター", text: "私たちの新しいクランへようこそなり！おしゃべりしたり、お野菜スキャンの報告をして仲良くするなり！✨", timestamp: "今日 10:00" }
    ];
  }
};

export const ClanModal: React.FC<ClanModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  veggieCoins,
  onUpdateCoins,
  level
}) => {
  // クラン状態。初期設定は userProfile.joinClan に応じてデータを取得。
  const clanName = userProfile.joinClan;
  const isJoined = !!clanName;

  // タブ切り替えステート ("members": 名簿, "chat": クラン内チャット, "explore": クラン選択・新設)
  const [subTab, setSubTab] = useState<"members" | "chat" | "explore">("members");

  // 各クランメンバーのローカルステート
  const [clansData, setClansData] = useState<Record<string, ClanMember[]>>(() => {
    const saved = localStorage.getItem("veggie_clans_members_v2");
    return saved ? JSON.parse(saved) : INITIAL_CLAN_MEMBERS;
  });

  // 各クランの対話チャット履歴ステート
  const [clansChats, setClansChats] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem("veggie_clans_chats_v2");
    return saved ? JSON.parse(saved) : {};
  });

  // チャットメッセージ入力バッファ
  const [chatInput, setChatInput] = useState("");

  // カスタムクランの説明
  const [clanDescriptions, setClanDescriptions] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("veggie_clans_desc_v2");
    if (saved) return JSON.parse(saved);
    
    const initial: Record<string, string> = {};
    PRESET_CLANS.forEach(c => {
      initial[c.name] = c.description;
    });
    return initial;
  });

  // クランを新設する際の名前と説明
  const [newClanName, setNewClanName] = useState("");
  const [newClanDesc, setNewClanDesc] = useState("");

  // トースト・アラート
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error" | "info"; title: string; desc: string } | null>(null);

  // カスタム脱退・除籍確認モーダル用のステート
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [kickConfirmTarget, setKickConfirmTarget] = useState<{ id: string; name: string } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("veggie_clans_members_v2", JSON.stringify(clansData));
  }, [clansData]);

  useEffect(() => {
    localStorage.setItem("veggie_clans_desc_v2", JSON.stringify(clanDescriptions));
  }, [clanDescriptions]);

  useEffect(() => {
    localStorage.setItem("veggie_clans_chats_v2", JSON.stringify(clansChats));
  }, [clansChats]);

  // 新着チャットが来たら最下部にスクロール
  useEffect(() => {
    if (subTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [subTab, clansChats, clanName]);

  if (!isOpen) return null;

  const currentMembers = clanName ? (clansData[clanName] || []) : [];
  const currentChats = clanName ? (clansChats[clanName] || getInitialChatMessages(clanName)) : [];

  // 自分が何役か確認
  const selfRole = currentMembers.find(m => m.id === "self_player")?.role || "一般隊員";

  // トーストユーティリティ
  const triggerInternalToast = (type: "success" | "error" | "info", title: string, desc: string) => {
    setAlertMsg({ type, title, desc });
    setTimeout(() => {
      setAlertMsg(prev => prev && prev.title === title ? null : prev);
    }, 4500);
  };

  // 1. 退籍（自分自身の脱退）処理
  const handleLeaveClan = () => {
    if (!clanName) return;

    // メンバーリストから自分を除去
    const updatedMembers = currentMembers.filter(m => m.id !== "self_player" && !m.name.includes("あなた"));
    
    setClansData(prev => ({
      ...prev,
      [clanName]: updatedMembers
    }));

    // プロフィール変更
    onUpdateProfile({ joinClan: "" });
    setSubTab("members"); // タブ初期化
    setShowLeaveConfirm(false);

    triggerInternalToast(
      "info", 
      "クランを脱退(退籍)したなり 🏃", 
      `「${clanName}」とお別れして、新しい無所属の状態になりましたなり。`
    );
  };

  // 2. 除籍（他のメンバーのキック）処理
  const handleKickMember = (memberId: string, memberName: string) => {
    if (!clanName) return;

    const updatedMembers = currentMembers.filter(m => m.id !== memberId);

    setClansData(prev => ({
      ...prev,
      [clanName]: updatedMembers
    }));

    setKickConfirmTarget(null);

    triggerInternalToast(
      "success",
      "メンバーを除籍したなり 💨",
      `${memberName} さんをクランから除籍処分といたしました。クラン空き枠ができましたなり！`
    );
  };

  // 3. ギルドメンバー勧誘 (NPCスカウト) 処理。最大40名まで募集可能。
  const handleScoutNpc = () => {
    if (!clanName) return;

    // 最大人数制限を40人に設定！
    if (currentMembers.length >= 40) {
      triggerInternalToast("error", "クラン定員オーバーなり！", "このクランは最大40人まで満員なりよ。");
      return;
    }

    // まだクランに入っていないNPCを抽選
    const existingNames = currentMembers.map(m => m.name);
    let name = "";
    let avatar = "";
    let title = "";
    let favoriteVeggie = "";
    let level = 5;

    const availableNpcs = SCOUTABLE_NPCS.filter(n => !existingNames.includes(n.name));
    if (availableNpcs.length > 0) {
      const match = availableNpcs[Math.floor(Math.random() * availableNpcs.length)];
      name = match.name;
      avatar = match.avatar;
      title = match.title;
      favoriteVeggie = match.favoriteVeggie;
      level = match.level;
    } else {
      // スカウト人数が40名に対応するよう無限ランダム生成を行う！
      const adjectives = ["有機", "超元気な", "スイート", "シャキシャキ", "新鮮な", "黄金の", "高原の", "朝採れ", "ビタミンたっぷりの", "大地の", "ヘルシーな"];
      const veggieNouns = ["セロリ", "カリフラワー", "オクラ", "チンゲン菜", "ナス", "カブ", "マッシュルーム", "ズッキーニ", "にんにく", "かぼちゃ", "パセリ", "パプリカ"];
      const emojis = ["🥬", "🥦", "🥕", "🥑", "🌽", "🥔", "🍠", "🧅", "🍅", "🫑", "🌿", "🫛", "🥗"];
      const titles = ["自然を愛する者", "食物繊維マスター", "ビタミンハンター", "ベジタブルレンジャー", "畑の守護神", "美食プロフェッショナル", "グリーングラディエーター"];
      
      const randAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const randVeg = veggieNouns[Math.floor(Math.random() * veggieNouns.length)];
      const randEmo = emojis[Math.floor(Math.random() * emojis.length)];
      
      name = `${randAdj}${randVeg}`;
      avatar = randEmo;
      title = titles[Math.floor(Math.random() * titles.length)];
      favoriteVeggie = `${randVeg} ${randEmo}`;
      level = Math.floor(Math.random() * 30) + 5;
    }

    const newMember: ClanMember = {
      id: `scout_npc_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      name,
      title,
      avatar,
      level,
      role: "一般隊員",
      favoriteVeggie,
      weeklyVeggieWeight: Math.floor(Math.random() * 900) + 100
    };

    setClansData(prev => ({
      ...prev,
      [clanName]: [...(prev[clanName] || []), newMember]
    }));

    triggerInternalToast(
      "success",
      "野菜戦士をスカウト！ 🥕",
      `「${name}」が入団したなり！クラン総攻撃力が大きくパワーアップしたなりね！`
    );
  };

  // 4. チャットメッセージ送信 ＆ NPCのお手軽リアクション返信
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !clanName) return;

    const userText = chatInput.trim();
    const newUserMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      senderName: `${userProfile.name} (あなた)`,
      senderAvatar: userProfile.avatar,
      senderRole: selfRole,
      text: userText,
      timestamp: "たった今"
    };

    const updatedChats = [...currentChats, newUserMsg];
    setClansChats(prev => ({
      ...prev,
      [clanName]: updatedChats
    }));

    setChatInput("");
    playClick();

    // 他のクランメンバーNPCがいる場合、おもしろい応援チャット返信を1秒遅れでシミュレート！
    setTimeout(() => {
      const otherNpcs = currentMembers.filter(m => m.id !== "self_player" && !m.name.includes("あなた"));
      if (otherNpcs.length === 0) return;

      const randomNpc = otherNpcs[Math.floor(Math.random() * otherNpcs.length)];
      
      const responseSamples = [
        "おおっ、その通りなりな！👍 一緒にジャンク大王をやっつけに行きましょう！",
        "最高においしそう、かつヘルシーなりね！いつもスキャン報告ありがたいなり🥗✨",
        "ナイスベジタブル！みんなで野菜をもりもり食べて、健康ライフとレベルバフを極めるなり！",
        "お野菜ファイターとしての誇りを感じるなりね！私も今日のランチはサラダにするなり！🥦",
        "これぞクランの結束力！今日もお腹いっぱい野菜を食べてボム攻撃を強化しましょう！🔥",
        "すばらしいお言葉！心強い限りなりね。この団結でレイドボスも秒殺なり！⚔️"
      ];
      const randReply = responseSamples[Math.floor(Math.random() * responseSamples.length)];

      const npcReplyMsg: ChatMessage = {
        id: `msg_npc_${Date.now()}`,
        senderName: randomNpc.name,
        senderAvatar: randomNpc.avatar,
        senderRole: randomNpc.role,
        text: randReply,
        timestamp: "たった今"
      };

      setClansChats(prev => {
        const targetChats = prev[clanName] || getInitialChatMessages(clanName);
        return {
          ...prev,
          [clanName]: [...targetChats, npcReplyMsg]
        };
      });
    }, 1200);
  };

  // 5. クランの新規創設
  const handleCreateClan = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newClanName.trim();
    if (!trimmedName) return;

    if (clanName) {
      triggerInternalToast("error", "すでにクランに所属しているなり 🔒", "新しいブランドのクランを立ち上げるには、まず現在のクランを脱退(退籍)する必要があるなり！");
      return;
    }

    if (clansData[trimmedName]) {
      triggerInternalToast("error", "既存のクラン名なり", "同じ名前のクランがすでに存在しているなりよ！");
      return;
    }

    // 創設費用: 100 ベジコイン
    if (veggieCoins < 100) {
      triggerInternalToast("error", "ベジコインが不足していますなり 🪙", "クランを建てるには100ベジコインが必要なりよ！");
      return;
    }

    // コイン消費
    onUpdateCoins(prev => prev - 100);

    const updatedClansData = { ...clansData };

    // 新クラン情報構築。自分をマスターとして配備する。
    const myselfAsMember: ClanMember = {
      id: "self_player",
      name: `${userProfile.name} (あなた)`,
      title: userProfile.title,
      avatar: userProfile.avatar,
      level: 24, 
      role: "マスター",
      favoriteVeggie: userProfile.favoriteVeggie,
      weeklyVeggieWeight: 800
    };

    updatedClansData[trimmedName] = [myselfAsMember];
    setClansData(updatedClansData);

    setClanDescriptions(prev => ({
      ...prev,
      [trimmedName]: newClanDesc.trim() || "新進気鋭、自分たちが設立した最強の健康オーガニック新生ギルドなり！✨"
    }));

    // 所属適応
    onUpdateProfile({ joinClan: trimmedName });

    // クリア
    setNewClanName("");
    setNewClanDesc("");
    setSubTab("members");

    triggerInternalToast(
      "success",
      "新規クラン創設なり！ 🎉",
      `おめでとうなり！あなたはクラン「${trimmedName}」のマスターに任命されましたなり！`
    );
  };

  // 6. 既存クランへの加入
  const handleJoinPresetClan = (pName: string) => {
    const targetClanMembers = clansData[pName] || [];
    
    if (targetClanMembers.length >= 40) {
      triggerInternalToast("error", "定員オーバーなり！", "そのクランは現在40人満員のため、加入できませんなり。");
      return;
    }

    if (targetClanMembers.some(m => m.id === "self_player")) {
      triggerInternalToast("error", "既に参加権あり", "既にそのクランに所属しているなりよ。");
      return;
    }

    // すでに別のクランに所属している場合、前のクランから自分を除去する
    const updatedClansData = { ...clansData };
    if (clanName) {
      const oldClanMembers = clansData[clanName] || [];
      updatedClansData[clanName] = oldClanMembers.filter(m => m.id !== "self_player" && !m.name.includes("あなた"));
    }

    const myselfAsMember: ClanMember = {
      id: "self_player",
      name: `${userProfile.name} (あなた)`,
      title: userProfile.title,
      avatar: userProfile.avatar,
      level: 24,
      role: "一般隊員",
      favoriteVeggie: userProfile.favoriteVeggie,
      weeklyVeggieWeight: 500
    };

    updatedClansData[pName] = [...targetClanMembers, myselfAsMember];
    setClansData(updatedClansData);

    // プロフィール変更
    onUpdateProfile({ joinClan: pName });
    setSubTab("members");

    triggerInternalToast(
      "success",
      "クランに所属（移籍）したなり！ 🙌",
      `「${pName}」への加入(移籍)が完了しましたなり！さっそくチャットやお野菜報告をしてみましょうなり！`
    );
  };

  return (
    <div className="fixed inset-0 z-[240] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-slate-900 border border-slate-800/90 max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]"
      >
        {/* ヘッダー */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-200 uppercase tracking-widest leading-none">
                ベジタブルクラン本拠地
              </h2>
              <span className="text-[10px] text-gray-500 font-semibold mt-1 block">
                チーム協力と野菜摂取目標！クランのメンバー除籍 ＆ 退籍脱退（最大40名）が可能なり
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

        {/* トースト表示 */}
        {alertMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl border flex items-start gap-2 text-xs font-bold leading-normal animate-fadeIn text-gray-150 relative bg-slate-950 border-emerald-500/30">
            <div className="text-lg">
              {alertMsg.type === "success" ? "✅" : alertMsg.type === "error" ? "🛑" : "💡"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-100 font-black">{alertMsg.title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{alertMsg.desc}</p>
            </div>
          </div>
        )}

        {/* コイン・ステータス表示 */}
        <div className="bg-slate-950/40 px-5 py-2.5 border-b border-slate-850/60 flex items-center justify-between text-xs font-bold">
          <span className="text-gray-300 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>現在地: 【{clanName || "クラン未所属（浪人）" }】</span>
          </span>
          <div className="flex items-center gap-1 bg-emerald-950/30 border border-emerald-500/25 px-2 py-0.5 rounded-lg text-emerald-400 text-[10px] font-black">
            <Coins size={11} />
            <span>{veggieCoins.toLocaleString()} COIN</span>
          </div>
        </div>

        {/* 所属時のサブタブ切替 */}
        {isJoined && (
          <div className="flex bg-slate-950/30 border-b border-slate-850">
            <button
              onClick={() => { playClick(); setSubTab("members"); }}
              className={`flex-1 py-3 text-xs font-black transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                subTab === "members"
                  ? "border-emerald-500 text-emerald-400 bg-slate-900/40"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-slate-900/10"
              }`}
            >
              <Users size={13} />
              <span>隊員名簿 ({currentMembers.length}/40)</span>
            </button>
            <button
              onClick={() => { playClick(); setSubTab("chat"); }}
              className={`flex-1 py-3 text-xs font-black transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer relative ${
                subTab === "chat"
                  ? "border-emerald-500 text-emerald-400 bg-slate-900/40"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-slate-900/10"
              }`}
            >
              <MessageCircle size={13} />
              <span>クランチャット</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute right-7 top-3.5 animate-ping"></span>
            </button>
            <button
              onClick={() => { playClick(); setSubTab("explore"); }}
              className={`flex-1 py-3 text-xs font-black transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                subTab === "explore"
                  ? "border-emerald-500 text-emerald-400 bg-slate-900/40"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-slate-900/10"
              }`}
            >
              <Compass size={13} />
              <span>クラン選択・新設</span>
            </button>
          </div>
        )}

        {/* コンテンツ(スクロール) */}
        <div className="p-5 overflow-y-auto flex-1 scrollbar-thin space-y-4">
          {isJoined ? (
            /* ==================== 1. 所属クラン画面ビュー ==================== */
            <div className="space-y-4 animate-fadeIn flex flex-col h-full">
              
              {/* クランエンブレム風バナー */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none"></div>
                <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner select-none">
                  🛡️
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[7px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-black tracking-widest uppercase">
                      ACTIVE CLAN
                    </span>
                    <span className="text-[8.5px] bg-slate-900 border border-slate-800 text-gray-350 px-1.5 py-0.2 rounded font-bold">
                      所属人数 {currentMembers.length + (currentMembers.some(m => m.id === "self_player" || m.name.includes("あなた")) ? 0 : 1)} / 40名
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white mt-1">
                    {clanName}
                  </h3>
                  <p className="text-[9px] text-gray-400 leading-tight mt-1 italic">
                    "{clanDescriptions[clanName] || "みんなで仲良くおしゃべりして、ベジパワーでジャンク大王を圧退するなり！"}"
                  </p>
                </div>
              </div>

              {subTab === "members" ? (
                /* ==================== 1A. 隊員名簿サブタブ ==================== */
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[9px] text-gray-500 font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                      <Users size={12} className="text-emerald-400" />
                      <span>所属の野菜戦士たち (最大40名)</span>
                    </h4>

                    {currentMembers.length < 40 && (
                      <button
                        onClick={handleScoutNpc}
                        className="text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 active:scale-95 transition-all px-2.5 py-1 rounded-lg font-bold flex items-center gap-0.5 cursor-pointer hover:bg-emerald-500/20"
                      >
                        <Plus size={10} /> 隊員勧誘スカウト
                      </button>
                    )}
                  </div>

                  {/* メンバー縦リスト */}
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {/* あなた自身が一覧に含まれていない場合は擬似的に挿入 */}
                    {!currentMembers.some(m => m.id === "self_player" || m.name.includes("あなた")) && (
                      <div className="bg-slate-950 border border-emerald-500/50 p-2 rounded-xl flex items-center justify-between shadow shadow-emerald-950/20">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-slate-900 border border-emerald-500/30 flex items-center justify-center text-sm">
                            {userProfile.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h5 className="text-[11px] font-black text-emerald-300">{userProfile.name} (あなた)</h5>
                              <span className="text-[7.5px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-1 py-0.2 rounded font-black font-mono">
                                Lv.{level}
                              </span>
                              <span className="text-[6.5px] bg-emerald-500 text-slate-950 font-black px-1.2 py-0.1 rounded">
                                一般隊員
                              </span>
                            </div>
                            <p className="text-[8px] text-gray-500 font-semibold">{userProfile.title} • 好物: {userProfile.favoriteVeggie}</p>
                          </div>
                        </div>
                        <span className="text-[7.5px] text-emerald-400 font-black bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          自己
                        </span>
                      </div>
                    )}

                    {currentMembers.map((member) => {
                      const isSelf = member.id === "self_player" || member.name.includes("あなた");
                      const displayLevel = isSelf ? level : member.level;
                      return (
                        <div 
                          key={member.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                            isSelf 
                              ? "bg-slate-950 border-emerald-500/70"
                              : "bg-slate-950/40 border-slate-850 hover:bg-slate-950 hover:border-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-8 h-8 rounded-full bg-slate-900 border flex items-center justify-center text-base flex-shrink-0 ${isSelf ? "border-emerald-500/30" : "border-slate-800"}`}>
                              {member.avatar}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className={`text-xs font-bold truncate ${isSelf ? "text-emerald-300 font-black" : "text-gray-200"}`}>
                                  {member.name}
                                </h5>
                                <span className="text-[7.5px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-1 py-0.2 rounded font-black font-mono">
                                  Lv.{displayLevel}
                                </span>
                                <span className={`text-[7px] font-black px-1 py-0.1 rounded ${
                                  member.role === "マスター" 
                                    ? "bg-amber-500 text-slate-950" 
                                    : member.role === "サブマスター"
                                      ? "bg-slate-300 text-slate-950"
                                      : "bg-slate-900 text-gray-400"
                                }`}>
                                  {member.role}
                                </span>
                              </div>
                              <p className="text-[8.5px] text-gray-500 leading-tight mt-0.5 truncate">
                                {member.title} • 好物: {member.favoriteVeggie}
                              </p>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            {isSelf ? (
                              <span className="text-[7.5px] text-emerald-450 font-black bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                YOU
                              </span>
                            ) : (
                              <button
                                onClick={() => { playClick(); setKickConfirmTarget({ id: member.id, name: member.name }); }}
                                className="p-1 px-1.5 rounded bg-red-950/30 hover:bg-red-950/60 border border-red-500/20 hover:border-red-500/60 text-[8.5px] text-red-400 font-extrabold cursor-pointer flex items-center gap-0.5 hover:text-red-300 active:scale-95 transition-all"
                                title="除籍(クランから追放)します"
                              >
                                <UserMinus size={9} />
                                <span>除籍</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 進捗要サマリー */}
                  <div className="bg-slate-950/50 border border-slate-850 p-3 rounded-2xl text-[9px] text-gray-500 space-y-1">
                    <div className="flex justify-between items-center text-gray-300 font-extrabold text-[10px]">
                      <span>🛡️ クラン全体の今週の総お野菜寄与：</span>
                      <span className="text-emerald-400 font-mono">
                        {currentMembers.reduce((acc, curr) => acc + curr.weeklyVeggieWeight, 1200).toLocaleString()} g
                      </span>
                    </div>
                    <p className="text-[8px] text-gray-500 leading-normal">
                      ※クランの最大定員は <strong>40名</strong> なり！メンバーを招集して最強の健康チームを結成し、週替わりのレイド総攻撃力を競うべし！
                    </p>
                  </div>
                </div>
              ) : subTab === "chat" ? (
                /* ==================== 1B. クラン内チャットサブタブ ==================== */
                <div className="flex flex-col space-y-3 h-[320px] bg-slate-950 border border-slate-850/80 rounded-2xl p-3 relative overflow-hidden animate-fadeIn">
                  
                  {/* チャット説明 */}
                  <div className="flex items-center justify-between text-[8.5px] text-gray-500 pb-1.5 border-b border-slate-850 flex-shrink-0">
                    <span>💬 【{clanName}】作戦司令チャットルーム</span>
                    <span className="text-emerald-500 font-black">● LIVE SOCKET ONLINE</span>
                  </div>

                  {/* チャットスクロールビュー */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
                    {currentChats.map((chat) => {
                      const isUser = chat.senderName.includes("あなた") || chat.senderName.includes(userProfile.name);
                      return (
                        <div 
                          key={chat.id}
                          className={`flex items-start gap-2.5 text-xs max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                        >
                          {/* アバター */}
                          <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sm flex-shrink-0">
                            {chat.senderAvatar}
                          </div>

                          {/* メッセージ本文 */}
                          <div className="space-y-0.5">
                            <div className={`flex items-center gap-1.5 text-[9px] text-gray-500 ${isUser ? "justify-end" : ""}`}>
                              <span className="font-extrabold text-gray-300">{chat.senderName}</span>
                              <span className="bg-slate-900 border border-slate-800 px-1 py-0.1 text-[7px] text-gray-400 rounded-md">
                                {chat.senderRole}
                              </span>
                            </div>

                            <div 
                              className={`p-2.5 rounded-2xl leading-relaxed text-gray-100 whitespace-normal break-words font-medium ${
                                isUser 
                                  ? "bg-emerald-500/10 border border-emerald-500/30 rounded-tr-none text-emerald-100" 
                                  : "bg-slate-900/90 border border-slate-850 rounded-tl-none text-gray-200"
                              }`}
                            >
                              {chat.text}
                            </div>
                            <span className={`block text-[7px] text-gray-600 ${isUser ? "text-right" : ""}`}>
                              {chat.timestamp}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* メッセージ入力・送信 */}
                  <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-850 pt-2.5 flex-shrink-0">
                    <input
                      type="text"
                      placeholder="メッセージを入力するなり... (例: 今日トマトスキャンした！)"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      maxLength={100}
                      className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500/70 focus:outline-none rounded-xl px-3 py-1.5 text-xs font-bold text-gray-200 placeholder-gray-600"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                        chatInput.trim() 
                          ? "bg-emerald-500 text-slate-950 cursor-pointer active:scale-95" 
                          : "bg-slate-900 border border-slate-800 text-gray-600 cursor-not-allowed"
                      }`}
                      title="送信するなり！"
                    >
                      <Send size={13} />
                    </button>
                  </form>
                </div>
              ) : (
                /* ==================== 1C. クラン選択・新設 ==================== */
                <div className="space-y-4 animate-fadeIn">
                  {/* クラン創設フォーム */}
                  {isJoined ? (
                    <div className="bg-slate-950/75 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3.5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-xl pointer-events-none"></div>
                      <div className="w-10 h-10 rounded-xl bg-red-950/20 text-red-500/80 border border-red-500/30 flex items-center justify-center text-lg shadow shrink-0 select-none">
                        🔒
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-red-400">クラン創設機能ロック中なり🔒</p>
                        <p className="text-[10.5px] text-gray-400 leading-normal font-semibold">
                          すでに他のお野菜クランに所属（または作成）しているため、新しいクランを旗揚げすることはできないなり。<br />
                          自分で新しくオリジナルクランを創設したい場合は、一度名簿画面の下部にある<strong>「このクランから完璧に退籍（脱退）する」</strong>を行って、無所属の状態から旗揚げするなりよ！
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                      <h3 className="text-xs font-black text-gray-200 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Plus size={12} className="text-emerald-400" />
                          <span>オリジナルブランドのクランを創設（移籍）する</span>
                        </span>
                        <span className="text-[8.5px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded-full font-black flex items-center gap-0.5">
                          <Coins size={9} /> 100 COIN 必要
                        </span>
                      </h3>

                      <form onSubmit={handleCreateClan} className="space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="クラン名 (例: トマトサラダ親衛隊)"
                            value={newClanName}
                            onChange={(e) => setNewClanName(e.target.value)}
                            maxLength={15}
                            className="bg-slate-950 text-xs font-bold text-gray-200 border border-slate-850 rounded-xl px-3 py-2 w-full focus:outline-none focus:border-emerald-500"
                          />
                          <input
                            type="text"
                            placeholder="クランの紹介一言（意気込み）"
                            value={newClanDesc}
                            onChange={(e) => setNewClanDesc(e.target.value)}
                            maxLength={40}
                            className="bg-slate-950 text-xs font-bold text-gray-200 border border-slate-850 rounded-xl px-3 py-2 w-full focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={!newClanName.trim() || veggieCoins < 100}
                          className={`w-full py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                            !newClanName.trim() || veggieCoins < 100
                              ? "bg-slate-950 text-gray-650 cursor-not-allowed border border-slate-900"
                              : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer hover:scale-101 active:scale-98"
                          }`}
                        >
                          <Sparkles size={11} />
                          <span>お野菜クランを新規旗揚げ創設する！ (100ベジコイン消費)</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* 既存の公開募集一覧 */}
                  <div className="space-y-2">
                    <h3 className="text-[10px] text-gray-500 font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                      <Compass size={12} className="text-emerald-400" />
                      <span>既存募集お野菜クラン一覧から選択して移籍する (最大40名)</span>
                    </h3>

                    <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                      {PRESET_CLANS.map((preset) => {
                        const currentLiveCount = clansData[preset.name]?.length || preset.memberCount;
                        const isCurrentActive = preset.name === clanName;
                        return (
                          <div 
                            key={preset.name}
                            className={`p-3 rounded-2xl flex items-start justify-between gap-4 transition-all ${
                              isCurrentActive
                                ? "bg-emerald-950/20 border border-emerald-500/50"
                                : "bg-slate-950/40 hover:bg-slate-950 border border-slate-850 hover:border-gray-800"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow select-none flex-shrink-0">
                                {preset.badge}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 leading-none flex-wrap">
                                  <h4 className="text-xs font-black text-gray-200">{preset.name}</h4>
                                  <span className="text-[8px] bg-slate-900 text-gray-500 px-1.5 py-0.2 rounded border border-slate-855 font-bold">
                                    隊員 {currentLiveCount} / 40名
                                  </span>
                                  {isCurrentActive && (
                                    <span className="text-[7.5px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded animate-pulse">
                                      所属中
                                    </span>
                                  )}
                                </div>
                                <p className="text-[9px] text-gray-400 mt-1.5 leading-normal">
                                  {preset.description}
                                </p>
                              </div>
                            </div>

                            {isCurrentActive ? (
                              <span className="text-[8px] text-emerald-400 font-black bg-emerald-950/30 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
                                加入済み
                              </span>
                            ) : (
                              <button
                                onClick={() => { playClick(); handleJoinPresetClan(preset.name); }}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-500 border border-emerald-500/30 hover:border-transparent text-emerald-400 hover:text-slate-950 text-[11px] font-black transition-all cursor-pointer flex items-center gap-0.5 active:scale-95"
                              >
                                <UserPlus size={11} />
                                <span>移籍する</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* クラン退籍（脱退）トリガー */}
              <div className="pt-1 flex justify-end flex-shrink-0">
                <button
                  onClick={() => {
                    playClick();
                    setShowLeaveConfirm(true);
                  }}
                  className="px-3.5 py-1.5 bg-slate-950 hover:bg-red-955 border border-slate-850 hover:border-red-500/30 rounded-xl text-[10px] font-black text-gray-400 hover:text-red-400 transition-all flex items-center gap-1 cursor-pointer active:scale-97"
                >
                  <LogOut size={11} />
                  <span>このクランから完璧に退籍（脱退）する</span>
                </button>
              </div>

            </div>
          ) : (
            /* ==================== 2. クラン未所属（加入・作成）ビュー ==================== */
            <div className="space-y-4 animate-fadeIn">
              
              {/* 未所属ウェルカムメッセージ */}
              <div className="p-4 bg-slate-950/80 border border-amber-500/20 rounded-2xl text-center space-y-1.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-xl pointer-events-none"></div>
                <p className="text-xs font-black text-amber-400">🛡️ 現在はいずれのクランにも所属していないなり 🛡️</p>
                <p className="text-[10px] text-gray-400 leading-normal max-w-md mx-auto">
                  チームのみんなでお野菜をパシャリして健康競い合い＆ボム援護をできるクラン空間なり！<br />
                  既存の優良おすすめクランに入るか、自力でクランを作成してマスターになるなりよ！
                </p>
              </div>

              {/* クラン創設フォーム */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-black text-gray-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Plus size={12} className="text-emerald-400" />
                    <span>オリジナルブランドのクランを創設する</span>
                  </span>
                  <span className="text-[8.5px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded-full font-black flex items-center gap-0.5">
                    <Coins size={9} /> 100 COIN 必要
                  </span>
                </h3>

                <form onSubmit={handleCreateClan} className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="クラン名 (例: トマトサラダ親衛隊)"
                      value={newClanName}
                      onChange={(e) => setNewClanName(e.target.value)}
                      maxLength={15}
                      className="bg-slate-950 text-xs font-bold text-gray-200 border border-slate-850 rounded-xl px-3 py-2 w-full focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="クランの紹介一言（意気込み）"
                      value={newClanDesc}
                      onChange={(e) => setNewClanDesc(e.target.value)}
                      maxLength={40}
                      className="bg-slate-950 text-xs font-bold text-gray-200 border border-slate-850 rounded-xl px-3 py-2 w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!newClanName.trim() || veggieCoins < 100}
                    className={`w-full py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                      !newClanName.trim() || veggieCoins < 100
                        ? "bg-slate-950 text-gray-650 cursor-not-allowed border border-slate-900"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer hover:scale-101 active:scale-98"
                    }`}
                  >
                    <Sparkles size={11} />
                    <span>お野菜クランを旗揚げ創設する！ (100ベジコイン消費)</span>
                  </button>
                </form>
              </div>

              {/* 既存の優良クラン一覧 */}
              <div className="space-y-2">
                <h3 className="text-[10px] text-gray-500 font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                  <Compass size={12} className="text-emerald-400" />
                  <span>公開募集クラン一覧 (所属上限40名)</span>
                </h3>

                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {PRESET_CLANS.map((preset) => {
                    const currentLiveCount = clansData[preset.name]?.length || preset.memberCount;
                    
                    return (
                      <div 
                        key={preset.name}
                        className="bg-slate-950/40 hover:bg-slate-950 border border-slate-850 hover:border-gray-800 p-3 rounded-2xl flex items-start justify-between gap-4 transition-all"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow select-none flex-shrink-0">
                            {preset.badge}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 leading-none">
                              <h4 className="text-xs font-black text-gray-200">{preset.name}</h4>
                              <span className="text-[8px] bg-slate-900 text-gray-500 px-1.5 py-0.2 rounded border border-slate-855 font-bold">
                                隊員 {currentLiveCount} / 40名
                              </span>
                            </div>
                            <p className="text-[9px] text-gray-400 mt-1.5 leading-normal">
                              {preset.description}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => { playClick(); handleJoinPresetClan(preset.name); }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-500 border border-emerald-500/30 hover:border-transparent text-emerald-400 hover:text-slate-950 text-xs font-black transition-all cursor-pointer flex items-center gap-0.5 active:scale-95"
                        >
                          <UserPlus size={11} />
                          <span>加入する</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-4 bg-slate-950 border-t border-slate-850 text-center">
          <p className="text-[9px] text-gray-500 leading-normal font-semibold">
            クラン画面では、退職したメンバーの除籍や、自分自身の完璧な退籍(脱退)をいつでも自由に行えるなりよ！<br/>
            クラン内チャットにお野菜の感想や料理自慢を叩き込んで、みんなで健康な朝を迎えるなり！🥗
          </p>
        </div>

        {/* 脱退（退籍）確認カスタムダイアログ */}
        <AnimatePresence>
          {showLeaveConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-[255] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl"
              >
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto animate-pulse">
                  <LogOut size={22} />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-white">本当にクランを脱退しますか？</h3>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    現在の所属クラン「<span className="text-emerald-400 font-bold">{clanName}</span>」から脱退・退籍するなり🥺
                    <br />
                    脱退すると、クラン掲示板チャットが閲覧できなくなり、チーム対抗お野菜ランキングでのあなたのスコア反映が一時的に無効になるなりよ。
                  </p>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => { playClick(); setShowLeaveConfirm(false); }}
                    className="flex-1 py-2 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer border border-slate-850"
                  >
                    やめるなり
                  </button>
                  <button
                    onClick={() => { playClick(); handleLeaveClan(); }}
                    className="flex-1 py-2 text-xs font-black bg-red-650 hover:bg-red-500 text-white rounded-xl transition-all cursor-pointer shadow-lg active:scale-95 animate-pulse"
                  >
                    脱退するなり！
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* メンバー除籍確認カスタムダイアログ */}
        <AnimatePresence>
          {kickConfirmTarget && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-[255] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl"
              >
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500/80 mx-auto">
                  <UserMinus size={22} />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-white">メンバーを除籍しますか？</h3>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    本当に野菜戦士「<span className="text-red-400 font-bold">{kickConfirmTarget.name}</span>」さんを、
                    <br />
                    現在のクランから除籍（追放）処分にするなりか？
                  </p>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => { playClick(); setKickConfirmTarget(null); }}
                    className="flex-1 py-2 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer border border-slate-850"
                  >
                    キャンセルなり
                  </button>
                  <button
                    onClick={() => { playClick(); handleKickMember(kickConfirmTarget.id, kickConfirmTarget.name); }}
                    className="flex-1 py-2 text-xs font-black bg-red-650 hover:bg-red-500 text-white rounded-xl transition-all cursor-pointer shadow-lg active:scale-95"
                  >
                    除籍するなり！
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
