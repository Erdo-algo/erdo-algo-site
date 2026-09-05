const root = document.documentElement;
const chart = document.getElementById('console-chart');
const chartSvg = chart.querySelector('svg');
const responsePath = document.getElementById('response-path');
const areaPath = document.getElementById('area-path');
const rawPath = document.getElementById('raw-path');
const gapPath = document.getElementById('gap-path');
const probe = document.getElementById('chart-probe');
const tooltip = document.getElementById('chart-tooltip');
const riskInput = document.getElementById('risk-input');
const riskOutput = document.getElementById('risk-output');
const coverageValue = document.getElementById('coverage-value');
const loadValue = document.getElementById('load-value');
const breakValue = document.getElementById('break-value');
const spreadValue = document.getElementById('spread-value');
const rerunButton = document.getElementById('rerun-button');
const languageSwitch = document.getElementById('language-switch');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let activeRegime = 'trend';
let activeLanguage = 'en';
let chartPoints = [];

const STEPS = 18;
const START_LEVEL = 22;
const WAVE = [0, .5, -.4, .9, -.2, 1.1, -.8, .6, -1, .8, -.3, 1.2, -.7, .5, -1.1, .9, -.4, .7];

const scenarios = {
  trend: {
    drift: 3.5,
    wave: 3.2,
    shock: [0, 0, .3, .8, .6, 1.6, 1.1, 2.4, 1.9, 3.4, 2.7, 4.4, 3.6, 5.4, 4.5, 6.5, 5.6, 7.4],
    coverage: '3 / 3',
    breakPoint: { en: 'SLIPPAGE', tr: 'KAYMA' }
  },
  range: {
    drift: 1.7,
    wave: 6.4,
    shock: [0, .4, 1, .7, 1.8, 1.3, 2.6, 2, 3.5, 2.8, 4.4, 3.6, 5.4, 4.4, 6.4, 5.3, 7.4, 8.2],
    coverage: '4 / 4',
    breakPoint: { en: 'WHIPSAW', tr: 'TESTERE' }
  },
  chaos: {
    drift: 2.4,
    wave: 8.6,
    shock: [0, .8, 2.2, 1.6, 3.6, 2.8, 5.2, 4.1, 6.8, 5.4, 8.4, 7, 10, 8.4, 11.6, 9.8, 13.2, 12],
    coverage: '5 / 5',
    breakPoint: { en: 'GAP RISK', tr: 'GAP RİSKİ' }
  }
};

const clampLevel = value => Math.max(3, Math.min(97, value));
const levelToY = level => 336 - level * 2.9;

function buildSeries(scenario, pressure) {
  const p = pressure / 100;
  const guarded = [];
  const raw = [];
  for (let index = 0; index < STEPS; index += 1) {
    const base = START_LEVEL + scenario.drift * index;
    const wave = WAVE[index] * scenario.wave;
    guarded.push(clampLevel(base + wave * (.55 + p * .45) - scenario.shock[index] * p * .55));
    raw.push(clampLevel(base + wave * (.8 + p * 1.5) - scenario.shock[index] * (.2 + p * 5.9)));
  }
  return { guarded, raw };
}

const copy = {
  en: {
    navLab: 'Stress Lab', navCase: 'Evidence', navProcess: 'Process', navContact: 'Profile ↓',
    eyebrow: 'EA / PINE CLINIC · ISTANBUL',
    heroTitle: 'Break the strategy|[[before]] coding it.',
    heroLead: 'A good-looking backtest is not the finish line. I turn trading rules into testable systems, push them through hostile scenarios, and show what the evidence does — and does not — support.',
    heroCta: 'Enter the stress lab ↓', heroNote: 'No signals. No profit promises. Inspectable engineering.',
    machineTitle: 'ROBUSTNESS FIELD / DEMO', liveState: 'interactive', machineCaption: 'Move your pointer. The field reacts; the evidence stays still.',
    orbitCore: 'RULES', orbitCost: 'COST', orbitRepaint: 'REPAINT', orbitGap: 'GAP',
    labTitle: 'Change the conditions.|Watch the weak point move.', labIntro: 'Two versions of the same idea under one pressure: with the break map applied, and without it. A synthetic explainer, not market data.',
    demoStamp: 'SYNTHETIC EXPLAINER — NOT PERFORMANCE', coverageLabel: 'checks exposed', loadLabel: 'risk load', breakLabel: 'first break',
    spreadLabel: 'control gap', points: 'pts', legendGuarded: 'break map applied', legendRaw: 'no break map',
    indexLab: '01 / STRESS LAB', indexCase: '02 / REAL CASE', indexMethod: '03 / METHOD', indexProfile: '04 / PROFILE',
    regimeLegend: 'Market regime', trend: 'Trend', range: 'Range', chaos: 'Chaos', riskLabel: 'Assumption pressure', rerun: 'Run the stress pass ↻',
    caseIntro: 'A public, free MQL5 Expert Advisor used here as a proof-boundary example.', published: 'PUBLIC / FREE',
    provesLabel: 'WHAT IT SUPPORTS', provesCopy: 'This sheet is live on the public MQL5 Market product page; the panel inside it is an archived capture of the real interface (v4.01, USDJPY.5R M15 local test); the project records local compile and nonvisual tester checks.',
    figLabel: 'FIG. 01 / MARKET SHEET',
    notProvesLabel: 'WHAT IT DOES NOT PROVE', notProvesCopy: 'Profitability, live-account safety, broker independence, or prop-firm eligibility.', marketCta: 'Inspect the public product ↗',
    processTitle: 'One chain.|Three honest checkpoints.', processIntro: 'Open a checkpoint to see what changes hands before the next stage begins.',
    processRule: 'Rule contract', processRuleCopy: 'Entry, exit, bar state, timing, data source, and risk rules become one testable manifest before implementation.',
    processBreak: 'Break map', processBreakCopy: 'Costs, gaps, restart behavior, repaint risk, and regime changes are isolated instead of blended into one flattering result.',
    processProof: 'Evidence package', processProofCopy: 'Screens, settings, versions, source links, and explicit evidence limits travel together.',
    contactTitle: 'A working portfolio.|[[Not a sales funnel.]]', contactCopy: 'This site collects the MQL5 products, Pine experiments, test notes, and evidence packages I can publish.', contactMql5: 'MQL5 profile ↗', contactMail: 'Send an email ↗', futureNote: 'Next public layer: an MQL5 Signal account, after its evidence boundary is ready.',
    footerDisclaimer: 'Engineering portfolio. No investment advice or return guarantee.', normal: 'NORMAL', elevated: 'ELEVATED', severe: 'SEVERE', stable: 'STABLE', stressed: 'STRESSED'
  },
  tr: {
    navLab: 'Stres Alanı', navCase: 'Kanıt', navProcess: 'Süreç', navContact: 'Profil ↓',
    eyebrow: 'EA / PINE KLİNİĞİ · İSTANBUL',
    heroTitle: 'Stratejiyi kodlamadan|[[önce]] kır.',
    heroLead: 'Güzel görünen backtest bitiş çizgisi değildir. Trading kurallarını test edilebilir sistemlere çevirir, kötü senaryolarda zorlar ve kanıtın neyi destekleyip neyi desteklemediğini birlikte gösteririm.',
    heroCta: 'Stres alanına gir ↓', heroNote: 'Sinyal yok. Kâr vaadi yok. İncelenebilir mühendislik.',
    machineTitle: 'DAYANIKLILIK ALANI / DEMO', liveState: 'etkileşimli', machineCaption: 'İmleci hareket ettir. Alan tepki verir; kanıt yerinde kalır.',
    orbitCore: 'KURALLAR', orbitCost: 'MALİYET', orbitRepaint: 'REPAINT', orbitGap: 'GAP',
    labTitle: 'Koşulları değiştir.|Zayıf noktanın yerini izle.', labIntro: 'Aynı fikrin iki sürümü aynı baskı altında: kırılma haritası çıkarılmış olan ve çıkarılmamış olan. Sentetik bir anlatım, piyasa verisi değil.',
    demoStamp: 'SENTETİK ANLATICI — PERFORMANS DEĞİLDİR', coverageLabel: 'görünen kontroller', loadLabel: 'risk yükü', breakLabel: 'ilk kırılma',
    spreadLabel: 'kontrol farkı', points: 'puan', legendGuarded: 'kırılma haritası var', legendRaw: 'kırılma haritası yok',
    indexLab: '01 / STRES ALANI', indexCase: '02 / GERÇEK VAKA', indexMethod: '03 / YÖNTEM', indexProfile: '04 / PROFİL',
    regimeLegend: 'Piyasa rejimi', trend: 'Trend', range: 'Yatay', chaos: 'Kaos', riskLabel: 'Varsayım baskısı', rerun: 'Stres turunu çalıştır ↻',
    caseIntro: 'Kanıt sınırını göstermek için kullanılan, herkese açık ve ücretsiz bir MQL5 Expert Advisor.', published: 'YAYINDA / ÜCRETSİZ',
    provesLabel: 'NEYİ DESTEKLİYOR', provesCopy: 'Bu sunum görseli herkese açık MQL5 Market ürün sayfasında yayında; içindeki panel gerçek arayüzün arşiv karesidir (v4.01, USDJPY.5R M15 yerel test); proje kayıtlarında yerel derleme ve görselsiz tester kontrolleri belgelenmiştir.',
    figLabel: 'GÖRSEL 01 / MARKET SUNUMU',
    notProvesLabel: 'NEYİ KANITLAMIYOR', notProvesCopy: 'Kârlılık, canlı hesap güvenliği, broker bağımsızlığı veya prop firma uygunluğu.', marketCta: 'Herkese açık ürünü incele ↗',
    processTitle: 'Tek zincir.|Üç dürüst kontrol noktası.', processIntro: 'Sonraki aşamaya geçmeden önce neyin el değiştirdiğini görmek için bir kontrol noktasını aç.',
    processRule: 'Kural sözleşmesi', processRuleCopy: 'Giriş, çıkış, bar durumu, zamanlama, veri kaynağı ve risk kuralları uygulamadan önce test edilebilir tek manifeste dönüşür.',
    processBreak: 'Kırılma haritası', processBreakCopy: 'Maliyet, gap, yeniden başlatma davranışı, repaint riski ve rejim değişimi tek güzel sonucun içine karıştırılmadan ayrıştırılır.',
    processProof: 'Kanıt paketi', processProofCopy: 'Ekranlar, ayarlar, sürümler, kaynak bağlantıları ve açık kanıt sınırları beraber taşınır.',
    contactTitle: 'Çalışan bir portföy.|[[Satış hunisi değil.]]', contactCopy: 'Yayımlayabildiğim MQL5 ürünlerini, Pine deneylerini, test notlarını ve kanıt paketlerini bu sitede topluyorum.', contactMql5: 'MQL5 profili ↗', contactMail: 'E-posta gönder ↗', futureNote: 'Sonraki halka: kanıt sınırı hazır olduğunda MQL5 Signal hesabı.',
    footerDisclaimer: 'Mühendislik portföyü. Yatırım tavsiyesi veya getiri garantisi değildir.', normal: 'NORMAL', elevated: 'YÜKSEK', severe: 'AĞIR', stable: 'STABİL', stressed: 'ZORLANIYOR'
  }
};

function toPoints(levels) {
  const step = 800 / (levels.length - 1);
  return levels.map((level, index) => ({ x: index * step, y: levelToY(level) }));
}

function pathFrom(points) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
}

function renderScenario(animate = false) {
  const pressure = Number(riskInput.value);
  const scenario = scenarios[activeRegime];
  const series = buildSeries(scenario, pressure);
  const guardedPoints = toPoints(series.guarded);
  const rawPoints = toPoints(series.raw);
  chartPoints = guardedPoints.map((point, index) => ({ x: point.x, y: point.y, gap: series.guarded[index] - series.raw[index] }));

  const guardedTrack = pathFrom(guardedPoints);
  const rawTrack = pathFrom(rawPoints);
  const rawTrackBack = rawPoints.slice().reverse().map(point => `L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  responsePath.setAttribute('d', guardedTrack);
  areaPath.setAttribute('d', `${guardedTrack} L 800 360 L 0 360 Z`);
  rawPath.setAttribute('d', rawTrack);
  gapPath.setAttribute('d', `${guardedTrack} ${rawTrackBack} Z`);

  const spread = Math.max(0, Math.round(series.guarded[STEPS - 1] - series.raw[STEPS - 1]));
  riskOutput.textContent = `${pressure}%`;
  coverageValue.textContent = scenario.coverage;
  loadValue.textContent = pressure < 50 ? copy[activeLanguage].normal : pressure < 80 ? copy[activeLanguage].elevated : copy[activeLanguage].severe;
  breakValue.textContent = scenario.breakPoint[activeLanguage];
  spreadValue.textContent = `+${spread} ${copy[activeLanguage].points}`;
  if (animate && !reduceMotion) {
    chartSvg.classList.remove('is-drawing');
    void chartSvg.getBoundingClientRect();
    chartSvg.classList.add('is-drawing');
  }
}

function applyLanguage() {
  document.documentElement.lang = activeLanguage;
  document.querySelectorAll('[data-copy]').forEach(element => {
    const value = copy[activeLanguage][element.dataset.copy];
    if (value) element.textContent = value;
  });
  document.querySelectorAll('[data-copy-rich]').forEach(element => {
    const value = copy[activeLanguage][element.dataset.copyRich];
    if (!value) return;
    const fragment = document.createDocumentFragment();
    value.split('|').forEach((line, lineIndex) => {
      if (lineIndex > 0) fragment.append(document.createElement('br'));
      const match = line.match(/^(.*?)\[\[(.+?)\]\](.*)$/);
      if (!match) {
        fragment.append(document.createTextNode(line));
        return;
      }
      fragment.append(document.createTextNode(match[1]));
      const emphasis = document.createElement('em');
      emphasis.textContent = match[2];
      fragment.append(emphasis, document.createTextNode(match[3]));
    });
    element.replaceChildren(fragment);
  });
  languageSwitch.textContent = activeLanguage === 'en' ? 'TR' : 'EN';
  languageSwitch.setAttribute('aria-label', activeLanguage === 'en' ? 'Türkçeye geç' : 'Switch to English');
  renderScenario(false);
}

document.addEventListener('pointermove', event => {
  const x = event.clientX / window.innerWidth;
  const y = event.clientY / window.innerHeight;
  root.style.setProperty('--pointer-px', `${(x * 100).toFixed(1)}%`);
  root.style.setProperty('--pointer-py', `${(y * 100).toFixed(1)}%`);
  root.style.setProperty('--pointer-x', (x - .5).toFixed(3));
  root.style.setProperty('--pointer-y', (y - .5).toFixed(3));
}, { passive: true });

document.querySelectorAll('[data-regime]').forEach(button => {
  button.addEventListener('click', () => {
    activeRegime = button.dataset.regime;
    document.querySelectorAll('[data-regime]').forEach(candidate => candidate.setAttribute('aria-pressed', String(candidate === button)));
    renderScenario(true);
  });
});

riskInput.addEventListener('input', () => renderScenario(false));
rerunButton.addEventListener('click', () => renderScenario(true));
languageSwitch.addEventListener('click', () => {
  activeLanguage = activeLanguage === 'en' ? 'tr' : 'en';
  applyLanguage();
});

chart.addEventListener('pointermove', event => {
  const bounds = chart.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
  const index = Math.round(ratio * (chartPoints.length - 1));
  const point = chartPoints[index];
  if (!point) return;
  probe.style.left = `${ratio * 100}%`;
  probe.style.setProperty('--probe-y', `${(point.y / 360) * 100}%`);
  const state = point.gap > 12 ? copy[activeLanguage].stressed : copy[activeLanguage].stable;
  tooltip.textContent = `STEP ${String(index + 1).padStart(2, '0')} · ${state}`;
  tooltip.style.left = `${Math.max(3, Math.min(75, ratio * 100 - 7))}%`;
});

document.querySelectorAll('.process-item button').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.process-item');
    const willOpen = !item.classList.contains('is-open');
    document.querySelectorAll('.process-item').forEach(candidate => {
      candidate.classList.remove('is-open');
      candidate.querySelector('button').setAttribute('aria-expanded', 'false');
    });
    if (willOpen) {
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

applyLanguage();
renderScenario(true);
