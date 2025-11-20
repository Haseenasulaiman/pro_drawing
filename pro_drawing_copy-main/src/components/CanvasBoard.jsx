import React, {
  forwardRef, useEffect, useRef, useImperativeHandle, useState,
} from "react";

const CanvasBoard = forwardRef(({ tool, color, size, opacity, brushType }, ref) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });
  const previewImgRef = useRef(null);       
  const history = useRef([]);               
  const redoStack = useRef([]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const setSizeAndKeep = () => {
      if (!canvas) return;
      const data = canvas.toDataURL();
      const img = new Image();
      img.onload = () => {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        const ctx = canvas.getContext("2d");
        ctxRef.current = ctx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = data;
    };
    setSizeAndKeep();
    window.addEventListener("resize", setSizeAndKeep);
    return () => window.removeEventListener("resize", setSizeAndKeep);
  }, []);
  useEffect(() => {
    const ctx = ctxRef.current || canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;
    ctx.lineCap = brushType;
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = size;
    ctx.globalAlpha = opacity;
  }, [color, size, opacity, brushType]);
  const beginPathAt = (x, y) => {
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const pushHistory = () => {
    const url = canvasRef.current.toDataURL();
    history.current.push(url);
    redoStack.current = [];
  };
  const loadImageURL = (url, cb) => {
    const img = new Image();
    img.onload = () => cb(img);
    img.src = url;
  };
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = ctxRef.current;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = size;
    ctx.globalAlpha = opacity;
    ctx.lineCap = brushType;
    if (tool === "text") {
      const text = window.prompt("Enter text:");
      if (text) {
        ctx.font = `${size * 4}px Arial`;
        ctx.fillText(text, x, y);
        pushHistory();
      }
      return;
    }
    if (tool === "eraser") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      beginPathAt(x, y);
      setIsDrawing(true);
      return;
    }
    if (tool === "brush") {
      beginPathAt(x, y);
      setIsDrawing(true);
      return;
    }
    previewImgRef.current = new Image();
    previewImgRef.current.src = canvasRef.current.toDataURL();
    startRef.current = { x, y };
    setIsDrawing(true);
  };
  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = ctxRef.current;
    if (tool === "brush") {
      ctx.lineTo(x, y);
      ctx.stroke();
      return;
    }
    if (tool === "eraser") {
      ctx.lineTo(x, y);
      ctx.stroke();
      return;
    }
    const { x: sx, y: sy } = startRef.current;
    const img = previewImgRef.current;
    if (!img) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.globalAlpha = opacity;
    switch (tool) {
      case "line":
        ctx.moveTo(sx, sy);
        ctx.lineTo(x, y);
        break;
      case "rectangle":
        ctx.rect(sx, sy, x - sx, y - sy);
        break;
      case "circle": {
        const r = Math.hypot(x - sx, y - sy);
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        break;
      }
      case "star": {
        drawStar(ctx, sx, sy, 5, Math.hypot(x - sx, y - sy), Math.hypot(x - sx, y - sy) / 2);
        break;
      }
      default:
        break;
    }
    ctx.stroke();
  };
  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    const ctx = ctxRef.current;
    if (tool === "eraser") ctx.restore();
    setIsDrawing(false);
    pushHistory();
  };
  const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
    let rot = -Math.PI / 2;
    const step = Math.PI / spikes;
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };
  useImperativeHandle(ref, () => ({
    toDataURL: (type = "image/png") => canvasRef.current.toDataURL(type),
    reset: () => {
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      history.current = [];
      redoStack.current = [];
    },
    undo: () => {
      if (history.current.length < 1) return;
      const current = canvasRef.current.toDataURL();
      redoStack.current.push(current);
      const prev = history.current.pop();
      loadImageURL(prev, (img) => {
        const ctx = ctxRef.current;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      });
    },
    redo: () => {
      if (redoStack.current.length < 1) return;
      const current = canvasRef.current.toDataURL();
      history.current.push(current);
      const next = redoStack.current.pop();
      loadImageURL(next, (img) => {
        const ctx = ctxRef.current;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      });
    },
    loadImage: (img, reset = false) => {
      const ctx = ctxRef.current;
      if (reset) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        history.current = [];
        redoStack.current = [];
      }
      ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      history.current.push(canvasRef.current.toDataURL());
      redoStack.current = [];
    },
  }));
  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full bg-white rounded-2xl shadow-xl border"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
});
export default CanvasBoard;