const inputs = document.querySelectorAll('input');
const canvas = document.getElementById('frameCanvas');
const ctx = canvas.getContext('2d');

function calculateAndDraw() {
    // 1. Get values
    const F1 = parseFloat(document.getElementById('F1').value) || 0;
    const F2 = parseFloat(document.getElementById('F2').value) || 0;
    const alpha = parseFloat(document.getElementById('alpha').value) || 0;
    const q = parseFloat(document.getElementById('q').value) || 0;
    const M = parseFloat(document.getElementById('M').value) || 0;
    const l1 = parseFloat(document.getElementById('l1').value) || 0;
    const l2 = parseFloat(document.getElementById('l2').value) || 0;
    const h1 = parseFloat(document.getElementById('h1').value) || 0;
    const h2 = parseFloat(document.getElementById('h2').value) || 0;

    // 2. Calculations
    const alphaRad = alpha * Math.PI / 180;

    const Q1 = q * h1;
    const Q2 = q * h2;
    const F2x = F2 * Math.cos(alphaRad);
    const F2y = F2 * Math.sin(alphaRad);

    const XH = F2x;
    const RD = (F2y * 0.4 * l2) / l2; 
    const YH = F2y * 0.6;

    const RA = (Q1 * (h1 / 2) + M) / l1;
    const XE = -Q1;
    const YE = -RA;

    const XE_on_EBH = -XE;
    const YE_on_EBH = -YE;
    const XB = XH - XE_on_EBH - Q2 - F1;
    const YB = YH - YE_on_EBH;
    
    const MB = XE_on_EBH * h1 + YE_on_EBH * 2 * l1 + M + Q2 * (h1 + h2/2) + F1 * 0.8 * h1 - XH * (h1+h2);

    // 3. Update UI
    document.getElementById('res_RA').innerText = RA.toFixed(1);
    document.getElementById('res_XE').innerText = XE.toFixed(1);
    document.getElementById('res_YE').innerText = YE.toFixed(1);
    document.getElementById('res_XH').innerText = XH.toFixed(1);
    document.getElementById('res_YH').innerText = YH.toFixed(1);
    document.getElementById('res_RD').innerText = RD.toFixed(1);
    document.getElementById('res_XB').innerText = XB.toFixed(1);
    document.getElementById('res_YB').innerText = YB.toFixed(1);
    document.getElementById('res_MB').innerText = MB.toFixed(1);

    // 4. Draw Canvas
    drawFrame(l1, l2, h1, h2, F1, F2, alpha, q, M);
}

function drawFrame(l1, l2, h1, h2, F1, F2, alpha, q, M) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Scale and coordinate setup
    const PADDING = 60;
    const totalW = 3 * l1 + l2;
    const totalH = h1 + h2;
    
    // Calculate scale to fit within canvas
    const scaleX = (canvas.width - PADDING * 2) / Math.max(totalW, 1);
    const scaleY = (canvas.height - PADDING * 2) / Math.max(totalH, 1);
    const scale = Math.min(scaleX, scaleY);

    const originX = PADDING;
    const originY = canvas.height - PADDING;

    function getCoords(x, y) {
        return {
            cx: originX + x * scale,
            cy: originY - y * scale
        };
    }

    // Points
    const ptA = getCoords(0, 0);
    const ptE = getCoords(l1, h1);
    const ptMid = getCoords(2*l1, h1);
    const ptUp = getCoords(2*l1, h1+h2);
    const ptH = getCoords(3*l1, h1+h2);
    const ptD = getCoords(3*l1 + l2, h1+h2);
    const ptB = getCoords(3*l1, 0);

    // Styling
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Draw Ground / Supports
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    
    // Support A (roller)
    ctx.beginPath();
    ctx.arc(ptA.cx, ptA.cy + 10, 5, 0, Math.PI*2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ptA.cx - 15, ptA.cy + 15);
    ctx.lineTo(ptA.cx + 15, ptA.cy + 15);
    ctx.stroke();

    // Support B (fixed)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(ptB.cx - 15, ptB.cy, 30, 10);
    ctx.beginPath();
    for(let i=0; i<6; i++) {
        ctx.moveTo(ptB.cx - 15 + i*6, ptB.cy + 10);
        ctx.lineTo(ptB.cx - 20 + i*6, ptB.cy + 18);
    }
    ctx.stroke();

    // Support D (roller)
    ctx.beginPath();
    ctx.arc(ptD.cx, ptD.cy + 10, 5, 0, Math.PI*2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ptD.cx - 15, ptD.cy + 15);
    ctx.lineTo(ptD.cx + 15, ptD.cy + 15);
    ctx.stroke();

    // Draw Beams
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 8;
    ctx.beginPath();
    // Body AE
    ctx.moveTo(ptA.cx, ptA.cy);
    ctx.lineTo(ptA.cx, ptE.cy);
    ctx.lineTo(ptE.cx, ptE.cy);
    ctx.stroke();

    // Body EBH
    ctx.beginPath();
    ctx.moveTo(ptE.cx, ptE.cy);
    ctx.lineTo(ptMid.cx, ptMid.cy);
    ctx.lineTo(ptUp.cx, ptUp.cy);
    ctx.lineTo(ptH.cx, ptH.cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ptH.cx, ptH.cy);
    ctx.lineTo(ptB.cx, ptB.cy);
    ctx.stroke();

    // Body HD
    ctx.beginPath();
    ctx.moveTo(ptH.cx, ptH.cy);
    ctx.lineTo(ptD.cx, ptD.cy);
    ctx.stroke();

    // Draw Hinges
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    const drawHinge = (pt) => {
        ctx.beginPath();
        ctx.arc(pt.cx, pt.cy, 6, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
    };
    drawHinge(ptE);
    drawHinge(ptH);

    // Draw Forces
    const drawArrow = (fromX, fromY, toX, toY, color, label) => {
        const headlen = 10;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
        
        ctx.fillStyle = color;
        ctx.font = '14px Inter';
        ctx.fillText(label, fromX - 10, fromY - 10);
    };

    // F1
    const ptF1 = getCoords(3*l1, h1 * 0.8);
    drawArrow(ptF1.cx, ptF1.cy, ptF1.cx + 50, ptF1.cy, '#ef4444', 'F₁');

    // F2
    const ptF2_apply = getCoords(3*l1 + 0.4*l2, h1+h2); // 0.6*l2 from D, so 0.4*l2 from H
    const alphaRad = alpha * Math.PI / 180;
    const f2Len = 50;
    drawArrow(ptF2_apply.cx + f2Len*Math.cos(alphaRad), ptF2_apply.cy - f2Len*Math.sin(alphaRad), ptF2_apply.cx, ptF2_apply.cy, '#ef4444', 'F₂');

    // q (distributed load)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    const qX = ptA.cx - 30;
    ctx.beginPath();
    ctx.moveTo(qX, ptA.cy);
    ctx.lineTo(qX, ptUp.cy);
    ctx.stroke();
    
    // q arrows
    for(let i=0; i<=10; i++) {
        let y = ptA.cy - (ptA.cy - ptUp.cy) * (i/10);
        ctx.beginPath();
        ctx.moveTo(qX, y);
        ctx.lineTo(ptA.cx, y);
        // arrow head
        ctx.lineTo(ptA.cx - 5, y - 3);
        ctx.moveTo(ptA.cx, y);
        ctx.lineTo(ptA.cx - 5, y + 3);
        ctx.stroke();
    }
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('q', qX - 15, (ptA.cy + ptUp.cy)/2);

    // Moment M at E
    ctx.strokeStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(ptE.cx - 15, ptE.cy, 15, Math.PI/2, Math.PI*1.5);
    ctx.stroke();
    // arrow head for M
    ctx.beginPath();
    ctx.moveTo(ptE.cx - 15, ptE.cy - 15);
    ctx.lineTo(ptE.cx - 10, ptE.cy - 20);
    ctx.stroke();
    ctx.fillStyle = '#8b5cf6';
    ctx.fillText('M', ptE.cx - 25, ptE.cy - 20);
}

inputs.forEach(input => {
    input.addEventListener('input', calculateAndDraw);
});

// Initial draw
calculateAndDraw();
