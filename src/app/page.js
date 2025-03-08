"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function Home() {
  const [gasPrice, setGasPrice] = useState(null);
  const [previousGasPrice, setPreviousGasPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchGasPrice() {
    setLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
      const price = await provider.getFeeData();
      const newGasPrice = parseFloat(ethers.formatUnits(price.gasPrice, "gwei"));

      setPreviousGasPrice(gasPrice);
      setGasPrice(newGasPrice);
    } catch (error) {
      console.error("Error in obtaining gas price:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchGasPrice(); // Загружаем данные сразу после монтирования
  }, []);

  const priceChange =
    previousGasPrice !== null && gasPrice !== null
      ? gasPrice - previousGasPrice
      : null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center px-6 py-4 bg-white rounded-xl shadow-lg border border-gray-300">
        <h1 className="text-2xl font-bold">Current Gas Price</h1>
        <p className="text-xl mt-2 ping">
          {gasPrice !== null ? `${gasPrice.toFixed(6)} Gwei` : "Loading..."}
        </p>
        <p
          className={`mt-2 text-lg ${
            priceChange === null
              ? "text-gray-500"
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
      </div>
    </div>
  );
}
