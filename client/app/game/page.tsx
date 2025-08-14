"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface PredictionResponse {
  player1: string;
  player2: string;
  winner: string;
  detections: number;
  error?: string;
  left_box?: number[];
  right_box?: number[];
}

interface Round {
  roundNumber: number;
  player1: string;
  player2: string;
  winner: string;
}

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const [rounds, setRounds] = useState<Round[]>([]);
  const [player1Wins, setPlayer1Wins] = useState(0);
  const [player2Wins, setPlayer2Wins] = useState(0);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setError("ওয়েবক্যাম অ্যাক্সেস করতে ব্যর্থ: " + (err as Error).message);
      }
    };
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/predict");
    socketRef.current = socket;

    socket.onopen = () => console.log("WebSocket সংযোগ সফল।");
    socket.onmessage = (event) => {
      const data: PredictionResponse = JSON.parse(event.data);
      setResult(data);
      if (data.error) {
        setError(data.error);
      } else {
        setError(null);
        if (data.winner && data.winner !== "Draw") {
          setRounds((prev) => [
            ...prev,
            {
              roundNumber: prev.length + 1,
              player1: data.player1,
              player2: data.player2,
              winner: data.winner,
            },
          ]);
          if (data.winner.includes("Player 1")) {
            setPlayer1Wins((p) => p + 1);
          } else if (data.winner.includes("Player 2")) {
            setPlayer2Wins((p) => p + 1);
          }
        }
      }
    };
    socket.onerror = (error) => {
      console.error("WebSocket ত্রুটি:", error);
      setError("WebSocket সংযোগে ত্রুটি।");
    };
    socket.onclose = () => console.log("WebSocket সংযোগ বন্ধ।");

    const sendImage = async () => {
      if (!videoRef.current || socketRef.current?.readyState !== WebSocket.OPEN)
        return;

      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              if (
                reader.result &&
                socketRef.current?.readyState === WebSocket.OPEN
              ) {
                socketRef.current.send(
                  JSON.stringify({ image: reader.result })
                );
              }
            };
            reader.readAsDataURL(blob);
          }
        }, "image/jpeg");
      }
    };

    const interval = setInterval(sendImage, 2000);
    return () => {
      clearInterval(interval);
      socketRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const draw = () => {
      if (!videoRef.current || !canvasRef.current || !result) return;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(videoRef.current, 0, 0);

      const drawBox = (
        box: number[] | undefined,
        color: string,
        label: string
      ) => {
        if (!box) return;
        const [x1, y1, x2, y2] = box;
        ctx.beginPath();
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();

        ctx.fillStyle = "yellow";
        ctx.fillRect(x1, y1 - 20, ctx.measureText(label).width + 10, 20);
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.fillText(label, x1 + 5, y1 - 5);
      };

      drawBox(result.left_box, "green", `Player 1: ${result.player1}`);
      drawBox(result.right_box, "red", `Player 2: ${result.player2}`);

      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }, [result]);

  const ultimateWinner =
    player1Wins > player2Wins
      ? "Player 1"
      : player2Wins > player1Wins
      ? "Player 2"
      : "Draw";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-6 text-black">
      <h1 className="text-4xl font-bold mb-6 text-center drop-shadow-lg text-white">
        Rock Paper Scissors
      </h1>

      <div className="border-2 border-white flex  justify-around mb-6 relative w-full">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full max-w-md rounded-lg shadow-lg"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full max-w-md rounded-lg"
        />
      </div>

      {error && (
        <div className="w-full flex justify-center ">
          <div className="bg-white w-min text-nowrap text-center p-5 rounded-md m-5">
            <p className="text-red-700 text-center text-4xl">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 text-center shadow-lg mb-6">
        <p className="text-lg">
          <strong>Ultimate Winner:</strong>{" "}
          <span className="text-2xl font-bold">{ultimateWinner}</span>
        </p>
        <p>
          🏆 Player 1 Wins: {player1Wins} | 🏆 Player 2 Wins: {player2Wins}
        </p>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {rounds.map((round) => (
            <motion.div
              key={round.roundNumber}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/20 backdrop-blur-md rounded-lg p-4 shadow-lg"
            >
              <p className="font-bold">Round {round.roundNumber}</p>
              <p>Player 1: {round.player1}</p>
              <p>Player 2: {round.player2}</p>
              <p className="font-bold">Winner: {round.winner}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
