"use client"
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric-pure-browser";

const LogoMaker = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#fff",
      width: 800,
      height: 600,
    });
    setCanvas(fabricCanvas);
    saveState(fabricCanvas);

    fabricCanvas.on("mouse:dblclick", function (e) {
      const obj = e.target;
      if (obj && obj.type === "textbox") {
        obj.enterEditing();
        obj.selectAll();
      }
    });

    return () => fabricCanvas.dispose();
  }, []);

  const applyFilter = (filterType) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "image") {
      let filter;
      switch (filterType) {
        case "grayscale":
          filter = new fabric.Image.filters.Grayscale();
          break;
        case "sepia":
          filter = new fabric.Image.filters.Sepia();
          break;
        case "invert":
          filter = new fabric.Image.filters.Invert();
          break;
        default:
          return;
      }
      activeObject.filters.push(filter);
      activeObject.applyFilters();
      canvas.renderAll();
    }
  };
  

  const saveState = (canvas) => {
    setHistory((prev) => [...prev, JSON.stringify(canvas.toJSON())]);
  };

  const addText = () => {
    if (!canvas) return;
    const text = new fabric.Textbox("Your Logo", {
      left: 100,
      top: 100,
      fontSize: 30,
      fill: "black",
      fontFamily: "Arial",
      width: 200,
    });
    canvas.add(text);
    saveState(canvas);
  };

  const addImage = (e) => {
    if (!canvas) return;
    const reader = new FileReader();
    reader.onload = function (event) {
      fabric.Image.fromURL(event.target.result, (img) => {
        img.scale(0.5);
        canvas.add(img);
        saveState(canvas);
      });
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const apply3DEffect = (effect) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      switch (effect) {
        case "rotateX":
          activeObject.set("angle", activeObject.angle + 10);
          break;
        case "rotateY":
          activeObject.set("skewX", activeObject.skewX + 5);
          break;
        case "depth":
          activeObject.set("shadow", "10px 10px 5px rgba(0,0,0,0.5)");
          break;
      }
      canvas.renderAll();
      saveState(canvas);
    }
  };

  const exportAsSVG = () => {
    if (!canvas) return;
  
    // Ensure all images are loaded before generating SVG
    canvas.clone((clonedCanvas) => {
      const svg = clonedCanvas.toSVG();
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "logo.svg";
      link.click();
    });
  };

  const groupObjects = () => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 1) {
      const group = new fabric.Group(activeObjects);
      canvas.clear().add(group);
      canvas.renderAll();
    }
  };  

  const undo = () => {
    if (history.length > 1) {
      const prevState = history[history.length - 2];
      setRedoStack((prev) => [...prev, history.pop()]);
      setHistory([...history]);
      canvas.loadFromJSON(prevState, () => canvas.renderAll());
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack.pop();
      setHistory((prev) => [...prev, nextState]);
      canvas.loadFromJSON(nextState, () => canvas.renderAll());
    }
  };

  const updateTextStyle = (style, value) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "textbox") {
      if (style === "fontFamily") {
        activeObject.set("fontFamily", value);
      } else if (style === "textAlign") {
        activeObject.set("textAlign", value);
      } else {
        activeObject.set(style, value);
      }
      canvas.renderAll();
      saveState(canvas);
    }
  };
  const deleteSelected = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
      saveState(canvas);
    }
  };

  const apply3DTransform = (type) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    switch (type) {
      case "skewX":
        activeObject.set({ skewX: activeObject.skewX + 10 });
        break;
      case "skewY":
        activeObject.set({ skewY: activeObject.skewY + 10 });
        break;
      case "perspective":
        activeObject.set({ angle: activeObject.angle + 15 });
        break;
      default:
        break;
    }
    canvas.renderAll();
  };

  const saveDesign = () => {
    if (!canvas) return;
    const design = JSON.stringify(canvas.toJSON());
    localStorage.setItem("savedLogo", design);
  };

  const loadDesign = () => {
    if (!canvas) return;
    const design = localStorage.getItem("savedLogo");
    if (design) {
      canvas.loadFromJSON(design, () => canvas.renderAll());
    }
  };

  const applyBrightnessContrast = (type, value) => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === "image") {
      let filter;
      
      if (type === "brightness") {
        filter = new fabric.Image.filters.Brightness({ brightness: value });
      } else if (type === "contrast") {
        filter = new fabric.Image.filters.Contrast({ contrast: value });
      }
  
      activeObject.filters.push(filter);
      activeObject.applyFilters();
      canvas.renderAll();
    }
  };

  const applyBlur = () => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === "image") {
      let filter = new fabric.Image.filters.Blur({ blur: 0.2 });
      activeObject.filters.push(filter);
      activeObject.applyFilters();
      canvas.renderAll();
    }
  };

  const flipImage = (direction) => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === "image") {
      if (direction === "horizontal") {
        activeObject.set("flipX", !activeObject.flipX);
      } else if (direction === "vertical") {
        activeObject.set("flipY", !activeObject.flipY);
      }
      canvas.renderAll();
    }
  };

  const cropImage = () => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === "image") {
      activeObject.set({
        clipPath: new fabric.Rect({
          left: 10,
          top: 10,
          width: 100,
          height: 100,
          absolutePositioned: true,
        }),
      });
      canvas.renderAll();
    }
  };

  const resetFilters = () => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === "image") {
      activeObject.filters = [];
      activeObject.applyFilters();
      canvas.renderAll();
    }
  };
  
  const undos = () => {
    if (history.length > 1) {
      setRedoStack((prev) => [...prev, history.pop()]);
      const prevState = history[history.length - 1]; // Get the last saved state
      setHistory([...history]);
      canvas.loadFromJSON(prevState, () => {
        canvas.renderAll();
      });
    }
  };
  

  return (
    <div className="p-4">
      <div className="mt-4 flex flex-wrap gap-2 justify-start">
      <button onClick={undos} className="px-4 py-2 bg-yellow-500 text-white">Back</button>

        <button onClick={() => updateTextStyle("fontFamily", "Arial")} className="px-4 py-2 bg-gray-500 text-white">Arial</button>
        <button onClick={() => updateTextStyle("fontFamily", "Courier New")} className="px-4 py-2 bg-gray-500 text-white">Courier</button>
        <button onClick={() => updateTextStyle("textAlign", "left")} className="px-4 py-2 bg-gray-600 text-white">Left</button>
        <button onClick={() => updateTextStyle("textAlign", "center")} className="px-4 py-2 bg-gray-600 text-white">Center</button>
        <button onClick={() => updateTextStyle("textAlign", "right")} className="px-4 py-2 bg-gray-600 text-white">Right</button>
        <button onClick={deleteSelected} className="px-4 py-2 bg-red-500 text-white">Delete</button>
        <button onClick={undo} className="px-4 py-2 bg-yellow-500 text-white">Undo</button>
        <button onClick={redo} className="px-4 py-2 bg-green-500 text-white">Redo</button>
        <button onClick={saveDesign} className="px-4 py-2 bg-blue-700 text-white">Save</button>
        <button onClick={loadDesign} className="px-4 py-2 bg-blue-400 text-white">Load</button>

        <input type="color" onChange={(e) => updateTextStyle("fill", e.target.value)} />
<input type="color" onChange={(e) => canvas.backgroundColor = e.target.value} />

<button onClick={() => applyFilter("grayscale")} className="px-4 py-2 bg-gray-500 text-white">Grayscale</button>
<button onClick={() => applyFilter("sepia")} className="px-4 py-2 bg-yellow-500 text-white">Sepia</button>
<button onClick={() => applyFilter("invert")} className="px-4 py-2 bg-black text-white">Invert</button>


<button onClick={addText} className="px-4 py-2 bg-blue-500 text-white">Add Text</button>
        <input type="file" onChange={addImage} className="px-4 py-2" />
        <button onClick={() => apply3DEffect("rotateX")} className="px-4 py-2 bg-green-500 text-white">Rotate X</button>
        <button onClick={() => apply3DEffect("rotateY")} className="px-4 py-2 bg-green-500 text-white">Rotate Y</button>
        <button onClick={() => apply3DEffect("depth")} className="px-4 py-2 bg-gray-700 text-white">3D Depth</button>

        <button onClick={() => apply3DTransform("skewX")} className="px-4 py-2 bg-gray-500 text-white">Skew X</button>
        <button onClick={() => apply3DTransform("skewY")} className="px-4 py-2 bg-gray-500 text-white">Skew Y</button>
        <button onClick={() => apply3DTransform("perspective")} className="px-4 py-2 bg-gray-600 text-white">Rotate</button>

        <button onClick={resetFilters} className="px-4 py-2 bg-gray-400 text-white">Reset Filters</button>
        <button onClick={cropImage} className="px-4 py-2 bg-green-500 text-white">Crop Image</button>
        <button onClick={() => flipImage("horizontal")} className="px-4 py-2 bg-red-500 text-white">Flip Horizontally</button>
<button onClick={() => flipImage("vertical")} className="px-4 py-2 bg-red-700 text-white">Flip Vertically</button>
<button onClick={applyBlur} className="px-4 py-2 bg-gray-600 text-white">Blur Image</button>
<button onClick={() => applyBrightnessContrast("brightness", 0.1)} className="px-4 py-2 bg-yellow-500 text-white">Increase Brightness</button>
<button onClick={() => applyBrightnessContrast("brightness", -0.1)} className="px-4 py-2 bg-yellow-700 text-white">Decrease Brightness</button>

<button onClick={() => applyBrightnessContrast("contrast", 0.2)} className="px-4 py-2 bg-blue-500 text-white">Increase Contrast</button>
<button onClick={() => applyBrightnessContrast("contrast", -0.2)} className="px-4 py-2 bg-blue-700 text-white">Decrease Contrast</button>


<button onClick={() => updateTextStyle("fontSize", 20)}>Small</button>
<button onClick={() => updateTextStyle("fontSize", 40)}>Large</button>
<button onClick={() => updateTextStyle("fontWeight", "bold")}>Bold</button>
<button onClick={() => updateTextStyle("stroke", "black")}>Border</button>
<button onClick={() => updateTextStyle("shadow", "5px 5px 10px gray")}>Shadow</button>
<button onClick={() => updateTextStyle("angle", 15)}>Rotate 15°</button>
<button onClick={() => updateTextStyle("scaleX", 1.5)}>Scale +</button>
<button onClick={() => updateTextStyle("scaleX", 1)}>Reset</button>


        <button onClick={exportAsSVG} className="px-4 py-2 bg-blue-400 text-white">exportAsSVG</button>
        <button onClick={groupObjects} className="px-4 py-2 bg-blue-400 text-white">groupObjects</button>
      </div>
      <canvas ref={canvasRef} className="border mt-5 justify-center"></canvas>
    
    </div>
  );
};

export default dynamic(() => Promise.resolve(LogoMaker), { ssr: false });