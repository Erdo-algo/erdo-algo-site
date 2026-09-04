const root = document.documentElement;
const chart = document.getElementById('console-chart');
const chartSvg = chart.querySelector('svg');
const responsePath = document.getElementById('response-path');
const areaPath = document.getElementById('area-path');
const probe = document.getElementById('chart-probe');
const tooltip = document.getElementById('chart-tooltip');
const riskInput = document.getElementById('risk-input');
const riskOutput = document.getElementById('risk-output');
const coverageValue = document.getElementById('coverage-value');
const loadValue = document.getElementById('load-value');
const breakValue = document.getElementById('break-value');
const rerunButton = document.getElementById('rerun-button');
const languageSwitch = document.getElementById('language-switch');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let activeRegime = 'trend';
let activeLanguage = 'en';
let chartPoints = [];

const scenarios = {
  trend: {
    points: [190, 186, 179, 183, 166, 171, 151, 156, 137, 143, 121, 129, 104, 112, 91, 98, 77, 84],
    breakPoint: { en: 'SLIPPAGE', tr: 'KAYMA' }
  },
  range: {
    points: [190, 174, 186, 169, 193, 177, 204, 181, 211, 188, 206, 194, 219, 201, 227, 212, 221, 203],
    breakPoint: { en: 'WHIPSAW', tr: 'TESTERE' }
  },
  chaos: {
    points: [190, 142, 181, 124, 207, 108, 232, 139, 244, 119, 216, 168, 255, 151, 269, 192, 280, 218],
    breakPoint: { en: 'GAP RISK', tr: 'GAP RİSKİ' }
  }
};

const copy = {
  en: {
    navLab: 'Stress Lab', navCase: 'Evidence', navProcess: 'Process', navContact: 'MQL5 profile ↗',
    eyebrow: 'EA / PINE CLINIC · ISTANBUL',
    heroTitle: 'Break the strategy|[[before]] coding it.',
    heroLead: 'A good-looking backtest is not the finish line. I turn trading rules into testable systems, push them through hostile scenarios, and show what the evidence does — and does not — support.',
    heroCta: 'Enter the stress lab ↓', heroNote: 'No signals. No profit promises. Inspectable engineering.',
    machineTitle: 'ROBUSTNESS FIELD / DEMO', liveState: 'interactive', machineCaption: 'Move your pointer. The field reacts; the evidence stays still.',
    labTitle: 'Change the conditions.|Watch the weak point move.', labIntro: 'This is an interaction demo, not market data. It shows how a review changes when assumptions change.',
    demoStamp: 'SYNTHETIC EXPLAINER — NOT PERFORMANCE', coverageLabel: 'checks exposed', loadLabel: 'risk load', breakLabel: 'first break',
    regimeLegend: 'Market regime', trend: 'Trend', range: 'Range', chaos: 'Chaos', riskLabel: 'Assumption pressure', rerun: 'Run the stress pass ↻',
    caseIntro: 'A public, free MQL5 Expert Advisor used here as a proof-boundary example.', published: 'PUBLIC / FREE',
    provesLabel: 'WHAT IT SUPPORTS', provesCopy: 'A real interface state exists; the product has a public MQL5 Market page; the project records local compile and nonvisual tester checks.',
    notProvesLabel: 'WHAT IT DOES NOT PROVE', notProvesCopy: 'Profitability, live-account safety, broker independence, or prop-firm eligibility.', marketCta: 'Inspect the public product ↗',
    processTitle: 'One chain.|Three honest checkpoints.', processIntro: 'Open a checkpoint to see what changes hands before the next stage begins.',
    processRule: 'Rule contract', processRuleCopy: 'Entry, exit, bar state, timing, data source, and risk rules become one testable manifest before implementation.',
    processBreak: 'Break map', processBreakCopy: 'Costs, gaps, restart behavior, repaint risk, and regime changes are isolated instead of blended into one flattering result.',
    processProof: 'Evidence package', processProofCopy: 'Screens, settings, versions, source links, and explicit evidence limits travel together.',
    contactTitle: 'Have a strategy?|[[Bring the weak version.]]', contactCopy: 'I work on MQL5 Expert Advisors, Pine Script conversions, debugging, and evidence-first strategy reviews.', contactCta: 'Continue on MQL5 ↗',
    footerDisclaimer: 'Engineering portfolio. No investment advice or return guarantee.', normal: 'NORMAL', elevated: 'ELEVATED', severe: 'SEVERE', stable: 'STABLE', stressed: 'STRESSED'
  },
  tr: {
    navLab: 'Stres Alanı', navCase: 'Kanıt', navProcess: 'Süreç', navContact: 'MQL5 profili ↗',
    eyebrow: 'EA / PINE KLİNİĞİ · İSTANBUL',
    heroTitle: 'Stratejiyi kodlamadan|[[önce]] kır.',
    heroLead: 'Güzel görünen backtest bitiş çizgisi değildir. Trading kurallarını test edilebilir sistemlere çevirir, kötü senaryolarda zorlar ve kanıtın neyi destekleyip neyi desteklemediğini birlikte gösteririm.',
    heroCta: 'Stres alanına gir ↓', heroNote: 'Sinyal yok. Kâr vaadi yok. İncelenebilir mühendislik.',
    machineTitle: 'DAYANIKLILIK ALANI / DEMO', liveState: 'etkileşimli', machineCaption: 'İmleci hareket ettir. Alan tepki verir; kanıt yerinde kalır.',
    labTitle: 'Koşulları değiştir.|Zayıf noktanın yerini izle.', labIntro: 'Bu bir etkileşim demosudur, piyasa verisi değildir. Varsayımlar değiştiğinde incelemenin nasıl değiştiğini gösterir.',
    demoStamp: 'SENTETİK ANLATICI — PERFORMANS DEĞİLDİR', coverageLabel: 'görünen kontroller', loadLabel: 'risk yükü', breakLabel: 'ilk kırılma',
    regimeLegend: 'Piyasa rejimi', trend: 'Trend', range: 'Yatay', chaos: 'Kaos', riskLabel: 'Varsayım baskısı', rerun: 'Stres turunu çalıştır ↻',
    caseIntro: 'Kanıt sınırını göstermek için kullanılan, herkese açık ve ücretsiz bir MQL5 Expert Advisor.', published: 'YAYINDA / ÜCRETSİZ',
    provesLabel: 'NEYİ DESTEKLİYOR', provesCopy: 'Gerçek bir arayüz durumu vardır; ürünün herkese açık MQL5 Market sayfası bulunur; proje kayıtlarında yerel derleme ve görselsiz tester kontrolleri belgelenmiştir.',
    notProvesLabel: 'NEYİ KANITLAMIYOR', notProvesCopy: 'Kârlılık, canlı hesap güvenliği, broker bağımsızlığı veya prop firma uygunluğu.', marketCta: 'Herkese açık ürünü incele ↗',
    processTitle: 'Tek zincir.|Üç dürüst kontrol noktası.', processIntro: 'Sonraki aşamaya geçmeden önce neyin el değiştirdiğini görmek için bir kontrol noktasını aç.',
    processRule: 'Kural sözleşmesi', processRuleCopy: 'Giriş, çıkış, bar durumu, zamanlama, veri kaynağı ve risk kuralları uygulamadan önce test edilebilir tek manifeste dönüşür.',
    processBreak: 'Kırılma haritası', processBreakCopy: 'Maliyet, gap, yeniden başlatma davranışı, repaint riski ve rejim değişimi tek güzel sonucun içine karıştırılmadan ayrıştırılır.',
    processProof: 'Kanıt paketi', processProofCopy: 'Ekranlar, ayarlar, sürümler, kaynak bağlantıları ve açık kanıt sınırları beraber taşınır.',
    contactTitle: 'Bir stratejin mi var?|[[Zayıf hâlini getir.]]', contactCopy: 'MQL5 Expert Advisor, Pine Script dönüşümü, hata ayıklama ve kanıt odaklı strateji incelemeleri üzerinde çalışıyorum.', contactCta: 'MQL5 üzerinden devam et ↗',
    footerDisclaimer: 'Mühendislik portföyü. Yatırım tavsiyesi veya getiri garantisi değildir.', normal: 'NORMAL', elevated: 'YÜKSEK', severe: 'AĞIR', stable: 'STABİL', stressed: 'ZORLANIYOR'
  }
};

function pathFrom(values) {
  const step = 800 / (values.length - 1);
  chartPoints = values.map((value, index) => ({ x: index * step, y: value }));
  return chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
}

function renderScenario(animate = false) {
  const pressure = Number(riskInput.value);
  const scenario = scenarios[activeRegime];
  const origin = scenario.points[0];
  const amplitude = .55 + pressure / 115;
  const adjusted = scenario.points.map((value, index) => {
    const jitter = Math.sin(index * 1.73 + pressure / 18) * (activeRegime === 'chaos' ? 7 : 3);
    return Math.max(26, Math.min(330, origin + (value - origin) * amplitude + jitter));
  });
  const d = pathFrom(adjusted);
  responsePath.setAttribute('d', d);
  areaPath.setAttribute('d', `${d} L 800 360 L 0 360 Z`);
  riskOutput.textContent = `${pressure}%`;
  coverageValue.textContent = activeRegime === 'trend' ? '3 / 3' : activeRegime === 'range' ? '4 / 4' : '5 / 5';
  loadValue.textContent = pressure < 50 ? copy[activeLanguage].normal : pressure < 80 ? copy[activeLanguage].elevated : copy[activeLanguage].severe;
  breakValue.textContent = scenario.breakPoint[activeLanguage];
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
  const state = point.y < 210 ? copy[activeLanguage].stable : copy[activeLanguage].stressed;
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
