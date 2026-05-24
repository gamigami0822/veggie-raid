import React, { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, Upload, Sparkles, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { playClick } from "../utils/sound";

interface CameraSelectorProps {
  onImageCaptured: (base64: string, source: "camera" | "upload") => void;
  onClearImage: () => void;
  currentImageUrl: string;
  currentImageSource: string;
}

export const CameraSelector: React.FC<CameraSelectorProps> = ({
  onImageCaptured,
  onClearImage,
  currentImageUrl,
  currentImageSource
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [dragOver, setDragOver] = useState<boolean>(false);

  // カメラデバイスの列挙
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const videoDevices = devices.filter(device => device.kind === "videoinput");
          setCameras(videoDevices);
          if (videoDevices.length > 0) {
            setSelectedCameraId(videoDevices[0].deviceId);
          }
        })
        .catch(() => {
          // 静かに無視、またはカメラパーミッションに直結
        });
    }

    return () => {
      stopCamera();
    };
  }, []);

  // カメラストリームの開始
  const startCamera = async () => {
    setCameraError("");
    playClick();

    if (stream) {
      stopCamera();
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: selectedCameraId 
          ? { deviceId: { exact: selectedCameraId }, width: 400, height: 400 } 
          : { facingMode: "environment", width: 400, height: 400 }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera startup failed:", err);
      setCameraError("カメラを起動できないなり！パーミッションを確認するか、デバイスを変えてほしいなり。");
      setIsCameraActive(false);
    }
  };

  // カメラを停止
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // スナップショット撮影
  const captureSnapshot = () => {
    playClick();
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        canvas.width = 400;
        canvas.height = 400;
        
        // アスペクト比1:1の正方形に中央トリミング
        const size = Math.min(video.videoWidth, video.videoHeight);
        const xOffset = (video.videoWidth - size) / 2;
        const yOffset = (video.videoHeight - size) / 2;

        ctx.drawImage(video, xOffset, yOffset, size, size, 0, 0, 400, 400);
        
        const base64 = canvas.toDataURL("image/jpeg");
        onImageCaptured(base64, "camera");
        stopCamera();
      }
    }
  };

  // ファイルアップロード処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してほしいなり！");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImageCaptured(event.target.result as string, "upload");
      }
    };
    reader.readAsDataURL(file);
  };

  // ドラッグ＆ドロップ
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
      <div className="flex justify-between items-center border-b border-gray-800 pb-3">
        <h4 className="text-sm font-bold text-gray-200 flex items-center gap-2">
          <Camera size={16} className="text-emerald-400" />
          野菜料理のリアル撮影 ＆ アップロード
        </h4>
        {currentImageUrl && (
          <button 
            onClick={onClearImage}
            className="text-gray-400 hover:text-rose-400 text-xs flex items-center gap-1 cursor-pointer"
          >
            <X size={12} /> 写真をリセット
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* レフトパネル：カメラビューファインダー ＆ ドラッグドロップエリア */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden aspect-square flex flex-col items-center justify-center relative p-4 group">
          {isCameraActive ? (
            <div className="relative w-full h-full flex flex-col justify-between items-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover rounded-xl border border-slate-800 shadow-inner"
              />
              <div className="absolute bottom-3 left-3 right-3 flex justify-between gap-2 z-10">
                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-400 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform duration-100 hover:scale-103 active:scale-97 cursor-pointer"
                >
                  写真を撮るなり！
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-white border border-gray-800 rounded-xl font-bold text-xs cursor-pointer"
                >
                  止める
                </button>
              </div>
            </div>
          ) : currentImageUrl ? (
            // アップロードまたは撮影された写真の表示
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={currentImageUrl} 
                alt="Mealsource" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl border border-emerald-500/30"
              />
              <div className="absolute top-2 left-2 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-950">
                <CheckCircle2 size={10} /> 料理装填完了 ({currentImageSource === "camera" ? "カメラ" : "アップロード"})
              </div>
            </div>
          ) : (
            // 待機中 / アップロード受付
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full h-full border-2 border-dashed ${
                dragOver ? "border-emerald-500 bg-emerald-950/10" : "border-slate-800 hover:border-slate-700/60"
              } rounded-xl flex flex-col items-center justify-center text-center p-6 transition-all duration-200 cursor-pointer relative`}
            >
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileChange}
              />
              <Upload size={32} className={`text-slate-600 mb-3 group-hover:text-emerald-400 group-hover:scale-110 transition-all`} />
              <p className="text-xs font-bold text-gray-300">画像をここにドラッグ ＆ ドロップ</p>
              <p className="text-[10px] text-gray-500 mt-1">または、ここをクリックして写真を選択</p>
            </div>
          )}
        </div>

        {/* ライトパネル：コントロール & カメラリスト */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong>リアル食事スキャンに挑戦！</strong><br />
              本当に自分で作ったサラダや、コンビニで調達した野菜惣菜など、「お気に入りのヘルシー野菜メニュー」の写真を選択またはインカメラで撮影して、レイドボスに全力で投げつけてみましょう！
            </p>

            {cameraError && (
              <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400 flex items-start gap-2">
                <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {!isCameraActive && !currentImageUrl && (
              <div className="space-y-3 bg-slate-950 p-4 border border-slate-800/80 rounded-2xl">
                <span className="text-[10px] uppercase font-extrabold text-gray-500 block">Webカメラ起動設定</span>
                {cameras.length > 1 && (
                  <select
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    className="w-full bg-slate-900 border border-gray-800 rounded-xl p-2 text-xs text-gray-300 focus:outline-none focus:border-emerald-500"
                  >
                    {cameras.map((camera, index) => (
                      <option key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || `カメラ #${index + 1}`}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-gray-800 hover:border-slate-700 hover:text-white rounded-xl text-gray-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera size={14} /> カメラをオンにするなり！
                </button>
              </div>
            )}

            {currentImageUrl && (
              <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="text-xl">🥗</span>
                  <div>
                    <span className="text-xs font-black block">お見事なり！食糧が装填されました。</span>
                    <span className="text-[10px] text-gray-500 block">上の「AIで料理を分析＆突撃！」を叩くのじゃ！</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isCameraActive && (
            <div className="text-[11px] text-gray-500 flex items-center gap-1 min-h-[30px]">
              <Sparkles size={11} className="text-emerald-400 animate-pulse" />
              <span>写真をお持ちでない場合は、左の「おすすめ召喚レシピ」をご活用ください。</span>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
