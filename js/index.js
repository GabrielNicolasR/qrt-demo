// Heurística simples para demo — não substitui modelo real
const qrtNames = ['QRT‑Infra', 'QRT‑DB', 'QRT‑Negócio'];
function scoreFromText(title, desc) {
    const txt = (title + ' ' + desc).toLowerCase();
    return {
        infra: (txt.match(/timeout|gateway|integração|api|http|latency|latência|erro 504|502|timeout/) || []).length,
        db: (txt.match(/sql|query|select|insert|deadlock|db|database|inconsist|inconsistência|dados/) || []).length,
        negocio: (txt.match(/regra|calculo|faturamento|cobrança|negócio|regras|contrato|credito/) || []).length
    };
}

function analyze() {
    const title = document.getElementById('title').value || '';
    const desc = document.getElementById('desc').value || '';
    const c1 = document.getElementById('c1').checked;
    const c2 = document.getElementById('c2').checked;
    const c3 = document.getElementById('c3').checked;
    const c4 = document.getElementById('c4').checked;
    const c5 = document.getElementById('c5').checked;
    const c6 = document.getElementById('c6').checked;

    const t = scoreFromText(title, desc);
    // base scores from text
    let scores = { infra: 1 + t.infra * 2, db: 1 + t.db * 2, negocio: 1 + t.negocio * 2 };
    // checklist boosts
    if (c4) scores.infra += 3; // integração
    if (c1) scores.infra += 2; // produção
    if (c3) { scores.infra += 1; scores.db += 1 }
    if (c6) scores.db += 3; // dados inconsistentes
    if (c5) scores.negocio += 3; // regras negocio
    if (c2) { scores.infra += 1; scores.db += 1; scores.negocio += 1 }

    // product/impact small heuristic
    const prod = document.getElementById('product').value;
    const impact = document.getElementById('impact').value;
    if (prod === 'Billing') scores.negocio += 2;
    if (impact === 'Alto') { scores.infra += 1; scores.db += 1; scores.negocio += 1 }

    // normalize to percentages
    const arr = [scores.infra, scores.db, scores.negocio];
    const sum = arr.reduce((a, b) => a + b, 0);
    const pct = arr.map(x => Math.round((x / sum) * 100));

    // reasons top
    const reasons = [];
    if (t.infra) reasons.push("palavra-chave infra: " + (t.infra > 0 ? "detectada" : ""));

    document.getElementById('prediction').style.display = 'block';
    // sort top
    const items = [
        { name: 'QRT‑Infra', pct: pct[0], score: scores.infra },
        { name: 'QRT‑DB', pct: pct[1], score: scores.db },
        { name: 'QRT‑Negócio', pct: pct[2], score: scores.negocio }
    ].sort((a, b) => b.pct - a.pct);

    document.getElementById('topName').innerText = items[0].name;
    document.getElementById('topPct').innerText = items[0].pct + '%';
    document.getElementById('topBar').style.width = items[0].pct + '%';
    // build reasons
    const detected = [];
    if (c4) detected.push('integração');
    if (c1) detected.push('produção');
    if (c3) detected.push('logs/stacktrace');
    if (c5) detected.push('regras de negócio');
    if (c6) detected.push('dados inconsistentes');
    const words = (title + ' ' + desc).toLowerCase();
    const kw = [];
    if (words.match(/timeout|gateway/)) kw.push('timeout/gateway');
    if (words.match(/sql|query|database|inconsist/)) kw.push('query/inconsistência');
    if (words.match(/regra|faturamento|cobrança/)) kw.push('regras de negócio');

    const reasonText = (kw.concat(detected)).slice(0, 4).join(', ');
    document.getElementById('topReasons').innerText = 'motivos: ' + (reasonText || 'baseado em checklist e texto');

    // top3 list
    const top3div = document.getElementById('top3');
    top3div.innerHTML = '';
    items.forEach(it => {
        const row = document.createElement('div');
        row.className = 'qrt-row';
        row.innerHTML = `<div><strong>${it.name}</strong><div class="muted" style="font-size:13px">score: ${it.score}</div></div><div style="width:180px"><div class="bar"><div class="bar-fill" style="width:${it.pct}%"></div></div><div style="text-align:right;font-weight:700">${it.pct}%</div></div>`;
        top3div.appendChild(row);
    })

}

document.getElementById('analyze').addEventListener('click', analyze);
document.getElementById('reset').addEventListener('click', () => {
    document.getElementById('title').value = ''; document.getElementById('desc').value = '';['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].forEach(id => document.getElementById(id).checked = false); document.getElementById('product').selectedIndex = 0; document.getElementById('impact').selectedIndex = 0; document.getElementById('prediction').style.display = 'none';
});

function downloadHTML() {
    const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'MVP_QRT_Aderencia.html'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}