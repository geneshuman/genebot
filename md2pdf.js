#!/usr/bin/env node
/**
 * md2pdf.js — Markdown to PDF via pdfkit (no browser required)
 * Usage: node md2pdf.js <input.md> <output.pdf>
 */

'use strict';

const fs  = require('fs');
const PDFDocument = require('/tmp/npm-work/node_modules/pdfkit');

const [,, inputFile, outputFile] = process.argv;
if (!inputFile || !outputFile) { console.error('Usage: node md2pdf.js <in.md> <out.pdf>'); process.exit(1); }

const markdown = fs.readFileSync(inputFile, 'utf8');

const MARGIN      = 50;
const PAGE_H      = 841.89; // A4
const PAGE_W      = 595.28;
const CONTENT_W   = PAGE_W - MARGIN * 2;
const BOTTOM      = PAGE_H - MARGIN;
const BODY_FS     = 10;
const CODE_FS     = 7;

const C = {
  h1:      '#1a1a2e',
  h2:      '#1a3a5c',
  h3:      '#2c5f8a',
  body:    '#1a1a1a',
  code_bg: '#f5f5f5',
  code_fg: '#2d2d2d',
  rule:    '#bbbbbb',
  bq:      '#555555',
  bq_bar:  '#999999',
  table_h: '#1a3a5c',
};

const doc = new PDFDocument({ margin: MARGIN, size: 'A4', autoFirstPage: true });
const out = fs.createWriteStream(outputFile);
doc.pipe(out);

// ── helpers ──────────────────────────────────────────────────────────────────

function curY() { return doc.y; }
function spaceLeft() { return BOTTOM - curY(); }

function needPage(needed) {
  if (spaceLeft() < needed) doc.addPage();
}

function gap(n = 4) { doc.y = curY() + n; }

function hRule() {
  needPage(8);
  gap(3);
  const y = curY();
  doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y)
     .strokeColor(C.rule).lineWidth(0.5).stroke();
  gap(3);
}

// Strip inline markdown
function strip(s) {
  return String(s)
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\\([\\`*_{}\[\]#+\-.!])/g, '$1');
}

// Emit a code block — wraps long lines with a continuation indent
function emitCodeBlock(rawLines) {
  if (rawLines.length === 0) return;

  const lineH    = CODE_FS * 1.4; // line height
  const padV     = 6;
  const codeX    = MARGIN + 6;
  const codeW    = CONTENT_W - 12;
  const wrapIndent = 16; // px indent for continuation lines

  gap(4);
  doc.font('Courier').fontSize(CODE_FS).fillColor(C.code_fg);
  let segStart = curY();

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i];

    if (raw.trim().length === 0) {
      // Blank line — just advance
      if (curY() + lineH + padV > BOTTOM) {
        doc.rect(MARGIN, segStart, CONTENT_W, curY() - segStart + padV)
           .strokeColor(C.rule).lineWidth(0.5).stroke();
        doc.addPage();
        gap(2);
        segStart = curY();
        doc.font('Courier').fontSize(CODE_FS).fillColor(C.code_fg);
      }
      doc.y = curY() + lineH;
      continue;
    }

    // Measure how tall this line will be when wrapped
    const lineTextH = doc.heightOfString(raw, { width: codeW });
    const needed    = lineTextH + padV;

    if (curY() + needed > BOTTOM) {
      doc.rect(MARGIN, segStart, CONTENT_W, curY() - segStart + padV)
         .strokeColor(C.rule).lineWidth(0.5).stroke();
      doc.addPage();
      gap(2);
      segStart = curY();
      doc.font('Courier').fontSize(CODE_FS).fillColor(C.code_fg);
    }

    doc.text(raw, codeX, curY(), {
      width:      codeW,
      lineBreak:  true,
      continued:  false,
      indent:     0,
    });
  }

  // Draw border for final segment
  doc.rect(MARGIN, segStart, CONTENT_W, curY() - segStart + padV)
     .strokeColor(C.rule).lineWidth(0.5).stroke();


  gap(padV + 2);
  doc.font('Helvetica').fontSize(BODY_FS).fillColor(C.body);
}

function emitParagraph(text, opts = {}) {
  const t = strip(text);
  if (!t.trim()) return;
  needPage(14);
  doc.font(opts.font || 'Helvetica')
     .fontSize(opts.size || BODY_FS)
     .fillColor(opts.color || C.body)
     .text(t, opts.x !== undefined ? opts.x : MARGIN, curY(), {
       width: opts.width !== undefined ? opts.width : CONTENT_W,
       lineBreak: true,
       align: opts.align || 'left',
     });
}

// ── table renderer ─────────────────────────────────────────────────────────────

function emitTable(tableLines) {
  const TABLE_FS  = 8.5;
  const TABLE_PAD = 6;  // horizontal padding per cell
  const ROW_PAD_V = 4;  // vertical padding per cell (top+bottom each)
  const MIN_COL_W = 40; // minimum column width

  // Parse rows (skip separator lines like |---|---|
  const rows = [];
  for (const tl of tableLines) {
    if (/^\|[\s\-:|]+\|/.test(tl)) continue;
    const cells = tl.split('|').slice(1, -1).map(c => strip(c.trim()));
    rows.push(cells);
  }
  if (rows.length === 0) return;

  const numCols = Math.max(...rows.map(r => r.length));
  if (numCols === 0) return;

  // Measure max natural content width per column (using pdfkit widthOfString)
  doc.font('Helvetica').fontSize(TABLE_FS);
  const maxNatural = new Array(numCols).fill(0);
  for (const row of rows) {
    for (let c = 0; c < numCols; c++) {
      const cell   = row[c] || '';
      // Sample first 80 chars to estimate natural width (avoids runaway long cells)
      const sample = cell.length > 80 ? cell.slice(0, 80) : cell;
      const w      = doc.widthOfString(sample) + TABLE_PAD * 2;
      if (w > maxNatural[c]) maxNatural[c] = w;
    }
  }

  // Distribute proportionally, guaranteeing MIN_COL_W each
  const totalNatural = maxNatural.reduce((a, b) => a + b, 0);
  let colWidths = maxNatural.map(w =>
    Math.max(MIN_COL_W, Math.round((w / totalNatural) * CONTENT_W))
  );

  // Clamp total to CONTENT_W (absorb rounding error in last col)
  let total = colWidths.reduce((a, b) => a + b, 0);
  if (total !== CONTENT_W) {
    colWidths[numCols - 1] = Math.max(MIN_COL_W, colWidths[numCols - 1] + CONTENT_W - total);
  }

  gap(3);

  for (let r = 0; r < rows.length; r++) {
    const row      = rows[r];
    const isHeader = r === 0;
    const font     = isHeader ? 'Helvetica-Bold' : 'Helvetica';
    const color    = isHeader ? C.table_h : C.body;
    const bgColor  = isHeader ? '#e8eff7' : (r % 2 === 1 ? '#f9f9f9' : '#ffffff');

    // First pass: compute row height (tallest cell)
    doc.font(font).fontSize(TABLE_FS);
    let rowH = 0;
    for (let c = 0; c < numCols; c++) {
      const cell  = row[c] || '';
      const cellW = colWidths[c] - TABLE_PAD * 2;
      const h     = doc.heightOfString(cell, { width: Math.max(cellW, 10) }) + ROW_PAD_V * 2;
      if (h > rowH) rowH = h;
    }
    rowH = Math.max(rowH, TABLE_FS + ROW_PAD_V * 2);

    // Page break if needed
    needPage(rowH + 2);
    const rowY = curY();

    // Draw background
    doc.rect(MARGIN, rowY, CONTENT_W, rowH).fillColor(bgColor).fill();

    // Draw cell text
    let xOff = MARGIN;
    doc.font(font).fontSize(TABLE_FS).fillColor(color);
    for (let c = 0; c < numCols; c++) {
      const cell  = row[c] || '';
      const cellW = colWidths[c] - TABLE_PAD * 2;
      doc.text(cell, xOff + TABLE_PAD, rowY + ROW_PAD_V, {
        width:     Math.max(cellW, 10),
        lineBreak: true,
        continued: false,
      });
      xOff += colWidths[c];
    }

    // Draw row border and column dividers
    doc.rect(MARGIN, rowY, CONTENT_W, rowH)
       .strokeColor(C.rule).lineWidth(0.3).stroke();
    xOff = MARGIN;
    for (let c = 0; c < numCols - 1; c++) {
      xOff += colWidths[c];
      doc.moveTo(xOff, rowY).lineTo(xOff, rowY + rowH)
         .strokeColor(C.rule).lineWidth(0.3).stroke();
    }

    doc.y = rowY + rowH;
  }

  gap(6);
  doc.font('Helvetica').fontSize(BODY_FS).fillColor(C.body);
}

// ── parser ───────────────────────────────────────────────────────────────────

const lines = markdown.split('\n');
let i = 0;

while (i < lines.length) {
  const raw = lines[i];

  // ── fenced code block (handles ``` and ```` and any longer fence) ──
  if (/^\s*(`{3,}|~{3,})/.test(raw)) {
    const fenceMatch = raw.match(/^\s*(`{3,}|~{3,})/);
    const fence = fenceMatch[1]; // e.g. "```" or "````"
    i++;
    const codeLines = [];
    // Close only on a fence of the same character and >= same length
    const closeRe = new RegExp('^\\s*' + fence[0] + '{' + fence.length + ',}\\s*$');
    while (i < lines.length && !closeRe.test(lines[i])) {
      codeLines.push(lines[i]);
      i++;
    }
    i++; // consume closing fence (safe even at EOF — just moves past end)
    emitCodeBlock(codeLines);
    continue;
  }

  // ── blank line ──
  if (raw.trim() === '') {
    gap(4);
    i++;
    continue;
  }

  // ── horizontal rule ──
  if (/^(\-{3,}|\*{3,}|={3,})\s*$/.test(raw.trim())) {
    hRule();
    i++;
    continue;
  }

  // ── headings ──
  let m;
  if ((m = raw.match(/^(#{1,4}) (.+)/))) {
    const level = m[1].length;
    const text  = strip(m[2]);
    const cfgs  = [
      { size: 18, color: C.h1, font: 'Helvetica-Bold', before: 8, after: 2, rule: true },
      { size: 14, color: C.h2, font: 'Helvetica-Bold', before: 8, after: 4, rule: false },
      { size: 11.5, color: C.h3, font: 'Helvetica-Bold', before: 6, after: 2, rule: false },
      { size: 10.5, color: C.h3, font: 'Helvetica-Bold', before: 4, after: 1, rule: false },
    ];
    const cfg = cfgs[Math.min(level - 1, 3)];
    needPage(cfg.size + 24);
    gap(cfg.before);
    if (cfg.rule) hRule();
    doc.font(cfg.font).fontSize(cfg.size).fillColor(cfg.color)
       .text(text, MARGIN, curY(), { width: CONTENT_W });
    if (cfg.rule) { gap(2); hRule(); }
    gap(cfg.after);
    doc.font('Helvetica').fontSize(BODY_FS).fillColor(C.body);
    i++;
    continue;
  }

  // ── blockquote (collect consecutive lines) ──
  if (raw.startsWith('> ')) {
    const bqLines = [];
    while (i < lines.length && lines[i].startsWith('> ')) {
      bqLines.push(lines[i].replace(/^> /, ''));
      i++;
    }
    const bqText = bqLines.join('\n');
    gap(3);
    const startY = curY();
    doc.font('Helvetica-Oblique').fontSize(9.5).fillColor(C.bq)
       .text(strip(bqText), MARGIN + 12, curY(), { width: CONTENT_W - 12 });
    const endY = curY();
    doc.rect(MARGIN, startY, 3, endY - startY + 2).fillColor(C.bq_bar).fill();
    doc.font('Helvetica').fontSize(BODY_FS).fillColor(C.body);
    gap(3);
    continue;
  }

  // ── table (collect all rows) ──
  if (raw.startsWith('|')) {
    const tableLines = [];
    while (i < lines.length && lines[i].startsWith('|')) {
      tableLines.push(lines[i]);
      i++;
    }
    emitTable(tableLines);
    continue;
  }

  // ── list item ──
  if ((m = raw.match(/^(\s*)([-*]|\d+\.) (.+)/))) {
    const depth  = Math.min(Math.floor(m[1].length / 2), 3);
    const isNum  = /\d+\./.test(m[2]);
    const marker = isNum ? m[2] + ' ' : '•  ';
    const text   = m[3];
    const xOff   = depth * 16;
    needPage(14);
    doc.font('Helvetica').fontSize(BODY_FS).fillColor(C.body)
       .text(marker + strip(text), MARGIN + xOff, curY(), {
         width: CONTENT_W - xOff,
       });
    i++;
    continue;
  }

  // ── paragraph ──
  needPage(14);
  emitParagraph(raw);
  i++;
}

doc.end();
out.on('finish', () => console.log(`Written: ${outputFile} (${Math.round(fs.statSync(outputFile).size/1024)}KB)`));
out.on('error', e => { console.error(e); process.exit(1); });
