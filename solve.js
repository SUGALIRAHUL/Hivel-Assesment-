#!/usr/bin/env node
// solve.js
// Usage examples:
//   node solve.js input.json
//   node solve.js --file=input.json
//   node solve.js input.json --useAll
//   node solve.js input.json --sign=alt
//
// Output: prints the constant C (decimal) to stdout.

const fs = require('fs');
const path = require('path');

// --- arg parsing (simple) ---
const args = process.argv.slice(2);
let filename = 'input.json';
let useAll = false;
let signMode = 'default'; // 'default' or 'alt'

for (let a of args) {
      if (a.startsWith('--file=')) filename = a.split('=')[1];
        else if (a === '--useAll' || a === '--useall') useAll = true;
          else if (a.startsWith('--sign=')) signMode = a.split('=')[1];
            else if (!a.startsWith('--') && filename === 'input.json') filename = a;
              // ignore unknown flags silently
}

// --- helpers ---
function digitValue(ch) {
      if (ch >= '0' && ch <= '9') return ch.charCodeAt(0) - 48;
        const lower = ch.toLowerCase();
          if (lower >= 'a' && lower <= 'z') return lower.charCodeAt(0) - 97 + 10;
            throw new Error(`Invalid digit character '${ch}'`);
}
function parseBigIntFromBase(valueStr, base) {
      if (!Number.isInteger(base) || base < 2 || base > 36) {
            throw new Error(`Unsupported base: ${base}. Allowed: 2..36`);
      }
        let s = String(valueStr).trim();
          let sign = 1n;
            if (s.startsWith('-')) { sign = -1n; s = s.slice(1); }
              if (s.startsWith('+')) s = s.slice(1);
                if (s.length === 0) return 0n;
                  let res = 0n;
                    const b = BigInt(base);
                      for (let ch of s) {
                            const dv = digitValue(ch);
                                if (dv >= base) throw new Error(`Digit '${ch}' not valid for base ${base} in value '${valueStr}'`);
                                    res = res * b + BigInt(dv);
                      }
                        return res * sign;
}

function exitErr(msg) { console.error(msg); process.exit(1); }

// --- read file ---
const filePath = path.resolve(filename);
if (!fs.existsSync(filePath)) exitErr(`File not found: ${filePath}`);
let raw;
try { raw = fs.readFileSync(filePath, 'utf8'); }
catch (e) { exitErr(`Failed to read file: ${e.message}`); }

let obj;
try { obj = JSON.parse(raw); }
catch (e) { exitErr(`Invalid JSON: ${e.message}`); }

// --- validate keys ---
if (!obj.keys || typeof obj.keys !== 'object') exitErr('JSON must contain a "keys" object with n and k');
const n = Number(obj.keys.n);
const k = Number(obj.keys.k);
if (!Number.isInteger(n) || !Number.isInteger(k) || n <= 0 || k <= 0) exitErr('keys.n and keys.k must be positive integers');
if (n < k && !useAll) exitErr(`keys.n (${n}) < k (${k}). If you want to use all roots, pass --useAll`);

// collect entry keys (exclude 'keys'), sort numerically
const entryKeys = Object.keys(obj)
  .filter(x => x !== 'keys')
    .map(x => ({ raw: x, idx: Number.isFinite(Number(x)) ? Number(x) : Infinity }))
      .sort((a,b) => a.idx - b.idx)
        .map(e => e.raw);

        const needed = useAll ? entryKeys.length : k;
        if (entryKeys.length < needed) exitErr(`Found ${entryKeys.length} root entries but need ${needed}`);

        // choose keys
        const chosen = entryKeys.slice(0, needed);

        // decode roots
        let roots = [];
        try {
              for (const key of chosen) {
                    const entry = obj[key];
                        if (!entry || typeof entry !== 'object') throw new Error(`Entry ${key} missing or invalid`);
                            if (!('base' in entry) || !('value' in entry)) throw new Error(`Entry ${key} must have "base" and "value"`);
                                const base = Number(entry.base);
                                    const val = String(entry.value);
                                        const big = parseBigIntFromBase(val, base);
                                            roots.push({ key, base, val, big });
              }
        } catch (e) { exitErr(`Decode error: ${e.message}`); }

        // product
        let product = 1n;
        for (const r of roots) product *= r.big;

        // sign selection
        let sign = 1n;
        if (signMode === 'alt') {
              // (-1)^k
                sign = ( ( (useAll ? entryKeys.length : k) % 2 === 0) ? 1n : -1n );
        } else {
              // default: (-1)^(m) where m = k-1 (or if useAll, treat m = #entries - 1)
                const m = (useAll ? (entryKeys.length - 1) : (k - 1));
                  sign = (m % 2 === 0) ? 1n : -1n;
        }

        const C = product * sign;
        console.log(C.toString());
        }
        }
              }
        }
                      }
      }
}
}
}