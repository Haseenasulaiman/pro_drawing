import React, { useRef, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthGuard from "./components/auth/AuthGuard";
import Toolbar from "./components/Toolbar";
import CanvasBoard from "./components/CanvasBoard";
import Gallery from "./components/Gallery";
import { LogOut, User } from "lucide-react";

function DrawingApp() {
  const canvasRef = useRef(null);
  const { user, logout } = useAuth();

  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState("#ff4d6d");
  const [size, setSize] = useState(4);
  const [opacity, setOpacity] = useState(1);
  const [brushType, setBrushType] = useState("round");
  const [showGallery, setShowGallery] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const handleSave = async () => {
    if (!canvasRef.current) return;
    const image = canvasRef.current.toDataURL("image/png");

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/save`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          image,
          title: `Drawing ${new Date().toLocaleString()}`,
          tags: ["canvas", "drawing"],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Save failed");
      alert("Saved to backend ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to save ❌");
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `drawing_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file || !canvasRef.current) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => canvasRef.current.loadImage(img, true);
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 text-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between p-3 shadow-lg backdrop-blur-md bg-white/60 rounded-b-2xl">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600">
          🎨 Pro Drawing Studio
        </h1>

        <div className="flex items-center gap-2 flex-wrap">
          {/* User Info */}
          <div className="flex items-center gap-2 px-3 py-1 bg-white/50 rounded-lg">
            <User className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">{user?.username}</span>
          </div>
          <button
            onClick={() => setShowGallery(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow hover:scale-105 transition"
          >
            🖼️ Gallery
          </button>

          <label className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow hover:scale-105 transition cursor-pointer">
            ⬆️ Import
            <input type="file" accept="image/*" onChange={handleImport} className="hidden" />
          </label>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow hover:scale-105 transition"
          >
            💾 Save
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow hover:scale-105 transition"
          >
            ⬇️ Download
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white shadow hover:scale-105 transition flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar
        tool={tool} setTool={setTool}
        color={color} setColor={setColor}
        size={size} setSize={setSize}
        opacity={opacity} setOpacity={setOpacity}
        brushType={brushType} setBrushType={setBrushType}
        onUndo={() => canvasRef.current?.undo()}
        onRedo={() => canvasRef.current?.redo()}
        onReset={() => canvasRef.current?.reset()}
      />

      {/* Canvas */}
      <div className="flex-1 p-4">
        <CanvasBoard
          ref={canvasRef}
          tool={tool}
          color={color}
          size={size}
          opacity={opacity}
          brushType={brushType}
        />
      </div>

      {/* Gallery modal */}
      <Gallery show={showGallery} onClose={() => setShowGallery(false)} canvasRef={canvasRef} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <DrawingApp />
      </AuthGuard>
    </AuthProvider>
  );
}
