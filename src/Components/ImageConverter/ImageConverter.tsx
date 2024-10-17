import React, { useState, useEffect, useRef } from "react";
import ColorPicker from "../ColorPicker/ColorPicker";

interface Props {
  initialSize?: number;
  initialInverted?: boolean;
  initialColor?: string;
}

const ImageConverter: React.FC<Props> = ({}) => {
  const [svgContent, setSvgContent] = useState<string>("");
  const [size, setSize] = useState(9);
  const [sensetivity, setSensetivity] = useState(2);
  const [brightness, setBrightness] = useState(0.45);
  const [inverted, setInverted] = useState(false);
  const [color, setColor] = useState("#2c301d");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [maxImageSize, setMaxImageSize] = useState(800);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => processImage(img);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile, size, inverted, color, maxImageSize, sensetivity, brightness]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const processImage = (img: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    let width = img.width;
    let height = img.height;
    const aspectRatio = width / height;

    width = maxImageSize;
    height = width / aspectRatio;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svgContent += `<rect width="100%" height="100%" fill="none"/>`;

    const hexHeight = size;
    const hexWidth = size;

    for (let y = 0; y < height + hexHeight; y += hexHeight) {
      const isOddRow = Math.floor(y / hexHeight) % 2 === 1;
      for (
        let x = isOddRow ? hexWidth / 2 : 0;
        x < width + hexWidth;
        x += hexWidth
      ) {
        const centerX = Math.floor(x);
        const centerY = Math.floor(y);

        if (
          centerX >= 0 &&
          centerX < width &&
          centerY >= 0 &&
          centerY < height
        ) {
          const index = (centerY * width + centerX) * 4;
          const r = pixels[index];
          const g = pixels[index + 1];
          const b = pixels[index + 2];
          const rgb = (r + g + b) / 3;

          if (rgb < 255) {
            var radius = inverted
              ? mapRange(rgb, 255, 0, size * 1.1, 1)
              : mapRange(rgb, 0, 255, size * 1.1, 1);

            if (radius > sensetivity) {
              const hexagonPoints = calculateHexagonPoints(
                centerX,
                centerY,
                radius
              );
              svgContent += `<polygon points="${hexagonPoints}" fill="${color}" />`;
            }
          }
        }
      }
    }

    svgContent += "</svg>";
    setSvgContent(svgContent);
  };

  const mapRange = (
    value: number,
    low1: number,
    high1: number,
    low2: number,
    high2: number
  ): number => {
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  };

  const calculateHexagonPoints = (
    x: number,
    y: number,
    radius: number
  ): string => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const px = x + radius * brightness * Math.cos(angle);
      const py = y + radius * brightness * Math.sin(angle);
      points.push(`${px},${py}`);
    }
    return points.join(" ");
  };

  const handleDownload = () => {
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hexagonal_image.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downLoadPng = () => {
    const svgElement = document.querySelector("svg");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (svgElement && context) {
      const svgData = new XMLSerializer().serializeToString(svgElement);

      const img = new Image();
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = svgElement.width.baseVal.value;
        canvas.height = svgElement.height.baseVal.value;

        context.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = "hexagonal_image.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
      };

      img.src = url;
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">Hexagon Image Converter</h1>
        <label
          htmlFor="imageUpload"
          className="cursor-pointer flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 mb-4">
          Upload Image
        </label>
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="mb-4">
          <label className="block mb-2">Image Width:</label>
          <input
            type="range"
            min="100"
            max="4000"
            step="50"
            value={maxImageSize}
            onChange={(e) => setMaxImageSize(Number(e.target.value))}
            className="w-full"
          />
          <span>{maxImageSize}px</span>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Hexagon Size:</label>
          <input
            type="range"
            min="3"
            step="0.5"
            max="20"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full"
          />
          <span>{size}</span>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Sensetivity:</label>
          <input
            type="range"
            min="0"
            step="0.5"
            max="5"
            value={sensetivity}
            onChange={(e) => setSensetivity(Number(e.target.value))}
            className="w-full"
          />
          <span>{sensetivity}</span>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Brightness:</label>
          <input
            type="range"
            min="0.1"
            step="0.05"
            max="1"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full"
          />
          <span>{brightness}</span>
        </div>
        <div className="mb-4">
          <label className="block mb-2">
            <input
              type="checkbox"
              checked={inverted}
              onChange={(e) => setInverted(e.target.checked)}
              className="mr-2"
            />
            Invert
          </label>
        </div>
        <div className="mb-4">
          <ColorPicker setColor={setColor} color={color} />
        </div>
        {svgContent && (
          <div className="mt-4">
            <button
              onClick={handleDownload}
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300">
              Download SVG
            </button>
            <button
              onClick={downLoadPng}
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300">
              Download PNG
            </button>
          </div>
        )}
      </div>
      {svgContent && (
        <div
          dangerouslySetInnerHTML={{ __html: svgContent }}
          className="mb-4"
          id="svg"
        />
      )}
    </div>
  );
};

export default ImageConverter;
