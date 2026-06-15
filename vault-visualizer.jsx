import { useState, useRef, useEffect } from "react";

// Bill physical dimensions (in mm)
const CURRENCIES = {
  USD_100: {
    label: "USD $100",
    flag: "🇺🇸",
    symbol: "$",
    denomination: 100,
    thickness: 0.1,      // mm
    width: 156.1,
    height: 66.3,
    color: "#85bb65",
    darkColor: "#5a8a3a",
    lineColor: "#3d6b25",
    name: "USD",
  },
  AUD_100: {
    label: "AUD $100",
    flag: "🇦🇺",
    symbol: "A$",
    denomination: 100,
    thickness: 0.1,
    width: 158,
    height: 65,
    color: "#f4c842",
    darkColor: "#c89a1a",
    lineColor: "#8a6a10",
    name: "AUD",
  },
  AUD_50: {
    label: "AUD $50",
    flag: "🇦🇺",
    symbol: "A$",
    denomination: 50,
    thickness: 0.1,
    width: 151,
    height: 65,
    color: "#f4a236",
    darkColor: "#c07020",
    lineColor: "#855010",
    name: "AUD",
  },
  INR_500: {
    label: "₹500 Note",
    flag: "🇮🇳",
    symbol: "₹",
    denomination: 500,
    thickness: 0.11,
    width: 150,
    height: 66,
    color: "#a8d5a2",
    darkColor: "#6aaa64",
    lineColor: "#3a7a34",
    name: "INR",
  },
  INR_2000: {
    label: "₹2000 Note",
    flag: "🇮🇳",
    symbol: "₹",
    denomination: 2000,
    thickness: 0.11,
    width: 166,
    height: 66,
    color: "#f4a0c8",
    darkColor: "#c06090",
    lineColor: "#903060",
    name: "INR",
  },
  GBP_50: {
    label: "GBP £50",
    flag: "🇬🇧",
    symbol: "£",
    denomination: 50,
    thickness: 0.1,
    width: 146,
    height: 77,
    color: "#d4004c",
    darkColor: "#900030",
    lineColor: "#600020",
    name: "GBP",
  },
  EUR_100: {
    label: "EUR €100",
    flag: "🇪🇺",
    symbol: "€",
    denomination: 100,
    thickness: 0.1,
    width: 147,
    height: 82,
    color: "#6b9fd4",
    darkColor: "#3a6fa4",
    lineColor: "#1a4a7a",
    name: "EUR",
  },
};

const ROOM_HEIGHT_MM = 2400; // 2.4m room
const PERSON_HEIGHT_MM = 1750; // 1.75m human
const MAX_STACK_MM = 2000; // 2m max stack

// Canvas dimensions
const CANVAS_W = 700;
const CANVAS_H = 420;

function formatNumber(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

function drawPerson(ctx, x, baseY, scale) {
  const h = PERSON_HEIGHT_MM * scale;
  const headR = h * 0.07;
  const bodyTop = baseY - h + headR * 2;
  const bodyBot = baseY - h * 0.38;
  const shoulderW = headR * 1.5;

  ctx.save();
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.beginPath();
  ctx.ellipse(x, baseY, shoulderW * 1.2, headR * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.strokeStyle = "#4a3728";
  ctx.lineWidth = headR * 0.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - shoulderW * 0.3, bodyBot);
  ctx.lineTo(x - shoulderW * 0.5, baseY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + shoulderW * 0.3, bodyBot);
  ctx.lineTo(x + shoulderW * 0.5, baseY);
  ctx.stroke();

  // Body
  ctx.fillStyle = "#5b7fa6";
  ctx.beginPath();
  ctx.roundRect(x - shoulderW, bodyTop, shoulderW * 2, bodyBot - bodyTop, headR * 0.3);
  ctx.fill();

  // Arms
  ctx.strokeStyle = "#5b7fa6";
  ctx.lineWidth = headR * 0.7;
  ctx.beginPath();
  ctx.moveTo(x - shoulderW, bodyTop + (bodyBot - bodyTop) * 0.2);
  ctx.lineTo(x - shoulderW * 1.6, bodyTop + (bodyBot - bodyTop) * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + shoulderW, bodyTop + (bodyBot - bodyTop) * 0.2);
  ctx.lineTo(x + shoulderW * 1.6, bodyTop + (bodyBot - bodyTop) * 0.7);
  ctx.stroke();

  // Head
  ctx.fillStyle = "#e8c99a";
  ctx.beginPath();
  ctx.arc(x, bodyTop - headR * 0.3, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c8a97a";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Hair
  ctx.fillStyle = "#3d2b1a";
  ctx.beginPath();
  ctx.arc(x, bodyTop - headR * 0.3, headR, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBillStack(ctx, x, baseY, stackHeightMM, billWidthMM, currency, scale) {
  const stackPx = stackHeightMM * scale;
  const billWPx = billWidthMM * scale;
  const stackX = x - billWPx / 2;
  const stackTop = baseY - stackPx;

  if (stackPx < 1) return;

  // Draw layered bills effect
  const numLayers = Math.min(30, Math.max(3, Math.floor(stackPx / 3)));
  const layerH = stackPx / numLayers;

  for (let i = numLayers - 1; i >= 0; i--) {
    const y = stackTop + i * layerH;
    const isTop = i === 0;

    // Bill body
    ctx.fillStyle = isTop ? currency.color : currency.darkColor;
    ctx.fillRect(stackX, y, billWPx, layerH + 1);

    // Bill lines (only on visible ones)
    if (isTop || i % 3 === 0) {
      ctx.strokeStyle = currency.lineColor;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(stackX + billWPx * 0.15, y + layerH * 0.3);
      ctx.lineTo(stackX + billWPx * 0.85, y + layerH * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(stackX + billWPx * 0.15, y + layerH * 0.7);
      ctx.lineTo(stackX + billWPx * 0.85, y + layerH * 0.7);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Edge line between bills
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(stackX, y);
    ctx.lineTo(stackX + billWPx, y);
    ctx.stroke();
  }

  // Stack border
  ctx.strokeStyle = currency.darkColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(stackX, stackTop, billWPx, stackPx);

  // Shadow under stack
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.beginPath();
  ctx.ellipse(x, baseY + 2, billWPx * 0.55, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoom(ctx, baseY, scale) {
  const floorY = baseY;
  const ceilY = baseY - ROOM_HEIGHT_MM * scale;

  // Gradient background
  const grad = ctx.createLinearGradient(0, ceilY, 0, floorY);
  grad.addColorStop(0, "#f0ece4");
  grad.addColorStop(1, "#e8e0d4");
  ctx.fillStyle = grad;
  ctx.fillRect(0, ceilY, CANVAS_W, floorY - ceilY);

  // Floor
  ctx.fillStyle = "#c4b89a";
  ctx.fillRect(0, floorY, CANVAS_W, CANVAS_H - floorY);

  // Floor highlight
  ctx.fillStyle = "#d4c8aa";
  ctx.fillRect(0, floorY, CANVAS_W, 3);

  // Ceiling line
  ctx.strokeStyle = "#b8b0a0";
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(0, ceilY);
  ctx.lineTo(CANVAS_W, ceilY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Wall texture lines
  ctx.strokeStyle = "rgba(0,0,0,0.04)";
  ctx.lineWidth = 1;
  for (let y = ceilY + 40; y < floorY; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_W, y);
    ctx.stroke();
  }
}

function drawHeightLabel(ctx, x, stackTop, baseY, stackMM, scale) {
  if (stackMM < 1) return;
  const px = stackTop;
  const label = stackMM >= 1000
    ? (stackMM / 1000).toFixed(2) + " m"
    : stackMM.toFixed(0) + " mm";

  ctx.save();
  // Arrow line
  ctx.strokeStyle = "#e74c3c";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(x + 10, baseY);
  ctx.lineTo(x + 10, px);
  ctx.stroke();
  ctx.setLineDash([]);

  // Arrowheads
  ctx.fillStyle = "#e74c3c";
  ctx.beginPath();
  ctx.moveTo(x + 10, baseY - 2);
  ctx.lineTo(x + 6, baseY - 10);
  ctx.lineTo(x + 14, baseY - 10);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 10, px + 2);
  ctx.lineTo(x + 6, px + 10);
  ctx.lineTo(x + 14, px + 10);
  ctx.fill();

  // Label
  ctx.fillStyle = "#e74c3c";
  ctx.font = "bold 11px 'SF Mono', 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText(label, x + 16, (baseY + px) / 2 + 4);
  ctx.restore();
}

export default function VaultVisualizer() {
  const [amount, setAmount] = useState("1000000");
  const [currencyKey, setCurrencyKey] = useState("USD_100");
  const [inputVal, setInputVal] = useState("1,000,000");
  const canvasRef = useRef(null);

  const currency = CURRENCIES[currencyKey];
  const numericAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const numBills = numericAmount / currency.denomination;
  const rawStackMM = numBills * currency.thickness;
  const stackMM = Math.min(rawStackMM, MAX_STACK_MM);
  const isCapped = rawStackMM > MAX_STACK_MM;
  const cappedAt = isCapped ? MAX_STACK_MM : null;
  const actualStackMM = rawStackMM;
  const scale = CANVAS_H / (ROOM_HEIGHT_MM * 1.05); // fit room in canvas

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const baseY = CANVAS_H - 20; // floor position

    // Draw room
    drawRoom(ctx, baseY, scale);

    // Positions
    const personX = CANVAS_W * 0.72;
    const stackX = CANVAS_W * 0.35;

    // Draw stack
    const stackPx = stackMM * scale;
    drawBillStack(ctx, stackX, baseY, stackMM, currency.width, currency, scale);

    // Height label
    if (stackPx > 10) {
      drawHeightLabel(ctx, stackX + currency.width * scale * 0.5 + 5, baseY - stackPx, baseY, stackMM, scale);
    }

    // Person
    drawPerson(ctx, personX, baseY, scale);

    // Person height label
    const personH = PERSON_HEIGHT_MM * scale;
    ctx.save();
    ctx.fillStyle = "#7f8c8d";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("1.75m", personX, baseY - personH - 6);
    ctx.restore();

    // Ceiling label
    ctx.save();
    ctx.fillStyle = "#999";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("ceiling (2.4m)", CANVAS_W - 8, baseY - ROOM_HEIGHT_MM * scale + 13);
    ctx.restore();

    // 2m cap line
    const capY = baseY - MAX_STACK_MM * scale;
    ctx.save();
    ctx.strokeStyle = "rgba(231,76,60,0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, capY);
    ctx.lineTo(CANVAS_W, capY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(231,76,60,0.5)";
    ctx.font = "9px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("2m cap", 6, capY - 3);
    ctx.restore();

  }, [stackMM, currencyKey, scale]);

  function handleAmountChange(e) {
    const raw = e.target.value.replace(/,/g, "");
    if (/^\d*$/.test(raw)) {
      setAmount(raw);
      setInputVal(raw ? parseInt(raw).toLocaleString() : "");
    }
  }

  const stackM = (actualStackMM / 1000).toFixed(2);
  const stackCm = (actualStackMM / 10).toFixed(1);

  return (
    <div style={{
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      color: "#fff",
    }}>
      {/* Title */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>
          🏦 The Vault Visualizer
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
          How much physical space does your money take?
        </div>
      </div>

      {/* Controls */}
      <div style={{
        background: "rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "16px 20px",
        marginBottom: 16,
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
      }}>
        {/* Currency selector */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Currency / Note</div>
          <select
            value={currencyKey}
            onChange={e => setCurrencyKey(e.target.value)}
            style={{
              background: "#0f3460",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 14,
              cursor: "pointer",
              outline: "none",
            }}
          >
            {Object.entries(CURRENCIES).map(([key, c]) => (
              <option key={key} value={key}>{c.flag} {c.label}</option>
            ))}
          </select>
        </div>

        {/* Amount input */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Amount ({currency.name})</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: currency.color }}>{currency.symbol}</span>
            <input
              type="text"
              value={inputVal}
              onChange={handleAmountChange}
              placeholder="1,000,000"
              style={{
                background: "#0f3460",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 14,
                width: 150,
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Quick amounts */}
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Quick Pick</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[10000, 100000, 1000000, 10000000, 1000000000].map(v => (
              <button
                key={v}
                onClick={() => { setAmount(String(v)); setInputVal(v.toLocaleString()); }}
                style={{
                  background: amount === String(v) ? currency.color : "rgba(255,255,255,0.08)",
                  color: amount === String(v) ? "#000" : "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                {formatNumber(v)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div style={{
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} />
      </div>

      {/* Stats */}
      <div style={{
        marginTop: 16,
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        {[
          { label: "# of Notes", val: formatNumber(Math.round(numBills)) },
          { label: "Stack Height", val: actualStackMM >= 1000 ? `${stackM}m` : `${stackCm}cm` },
          { label: "Bill Value", val: `${currency.symbol}${currency.denomination}` },
          { label: "Shown At", val: isCapped ? `2m (capped)` : `${stackM}m` },
        ].map(s => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "10px 16px",
            textAlign: "center",
            minWidth: 100,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: currency.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {isCapped && (
        <div style={{
          marginTop: 12,
          background: "rgba(231,76,60,0.15)",
          border: "1px solid rgba(231,76,60,0.3)",
          borderRadius: 10,
          padding: "10px 16px",
          fontSize: 13,
          color: "#ff8a80",
          textAlign: "center",
          maxWidth: 500,
        }}>
          ⚠️ Stack would actually be <strong>{(rawStackMM / 1000).toFixed(1)}m tall</strong> — capped at 2m for this room. That's {(rawStackMM / 1000 / 8848).toFixed(4)}× the height of Mt. Everest!
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 11, color: "#475569", textAlign: "center" }}>
        Based on real note dimensions · Stack shown to scale in a 2.4m room
      </div>
    </div>
  );
}
