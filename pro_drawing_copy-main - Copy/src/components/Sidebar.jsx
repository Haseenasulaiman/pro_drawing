import React from "react";
import { Brush, Eraser, Minus, Square, Circle, Star, Text, Palette, RotateCw, RotateCcw, Download } from "lucide-react";

export default function Sidebar({
  tool, setTool,
  color, setColor,
  size, setSize,
  opacity, setOpacity,
  brushType, setBrushType,
  onUndo, onRedo, onReset, onDownload
}) {
  const tools = [
    { id: "brush", icon: Brush, label: "Brush" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "star", icon: Star, label: "Star" },
    { id: "text", icon: Text, label: "Text" },
  ];

  const presetColors = ["#000000","#FFFFFF","#FF4D6D","#6B46C1","#4F46E5","#FBBF24","#EC4899","#14B8A6"];
  const brushTypes = ["round","square","butt"];

  return (
    <div className="w-64 p-4 bg-gradient-to-b from-purple-200 via-pink-100 to-pink-200 dark:from-gray-800 dark:to-gray-700 flex flex-col gap-4 shadow-xl rounded-r-2xl">
      {/* Tools */}
      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-lg text-center flex items-center justify-center gap-2">
          <Brush size={18}/> Tools
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {tools.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`flex flex-col items-center p-2 rounded-lg border-2 transition
                ${tool===id ? 'bg-purple-500 text-white border-gray-400' : 'bg-white dark:bg-gray-600 border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-500'}`}
            >
              <Icon size={18}/>
              <span className="text-[10px]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-sm flex items-center gap-1"><Palette size={16}/> Color</h2>
        <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="w-full h-8 rounded-lg"/>
        <div className="grid grid-cols-4 gap-1 mt-1">
          {presetColors.map(c=>(
            <button key={c} style={{backgroundColor:c}} onClick={()=>setColor(c)}
              className={`w-6 h-6 rounded border-2 ${color===c?'border-gray-500':'border-gray-200'}`}/>
          ))}
        </div>
      </div>

      {/* Brush type */}
      <div>
        <label className="block text-sm font-medium mt-2">Brush Type</label>
        <select value={brushType} onChange={e=>setBrushType(e.target.value)} className="w-full rounded-lg border p-1 text-sm">
          {brushTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
        </select>
      </div>

      {/* Size */}
      <div>
        <label className="block text-sm font-medium mt-2">Size</label>
        <input type="range" min="1" max="50" value={size} onChange={e=>setSize(Number(e.target.value))} className="w-full"/>
        <div className="text-xs text-center">{size}px</div>
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-sm font-medium mt-2">Opacity</label>
        <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={e=>setOpacity(Number(e.target.value))} className="w-full"/>
        <div className="text-xs text-center">{opacity}</div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        <button onClick={onUndo} className="flex-1 flex items-center justify-center gap-1 p-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"><RotateCcw size={16}/> Undo</button>
        <button onClick={onRedo} className="flex-1 flex items-center justify-center gap-1 p-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"><RotateCw size={16}/> Redo</button>
        <button onClick={onReset} className="flex-1 flex items-center justify-center gap-1 p-2 bg-red-400 text-white rounded text-sm">Reset</button>
        <button onClick={onDownload} className="flex-1 flex items-center justify-center gap-1 p-2 bg-purple-500 text-white rounded text-sm"><Download size={16}/> Download</button>
      </div>
    </div>
  );
}
