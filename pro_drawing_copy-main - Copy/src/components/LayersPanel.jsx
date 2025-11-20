import React from "react";
import { Plus, Trash, Eye, EyeOff, Lock, Unlock } from "lucide-react";

export default function LayersPanel({ layers, activeLayerId, setActiveLayer, addLayer, removeLayer, toggleVisibility, toggleLock }) {
  return (
    <div className="w-64 p-4 bg-gradient-to-t from-pink-100 via-purple-200 to-purple-300 dark:from-gray-700 dark:to-gray-800 flex flex-col gap-3 shadow-xl rounded-l-2xl overflow-y-auto">
      <h2 className="font-bold text-xl mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600">Layers</h2>
      
      {layers.map(layer=>(
        <div key={layer.id} 
          className={`flex items-center justify-between p-2 rounded-xl shadow cursor-pointer transition transform hover:scale-105 ${layer.id===activeLayerId?'bg-gradient-to-r from-purple-400 to-pink-400 text-white':'bg-white dark:bg-gray-600'}`}
          onClick={()=>setActiveLayer(layer.id)}
        >
          <div className="flex items-center gap-2">
            <span>{layer.name}</span>
            <button onClick={e=>{e.stopPropagation(); toggleVisibility(layer.id)}}>{layer.visible?<Eye size={16}/>:<EyeOff size={16}/>}</button>
            <button onClick={e=>{e.stopPropagation(); toggleLock(layer.id)}}>{layer.locked?<Lock size={16}/>:<Unlock size={16}/>}</button>
          </div>
          <button onClick={e=>{e.stopPropagation(); removeLayer(layer.id)}} className="p-1 hover:bg-red-500 rounded transition"><Trash size={16} className="text-red-600"/></button>
        </div>
      ))}

      <button onClick={addLayer} className="mt-3 flex items-center justify-center gap-2 p-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl shadow transition"> <Plus size={16}/> Add Layer</button>
    </div>
  );
}
