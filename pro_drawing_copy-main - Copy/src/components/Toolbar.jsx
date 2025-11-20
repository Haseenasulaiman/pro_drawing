import React from "react";
import {
  Brush, Eraser, Minus, Square, Circle, Star, Text,
  Palette, RotateCw, RotateCcw
} from "lucide-react";

export default function Toolbar({
  tool, setTool,
  color, setColor,
  size, setSize,
  opacity, setOpacity,
  brushType, setBrushType,
  onUndo, onRedo, onReset,
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
    <div className="flex items-center gap-4 p-3 bg-white/70 shadow-md rounded-b-xl">
      {/* Tools */}
      <div className="flex gap-2">
        {tools.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={label}
            onClick={() => setTool(id)}
            className={`p-2 rounded-lg border transition
              ${tool===id
                ? "bg-gradient-to-tr from-purple-500 to-pink-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
              }`}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>

      {/* Color */}
      <div className="flex items-center gap-2">
        <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="w-10 h-10 rounded border"/>
        <div className="flex gap-1">
          {presetColors.map(c=>(
            <button key={c} title={c} style={{backgroundColor:c}}
              onClick={()=>setColor(c)}
              className={`w-6 h-6 rounded-full border-2 ${color===c?"border-black":"border-white"}`} />
          ))}
        </div>
      </div>

      {/* Brush settings */}
      <div className="flex items-center gap-2">
        <select value={brushType} onChange={e=>setBrushType(e.target.value)} className="rounded border p-1 text-sm">
          {brushTypes.map(bt=> <option key={bt} value={bt}>{bt}</option>)}
        </select>
        <input type="range" min="1" max="50" value={size} onChange={e=>setSize(Number(e.target.value))} className="w-24"/>
        <span className="text-xs">{size}px</span>
        <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={e=>setOpacity(Number(e.target.value))} className="w-24"/>
        <span className="text-xs">{opacity}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 ml-auto">
        <button onClick={onUndo} className="p-2 bg-gray-200 rounded" title="Undo">
          <RotateCcw size={18}/>
        </button>
        <button onClick={onRedo} className="p-2 bg-gray-200 rounded" title="Redo">
          <RotateCw size={18}/>
        </button>
        <button onClick={onReset} className="p-2 bg-red-500 text-white rounded" title="Reset">
          Reset
        </button>
      </div>
    </div>
  );
}
