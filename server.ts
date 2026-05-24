import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// JSONやデータ解析用にサイズ制限を緩和
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Gemini クライアント (遅延評価・安全プロキシ)
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// 静的な写真のフォールバック用データベース
const FOOD_FALLBACKS = [
  {
    keys: ["トマト", "カプレーゼ", "イタリアン", "tomato", "caprese"],
    url: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=650",
    dishName: "完熟トマトとモッツァレラチーズのカプレーゼ",
    veggies: ["トマト (特効)", "スイートバジル", "オリーブオイル"],
    colors: { red: 65, green: 25, yellow: 10 },
    narrative: "真っ赤に熟したトマトの甘みとバジルの清涼感が炸裂！リコピン全開の真っ赤な衝撃波が、ジャンク・プレジデントの重厚なバリアを穿つなり！"
  },
  {
    keys: ["ブロッコリー", "スープ", "濃厚", "broccoli", "soup"],
    url: "https://images.unsplash.com/photo-1547592165-e1d17fed6006?auto=format&fit=crop&q=80&w=650",
    dishName: "森のブロッコリーと緑黄色野菜の濃厚スープ",
    veggies: ["ブロッコリー (特効)", "アスパラガス", "ほうれん草", "オーガニックオクラ"],
    colors: { red: 5, green: 75, yellow: 20 },
    narrative: "大自然の恵みをポタージュに凝縮！ブロッコリーの強烈な食物繊維とクロロフィルによる解毒パワーが怒涛のように押し寄せ、脂ギッシュな敵を圧倒するぞ！"
  },
  {
    keys: ["アボカド", "サラダ", "パワー", "avocado", "salad"],
    url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=650",
    dishName: "完熟アボカドと海老のビタミンチャージパワーサラダ",
    veggies: ["アボカド", "黄パプリカ", "ベビーリーフ", "トマト (特効)"],
    colors: { red: 20, green: 55, yellow: 25 },
    narrative: "「森のバター」ことアボカドの良質な脂質とコラーゲンが融合！高密度ビタミンパワーがパーティーを癒やし、ボスの油ギトギトな野望を包み込むなり！"
  },
  {
    keys: ["カレー", "curry", "スパイス"],
    url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=650",
    dishName: "彩り夏野菜の十五穀薬膳スパイスカレー",
    veggies: ["カボチャ", "アスパラ", "ナス", "ミニトマト (特効)"],
    colors: { red: 30, green: 30, yellow: 40 },
    narrative: "カボチャのビタミンAとスパイスの代謝覚醒作用がシナジー！身体の芯からみなぎる熱気と黄の恵みが、ジャンクな体躯を焼き焦がすなり！"
  }
];

const DEFAULT_FOOD = {
  url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=650",
  dishName: "彩りオーガニック健康ベジタブルボウル",
  veggies: ["キヌア", "グリーンリーフ", "ダイスカボチャ", "プチトマト (特効)"],
  colors: { red: 25, green: 40, yellow: 35 },
  narrative: "色とりどりの野菜たちが美しく舞い踊るバランス完璧なボウル！多彩な栄養素が身体の細胞をフルバフし、ジャンクな王を強烈に撃退するなり！"
};

// 【API 1】AI料理画像を召喚する (Imagen / フォールバック)
app.post("/api/meal/generate", async (req, res) => {
  const { prompt } = req.body;
  const userPrompt = prompt || "Delicious food photography of a colorful mixed vegetable salad bowl on a wooden rustic table";

  const ai = getAiClient();
  if (!ai) {
    console.log("No valid GEMINI_API_KEY configured or fallback active. serving simulated images.");
    const found = FOOD_FALLBACKS.find(f => f.keys.some(k => userPrompt.toLowerCase().includes(k)));
    const match = found || DEFAULT_FOOD;
    return res.json({
      success: true,
      imageUrl: match.url,
      simulated: true,
      meta: {
        dishName: match.dishName,
        detectedVeggies: match.veggies,
        colors: match.colors,
        narrative: match.narrative
      }
    });
  }

  try {
    console.log("Calling ai.models.generateImages with imagen-3.0-generate-001 or equivalent");
    // Imagen 3 を使用
    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-001",
      prompt: userPrompt + ", professional food commercial photo, extreme detailing, soft studio lighting",
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "1:1",
      },
    });

    if (response.generatedImages && response.generatedImages[0] && response.generatedImages[0].image) {
      const base64Bytes = response.generatedImages[0].image.imageBytes;
      const imageUrl = `data:image/jpeg;base64,${base64Bytes}`;
      return res.json({
        success: true,
        imageUrl,
        simulated: false
      });
    }

    throw new Error("Imagen output coordinates missing");
  } catch (error: any) {
    console.error("Imagen API call error. Falling back safely:", error.message || error);
    // フォールバック
    const found = FOOD_FALLBACKS.find(f => f.keys.some(k => userPrompt.toLowerCase().includes(k)));
    const match = found || DEFAULT_FOOD;
    return res.json({
      success: true,
      imageUrl: match.url,
      simulated: true,
      meta: {
        dishName: match.dishName,
        detectedVeggies: match.veggies,
        colors: match.colors,
        narrative: match.narrative
      }
    });
  }
});

// 【API 2】料理画像をスキャン＆栄養判定する (Gemini Vision + JSON )
app.post("/api/meal/scan", async (req, res) => {
  const { imageBase64, isPresetUrl, promptUsed } = req.body;

  const ai = getAiClient();

  // APIキーがない、またはフロントからPresetの直接解決が指示された場合
  if (!ai || isPresetUrl || !imageBase64) {
    console.log("Mock / Fallback Scan resolving dynamically.");
    const query = promptUsed || "";
    const found = FOOD_FALLBACKS.find(f => f.keys.some(k => query.toLowerCase().includes(k)));
    const match = found || DEFAULT_FOOD;
    
    // スコア＆コンボ計算
    let score = (match.colors.red + match.colors.green + match.colors.yellow) * 10;
    let baseDamage = score * 3.5;
    
    // トマトかブロッコリーがお題（現在レイド中）なら特効2倍
    let damageBoost = query.includes("トマト") || query.includes("ブロッコリー") || query.includes("caprese") || query.includes("soup");
    if (damageBoost) {
      baseDamage *= 2;
    }

    return res.json({
      success: true,
      data: {
        dishName: match.dishName,
        detectedVeggies: match.veggies,
        colorRatio: {
          red: match.colors.red,
          green: match.colors.green,
          yellow: match.colors.yellow
        },
        score,
        damage: Math.round(baseDamage),
        damageBoost,
        narrative: match.narrative,
        healthyLevel: score >= 900 ? "伝説級薬膳料理" : score >= 700 ? "超健康食" : "ヘルシーバランス食"
      }
    });
  }

  try {
    console.log("Analyzing meal image via Gemini-3.5-flash...");
    
    // Base64 プレフィックスをトリミング
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Data,
      },
    };

    const textPart = {
      text: `この料理写真をAI栄養解析エンジンとして詳細にスキャンしてください。
      この中に含まれているヘルシーな野菜や果物、健康なトッピング素材を検出してください。
      また、料理を構成する色合いと役割のバランスを、赤（抗酸化物質・ビタミン等）、緑（食物繊維・葉緑素・ミネラル等）、黄/オレンジ/他（ビタミンA・エネルギー・タンパク質等）の3色に綺麗に割り振り、合計パーセントがぴったり100%になるように配分してください。
      これらが今週のボス「ジャンク・プレジデント」にどれほどの健康衝撃ダメージを与えるか、面白く、和風ゲーム戦闘風（「〜なり！」「〜ぞ！」というお茶目でコミカルな語尾）で、解説する戦闘ナレーションを作成してください。
      
      現在のお題野菜：トマト、またはブロッコリー。これらが含まれている場合は、特効ボーナス（damageBoost = true）を宣言してください。`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dishName: { type: Type.STRING, description: "料理の特定名称。例: 特製完熟トマトとルッコラのペペロンチーノ" },
            detectedVeggies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "写真内で検出された主要な野菜や健康的素材のリスト（日本語。例: トマト, ブロッコリー, パセリ）"
            },
            colorRatio: {
              type: Type.OBJECT,
              properties: {
                red: { type: Type.INTEGER, description: "赤色の食材バランス度 (0-100)" },
                green: { type: Type.INTEGER, description: "緑色の食材バランス度 (0-100)" },
                yellow: { type: Type.INTEGER, description: "黄色/オレンジ色の食材バランス度 (0-100)" }
              },
              required: ["red", "green", "yellow"]
            },
            damageBoost: { type: Type.BOOLEAN, description: "トマト、ブロッコリーなどの特効対象野菜が含まれている場合はtrue、含まれていなければfalse" },
            narrative: { type: Type.STRING, description: "この料理が放つ健康エネルギーがジャンク軍団を浄化する様を、和食サムライ風の語尾（〜なり！、〜ぞ！）で描く痛快な戦闘実況ナレーション文" }
          },
          required: ["dishName", "detectedVeggies", "colorRatio", "damageBoost", "narrative"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No structured scan data received from Gemini");
    }

    const parsedData = JSON.parse(resultText);
    
    // 合計値を100に正規化
    const totalColor = (parsedData.colorRatio.red || 0) + (parsedData.colorRatio.green || 0) + (parsedData.colorRatio.yellow || 0);
    if (totalColor > 0 && totalColor !== 100) {
      parsedData.colorRatio.red = Math.round((parsedData.colorRatio.red / totalColor) * 100);
      parsedData.colorRatio.green = Math.round((parsedData.colorRatio.green / totalColor) * 100);
      parsedData.colorRatio.yellow = 100 - parsedData.colorRatio.red - parsedData.colorRatio.green;
    }

    // スコア算出
    const score = (parsedData.colorRatio.red + parsedData.colorRatio.green + parsedData.colorRatio.yellow) * 10;
    
    // ダメージ量計算
    let baseDamage = score * 3.5;
    if (parsedData.damageBoost) {
      baseDamage *= 2; // お題特効
    }

    return res.json({
      success: true,
      data: {
        dishName: parsedData.dishName,
        detectedVeggies: parsedData.detectedVeggies,
        colorRatio: parsedData.colorRatio,
        score,
        damage: Math.round(baseDamage),
        damageBoost: parsedData.damageBoost,
        narrative: parsedData.narrative,
        healthyLevel: score >= 900 ? "神聖オーガニック料理" : score >= 700 ? "究極ヘルシーサラダ" : "バランス栄養ご飯"
      }
    });

  } catch (error: any) {
    console.error("Gemini Scan Error, using dynamic simulation fallback:", error);
    // エラー時のインテリジェントな擬似フェカエ
    const query = promptUsed || "";
    const found = FOOD_FALLBACKS.find(f => f.keys.some(k => query.toLowerCase().includes(k)));
    const match = found || DEFAULT_FOOD;

    let score = (match.colors.red + match.colors.green + match.colors.yellow) * 10;
    let baseDamage = score * 3.5;
    let damageBoost = query.includes("トマト") || query.includes("ブロッコリー") || query.includes("caprese") || query.includes("soup");
    if (damageBoost) {
      baseDamage *= 2;
    }

    return res.json({
      success: true,
      data: {
        dishName: match.dishName,
        detectedVeggies: match.veggies,
        colorRatio: {
          red: match.colors.red,
          green: match.colors.green,
          yellow: match.colors.yellow
        },
        score,
        damage: Math.round(baseDamage),
        damageBoost,
        narrative: match.narrative + " (AI分析エンジンが稼働制限中のため、賢い予測システムが発現したなり！)",
        healthyLevel: "ヘルシーバランス食 (Simulation)"
      }
    });
  }
});

// Vite統合と静的ファイル配信
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Veggie Raid Server] Running smoothly on port ${PORT}`);
  });
}

startServer();
