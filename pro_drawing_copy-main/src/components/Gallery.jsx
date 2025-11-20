import React, { useEffect, useState } from "react";
export default function Gallery({ show, onClose, canvasRef }) {
  const [images,setImages]=useState([]);
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
  useEffect(()=>{
    if(!show) return;
    const fetchImages=async()=>{
      try {
        const token = localStorage.getItem('token');
        const res=await fetch(`${API_BASE}/api/drawings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data=await res.json();
        setImages(data.drawings||[]);
      } catch(err){ console.error(err); }
    };
    fetchImages();
  },[show, API_BASE]);
  const handleDelete=async(id)=>{
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/drawings/${id}`,{
        method:"DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setImages(prev => prev.filter(img=>img._id!==id));
    } catch(err){ console.error(err); alert("Delete failed ❌"); }
  };
  const handleEdit=(img)=>{
    if(!canvasRef.current) return;
    const image=new Image();
    image.onload=()=>{canvasRef.current.loadImage(image, true); onClose();};
    image.src=img.image;
  };
  if(!show) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-start pt-16 z-50 overflow-y-auto">
      <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-pink-200 p-6 rounded-3xl w-4/5 max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Gallery
          </h2>
          <button onClick={onClose} className="text-red-600 font-bold text-2xl hover:scale-110 transition">✕</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {images.length===0 && <p className="col-span-3 text-center">No images found.</p>}
          {images.map((img)=>(
            <div key={img._id} className="relative rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition bg-white">
              <img src={img.image} alt={img.title||`Drawing`} className="w-full h-48 object-cover"/>
              <div className="absolute bottom-1 left-1 right-1 flex justify-between bg-black/50 text-white px-2 py-1 text-xs rounded-xl">
                <button onClick={()=>handleEdit(img)} className="hover:text-green-400">Edit</button>
                <button onClick={()=>handleDelete(img._id)} className="hover:text-red-400">Delete</button>
              </div>
              <div className="px-3 py-2 text-sm text-gray-700 truncate">{img.title || "Untitled"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
