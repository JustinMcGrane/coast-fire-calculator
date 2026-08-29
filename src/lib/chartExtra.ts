import { fmtUSDShort } from "./coastfire";
import { PercentileBandPoint } from "./montecarlo";

interface ActualPoint {
  age: number;
  value: number;
}

// Actual-vs-projected chart for the net worth tracker (premium).
export function drawActualVsProjected(
  canvas: HTMLCanvasElement,
  projected: { age: number; value: number }[],
  actual: ActualPoint[],
  minAge: number,
  maxAge: number
) {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 600;
  const cssHeight = 260;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.height = cssHeight + "px";
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const allValues = projected.map((p) => p.value).concat(actual.map((p) => p.value));
  const maxVal = Math.max(...allValues, 1) * 1.08;
  const padL = 54,
    padR = 16,
    padT = 18,
    padB = 30;
  const w = cssWidth - padL - padR;
  const h = cssHeight - padT - padB;

  const xForAge = (age: number) => padL + ((age - minAge) / Math.max(maxAge - minAge, 0.0001)) * w;
  const yForVal = (val: number) => padT + h - (val / maxVal) * h;

  ctx.strokeStyle = "rgba(242,239,231,0.08)";
  ctx.lineWidth = 1;
  ctx.font = "11px IBM Plex Mono, monospace";
  ctx.fillStyle = "rgba(143,163,176,0.9)";
  for (let i = 0; i <= 3; i++) {
    const val = (maxVal * i) / 3;
    const y = yForVal(val);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + w, y);
    ctx.stroke();
    ctx.fillText(fmtUSDShort(val), 4, y + 4);
  }

  // projected line (dashed teal)
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "#5b9aa8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  projected.forEach((p, i) => {
    const x = xForAge(p.age),
      y = yForVal(p.value);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();

  // actual points + connecting solid gold line
  if (actual.length) {
    ctx.strokeStyle = "#e8a33d";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    actual.forEach((p, i) => {
      const x = xForAge(p.age),
        y = yForVal(p.value);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = "#e8a33d";
    actual.forEach((p) => {
      const x = xForAge(p.age),
        y = yForVal(p.value);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.fillStyle = "rgba(143,163,176,0.9)";
  ctx.font = "11px IBM Plex Mono, monospace";
  [minAge, Math.round((minAge + maxAge) / 2), maxAge].forEach((age) => {
    const x = xForAge(age);
    ctx.fillText("age " + Math.round(age), x - 18, cssHeight - 8);
  });
}

// Percentile-band chart for the Monte Carlo simulation (premium).
export function drawMonteCarloBand(
  canvas: HTMLCanvasElement,
  band: PercentileBandPoint[],
  retirementNumber: number
) {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 600;
  const cssHeight = 280;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.height = cssHeight + "px";
  const ctx = canvas.getContext("2d");
  if (!ctx || !band.length) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const minAge = band[0].age;
  const maxAge = band[band.length - 1].age;
  const maxVal = Math.max(...band.map((b) => b.p90), retirementNumber, 1) * 1.08;
  const padL = 58,
    padR = 16,
    padT = 18,
    padB = 30;
  const w = cssWidth - padL - padR;
  const h = cssHeight - padT - padB;

  const xForAge = (age: number) => padL + ((age - minAge) / Math.max(maxAge - minAge, 0.0001)) * w;
  const yForVal = (val: number) => padT + h - (val / maxVal) * h;

  ctx.strokeStyle = "rgba(242,239,231,0.08)";
  ctx.lineWidth = 1;
  ctx.font = "11px IBM Plex Mono, monospace";
  ctx.fillStyle = "rgba(143,163,176,0.9)";
  for (let i = 0; i <= 3; i++) {
    const val = (maxVal * i) / 3;
    const y = yForVal(val);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + w, y);
    ctx.stroke();
    ctx.fillText(fmtUSDShort(val), 4, y + 4);
  }

  // target line
  const ty = yForVal(retirementNumber);
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "rgba(143,163,176,0.6)";
  ctx.beginPath();
  ctx.moveTo(padL, ty);
  ctx.lineTo(padL + w, ty);
  ctx.stroke();
  ctx.restore();

  // p10-p90 band
  ctx.fillStyle = "rgba(232,163,61,0.18)";
  ctx.beginPath();
  band.forEach((p, i) => {
    const x = xForAge(p.age),
      y = yForVal(p.p90);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  for (let i = band.length - 1; i >= 0; i--) {
    const x = xForAge(band[i].age),
      y = yForVal(band[i].p10);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  function drawLine(key: "p10" | "p50" | "p90", color: string, width: number, dash: number[] = []) {
    ctx!.save();
    ctx!.setLineDash(dash);
    ctx!.strokeStyle = color;
    ctx!.lineWidth = width;
    ctx!.beginPath();
    band.forEach((p, i) => {
      const x = xForAge(p.age),
        y = yForVal(p[key]);
      if (i === 0) ctx!.moveTo(x, y);
      else ctx!.lineTo(x, y);
    });
    ctx!.stroke();
    ctx!.restore();
  }

  drawLine("p90", "rgba(232,163,61,0.6)", 1.5, [3, 3]);
  drawLine("p10", "rgba(232,163,61,0.6)", 1.5, [3, 3]);
  drawLine("p50", "#e8a33d", 2.5);

  ctx.fillStyle = "rgba(143,163,176,0.9)";
  ctx.font = "11px IBM Plex Mono, monospace";
  [minAge, Math.round((minAge + maxAge) / 2), maxAge].forEach((age) => {
    const x = xForAge(age);
    ctx.fillText("age " + Math.round(age), x - 18, cssHeight - 8);
  });
}
