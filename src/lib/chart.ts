// Ported line-for-line from the coastfire-calculator.html prototype's drawChart() function.
import { CoastResult, CoastInputs, FiResult, LongevityResult, fmtUSDShort } from "./coastfire";

export function drawChart(canvas: HTMLCanvasElement, result: CoastResult, vals: CoastInputs) {
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

  const series = result.coastPlan.length ? result.coastPlan : result.yearlyWithContributions;
  const allValues = result.yearlyWithContributions
    .map((p) => p.value)
    .concat(series.map((p) => p.value))
    .concat([result.retirementNumber]);
  const maxVal = Math.max(...allValues, 1) * 1.08;
  const minAge = vals.currentAge;
  const maxAge = vals.retireAge;
  const padL = 54,
    padR = 16,
    padT = 18,
    padB = 30;
  const w = cssWidth - padL - padR;
  const h = cssHeight - padT - padB;

  const xForAge = (age: number) => padL + ((age - minAge) / Math.max(maxAge - minAge, 0.0001)) * w;
  const yForVal = (val: number) => padT + h - (val / maxVal) * h;

  // gridlines
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
  const ty = yForVal(result.retirementNumber);
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "rgba(143,163,176,0.6)";
  ctx.beginPath();
  ctx.moveTo(padL, ty);
  ctx.lineTo(padL + w, ty);
  ctx.stroke();
  ctx.restore();

  function drawLine(points: { age: number; value: number }[], color: string, width: number) {
    if (!points.length) return;
    ctx!.strokeStyle = color;
    ctx!.lineWidth = width;
    ctx!.lineJoin = "round";
    ctx!.beginPath();
    points.forEach((p, i) => {
      const x = xForAge(p.age),
        y = yForVal(p.value);
      if (i === 0) ctx!.moveTo(x, y);
      else ctx!.lineTo(x, y);
    });
    ctx!.stroke();
  }

  drawLine(result.yearlyWithContributions, "#5b9aa8", 2.5);
  if (result.coastPlan.length) drawLine(result.coastPlan, "#e8a33d", 2.5);

  // coast marker (sun)
  if (result.coastAgeYears !== null && result.coastAgeYears <= maxAge) {
    const cx = xForAge(result.coastAgeYears);
    const matchPoint =
      result.coastPlan.find((p) => Math.abs(p.age - result.coastAgeYears!) < 0.6) ||
      result.coastPlan[0];
    const cy = matchPoint ? yForVal(matchPoint.value) : padT;
    ctx.save();
    ctx.strokeStyle = "rgba(232,163,61,0.5)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, padT);
    ctx.lineTo(cx, padT + h);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#e8a33d";
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // x axis labels
  ctx.fillStyle = "rgba(143,163,176,0.9)";
  ctx.font = "11px IBM Plex Mono, monospace";
  [minAge, Math.round((minAge + maxAge) / 2), maxAge].forEach((age) => {
    const x = xForAge(age);
    ctx.fillText("age " + Math.round(age), x - 18, cssHeight - 8);
  });
}

export function drawFireChart(canvas: HTMLCanvasElement, result: FiResult, currentAge: number) {
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

  const series = result.series;
  const maxVal = Math.max(...series.map((p) => p.value), result.retirementNumber, 1) * 1.08;
  const minAge = currentAge;
  const maxAge = series.length ? series[series.length - 1].age : currentAge;
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

  const ty = yForVal(result.retirementNumber);
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "rgba(143,163,176,0.6)";
  ctx.beginPath();
  ctx.moveTo(padL, ty);
  ctx.lineTo(padL + w, ty);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = "#e8a33d";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.beginPath();
  series.forEach((p, i) => {
    const x = xForAge(p.age),
      y = yForVal(p.value);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  if (result.fiAgeYears !== null) {
    const cx = xForAge(result.fiAgeYears);
    ctx.save();
    ctx.strokeStyle = "rgba(232,163,61,0.5)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, padT);
    ctx.lineTo(cx, padT + h);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#e8a33d";
    ctx.beginPath();
    ctx.arc(cx, yForVal(result.retirementNumber), 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(143,163,176,0.9)";
  ctx.font = "11px IBM Plex Mono, monospace";
  [minAge, Math.round((minAge + maxAge) / 2), maxAge].forEach((age) => {
    const x = xForAge(age);
    ctx.fillText("age " + Math.round(age), x - 18, cssHeight - 8);
  });
}

export function drawLongevityChart(canvas: HTMLCanvasElement, result: LongevityResult, currentAge: number) {
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

  const series = result.series;
  const maxVal = Math.max(...series.map((p) => p.value), 1) * 1.08;
  const minAge = currentAge;
  const maxAge = series.length ? series[series.length - 1].age : currentAge;
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

  ctx.strokeStyle = "#e8a33d";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.beginPath();
  series.forEach((p, i) => {
    const x = xForAge(p.age),
      y = yForVal(p.value);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  if (result.ageMoneyRunsOut !== null) {
    const cx = xForAge(result.ageMoneyRunsOut);
    ctx.save();
    ctx.strokeStyle = "rgba(232,163,61,0.5)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, padT);
    ctx.lineTo(cx, padT + h);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#e8a33d";
    ctx.beginPath();
    ctx.arc(cx, yForVal(0), 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(143,163,176,0.9)";
  ctx.font = "11px IBM Plex Mono, monospace";
  [minAge, Math.round((minAge + maxAge) / 2), maxAge].forEach((age) => {
    const x = xForAge(age);
    ctx.fillText("age " + Math.round(age), x - 18, cssHeight - 8);
  });
}
