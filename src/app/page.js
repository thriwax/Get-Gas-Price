"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import dynamic from "next/dynamic";

const Sketch = dynamic(() => import("react-p5"), { ssr: false });

const RPC_URLS = [
  "https://eth.llamarpc.com",
  "https://cloudflare-eth.com",
  "https://rpc.ankr.com/eth"
];

export default function Home() {
  const [gasPrice, setGasPrice] = useState(null);
  const [previousGasPrice, setPreviousGasPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchGasPrice() {
    setLoading(true);
    let success = false;

    for (const url of RPC_URLS) {
      try {
        const provider = new ethers.JsonRpcProvider(url);
        const price = await provider.getFeeData();
        if (!price.gasPrice) throw new Error("Gas price is undefined");

        const newGasPrice = parseFloat(ethers.formatUnits(price.gasPrice, "gwei"));
        setPreviousGasPrice(gasPrice);
        setGasPrice(newGasPrice);
        success = true;
        break;
      } catch (error) {
        console.error(`Error fetching gas price from ${url}:`, error);
      }
    }

    if (!success) {
      alert("Failed to fetch gas price. Try again later.");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchGasPrice();
  }, []);

  const priceChange =
    previousGasPrice !== null && gasPrice !== null
      ? gasPrice - previousGasPrice
      : null;

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.frameRate(30);
  };

  const draw = (p5) => {
    p5.background(10);
    p5.noFill();
    p5.stroke(0, 255, 128, 150);
    p5.strokeWeight(2);

    const mouseX = p5.mouseX;
    const mouseY = p5.mouseY;

    for (let x = 0; x < p5.width; x += 40) {
      for (let y = 0; y < p5.height; y += 40) {
        const noiseVal = p5.noise(x * 0.01, y * 0.01, p5.millis() * 0.0001);
        p5.push();
        p5.translate(x, y);
        p5.rotate(noiseVal * p5.TWO_PI);
        
        const distToMouse = p5.dist(x, y, mouseX, mouseY);
        const warpEffect = p5.map(distToMouse, 0, 300, 10, 40);
        
        p5.line(-warpEffect, 0, warpEffect, 0);
        p5.pop();
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <Sketch setup={setup} draw={draw} className="absolute top-0 left-0 w-full h-full" />
      <div className="absolute flex flex-col items-center justify-center px-6 py-4 bg-black bg-opacity-80 text-white rounded-xl shadow-lg border border-gray-700">
        <h1 className="text-2xl font-bold">Current Gas Price</h1>
        <p className="text-xl mt-2">
          {gasPrice !== null ? `${gasPrice.toFixed(6)} Gwei` : "Loading..."}
        </p>
        <p
          className={`mt-2 text-lg ${
            priceChange === null
              ? "text-gray-400"
              : priceChange > 0
              ? "text-red-500"
              : "text-green-500"
          }`}
        >
          {priceChange !== null
            ? `${priceChange > 0 ? "⬆️" : "⬇️"} ${Math.abs(
                priceChange
              ).toFixed(6)} Gwei`
            : "—"}
        </p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          onClick={fetchGasPrice}
          disabled={loading}
        >
          {loading ? "Loading..." : "Update"}
        </button>
        <div className="mt-2 mb-2">
          <p>by <a className="italic font-bold" href="https://fedor.tech/">Fedor Tatarintsev</a></p>
        </div>
      </div>
    </div>
  );
}