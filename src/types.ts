export interface ColorRatio {
  red: number;
  green: number;
  yellow: number;
}

export interface ScanResult {
  dishName: string;
  detectedVeggies: string[];
  colorRatio: ColorRatio;
  score: number;
  damage: number;
  damageBoost: boolean;
  narrative: string;
  healthyLevel: string;
}

export interface Coupon {
  id: string;
  store: string;
  name: string;
  description: string;
  cost: number;
  badgeColor: string;
  image: string;
}

export interface LiveLog {
  id: string;
  user: string;
  timeText: string;
  avatar: string;
  dishName: string;
  tag: string;
  damage: number;
  icon: string;
}

export interface UserProfile {
  name: string;
  title: string;          // 称号 (例: ベジタブルビギナー, 完熟トマトマスター)
  avatar: string;         // アバター絵文字 (例: 🥷, 🧙, 🧑‍🌾, 🤖, 🐶)
  favoriteVeggie: string; // 好きな野菜
  dailyGoal: number;      // 1日の野菜目標(g)
  joinClan: string;       // 所属するクラン
}

export interface PhotoHistoryItem {
  id: string;
  timestamp: string;      // 召喚・撮影した日付 (例: 05-23 18:40)
  imageUrl: string;       // 召喚・撮影された画像のURL
  dishName: string;       // 料理タイトル
  detectedVeggies: string[];
  damage: number;
  colorRatio: ColorRatio;
  score: number;
}

export interface DetectedMeal {
  id: string;
  timestamp: string;
  imageUrl: string;
  scanResult: ScanResult;
}

