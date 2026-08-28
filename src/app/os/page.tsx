/* Laman SaaS — app.kabinetcantik.com. Dijana dari mockup; styles di-scope bawah .kcpro. */
export const metadata = {
  title: { absolute: "KabinetCantik — Sistem untuk kontraktor kabinet" },
  description:
    "Urus lead, sebut harga, projek, website & portfolio dalam satu sistem. Dibina khas untuk pembuat kabinet & kontraktor. Percuma masa fasa pelancaran.",
};

const CSS = `.kcpro *{margin:0;padding:0;box-sizing:border-box}.kcpro{
  --bg:#080B12;--bg2:#0B0F1A;--surf:#0F1524;--card:rgba(255,255,255,.035);--card2:rgba(255,255,255,.05);
  --line:rgba(255,255,255,.08);--lineB:rgba(224,190,121,.28);
  --text:#E8ECF4;--muted:#8891A6;--dim:#5c6577;--brass:#E0BE79;--brass2:#C79A4B;
  --grad:linear-gradient(135deg,#F2DBA4,#C79A4B);--glow:rgba(224,190,121,.28);
  --fd:"Space Grotesk",system-ui,sans-serif;--fb:"Inter",system-ui,sans-serif;--fm:"JetBrains Mono",monospace;
}.kcpro{scroll-behavior:smooth}.kcpro{font-family:var(--fb);background:var(--bg);color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}.kcpro .wrap{max-width:1180px;margin:0 auto;padding:0 24px}.kcpro a{text-decoration:none;color:inherit}.kcpro .mono{font-family:var(--fm);font-size:12px;letter-spacing:1.5px;text-transform:uppercase}.kcpro .eyebrow{font-family:var(--fm);font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--brass);display:inline-flex;align-items:center;gap:9px}.kcpro .eyebrow::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--brass);box-shadow:0 0 12px 2px var(--glow)}.kcpro .btn{display:inline-flex;align-items:center;gap:9px;font-weight:700;font-size:15px;border-radius:12px;padding:14px 26px;transition:.18s;font-family:var(--fb)}.kcpro .btn-p{background:var(--grad);color:#1a1206;box-shadow:0 0 0 1px rgba(224,190,121,.4),0 12px 40px -8px var(--glow)}.kcpro .btn-p:hover{transform:translateY(-2px);box-shadow:0 0 0 1px rgba(224,190,121,.6),0 18px 50px -6px var(--glow)}.kcpro .btn-g{border:1px solid var(--line);color:var(--text);background:var(--card)}.kcpro .btn-g:hover{border-color:var(--lineB);color:var(--brass)}.kcpro /* ambient */
.grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:46px 46px;mask-image:radial-gradient(120% 80% at 50% 0%,#000 40%,transparent 78%);pointer-events:none}.kcpro .orb{position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none;opacity:.5}.kcpro /* NAV */
header{position:sticky;top:0;z-index:50;background:rgba(8,11,18,.72);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}.kcpro nav{display:flex;align-items:center;gap:14px;height:66px}.kcpro nav .logo{display:flex;align-items:center;gap:10px}.kcpro nav .logo img{height:30px}.kcpro nav .logo b{font-family:var(--fd);font-size:15px;letter-spacing:2px;color:var(--text);font-weight:600}.kcpro nav .links{display:flex;gap:28px;margin-left:auto}.kcpro nav .links a{color:var(--muted);font-size:14px;font-weight:500}.kcpro nav .links a:hover{color:var(--text)}.kcpro nav .act{display:flex;gap:12px;align-items:center;margin-left:28px}.kcpro nav .login{color:var(--muted);font-size:14px;font-weight:600}.kcpro nav .login:hover{color:var(--text)}.kcpro nav .act .btn{padding:9px 18px;font-size:13.5px}@media(max-width:880px){.kcpro nav .links,.kcpro nav .login{display:none}}.kcpro /* HERO */
.hero{position:relative;overflow:hidden;border-bottom:1px solid var(--line)}.kcpro .hero .orb1{width:520px;height:520px;background:radial-gradient(circle,rgba(224,190,121,.5),transparent 70%);top:-160px;right:-80px}.kcpro .hero .orb2{width:440px;height:440px;background:radial-gradient(circle,rgba(60,90,160,.45),transparent 70%);bottom:-200px;left:-120px;opacity:.4}.kcpro .hero .in{position:relative;padding:76px 0 70px;display:grid;grid-template-columns:1.05fr 1fr;gap:50px;align-items:center}@media(max-width:960px){.kcpro .hero .in{grid-template-columns:1fr;gap:40px;padding:54px 0 50px}}.kcpro .chip{display:inline-flex;align-items:center;gap:8px;font-family:var(--fm);font-size:11.5px;letter-spacing:1px;text-transform:uppercase;color:var(--brass);background:rgba(224,190,121,.08);border:1px solid var(--lineB);border-radius:999px;padding:7px 14px}.kcpro .hero h1{font-family:var(--fd);font-weight:700;font-size:56px;line-height:1.06;letter-spacing:-1.5px;margin-top:20px;color:#fff}.kcpro .hero h1 .ac{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}.kcpro .hero .sub{margin-top:22px;font-size:18px;line-height:1.6;color:var(--muted);max-width:500px}.kcpro .hero .cta{margin-top:32px;display:flex;gap:13px;flex-wrap:wrap}.kcpro .hero .trust{margin-top:26px;display:flex;gap:20px;flex-wrap:wrap;font-family:var(--fm);font-size:12px;letter-spacing:.5px;color:var(--muted)}.kcpro .hero .trust span{display:inline-flex;align-items:center;gap:7px}.kcpro .hero .trust span::before{content:"✓";color:var(--brass);font-family:var(--fb);font-weight:800}@media(max-width:520px){.kcpro .hero h1{font-size:40px}}.kcpro /* dashboard mockup + glow pedestal */
.mockwrap{position:relative}.kcpro .mockwrap::before{content:"";position:absolute;inset:-6% -4% -14% -4%;background:radial-gradient(60% 60% at 50% 40%,var(--glow),transparent 70%);filter:blur(30px);z-index:0}.kcpro .win{position:relative;z-index:1;border-radius:14px;overflow:hidden;border:1px solid var(--line);box-shadow:0 40px 100px -20px rgba(0,0,0,.7);background:#0d1220;transform:perspective(1700px) rotateY(-7deg) rotateX(3deg)}@media(max-width:960px){.kcpro .win{transform:none}}.kcpro .chrome{height:36px;background:#161c2b;display:flex;align-items:center;gap:7px;padding:0 14px;border-bottom:1px solid var(--line)}.kcpro .cdot{width:10px;height:10px;border-radius:50%}.kcpro .addr{margin-left:12px;background:#0b0f1a;border:1px solid var(--line);border-radius:6px;padding:4px 14px;font-family:var(--fm);font-size:11px;color:var(--muted)}.kcpro .app{display:flex;background:#fbf9f5;height:344px}.kcpro .side{width:150px;background:#0B1320;padding:12px 9px;flex:0 0 auto}.kcpro .brandrow{display:flex;align-items:center;gap:6px;margin-bottom:14px}.kcpro .brandrow img{width:18px;height:18px}.kcpro .brandrow span{font-family:var(--fd);font-size:8px;letter-spacing:.5px;color:var(--brass);font-weight:600}.kcpro .nv{display:flex;align-items:center;gap:7px;font-size:10.5px;color:#9aa6bd;padding:6px 8px;border-radius:7px;margin-bottom:2px}.kcpro .nv .ic{font-size:10px;width:12px;text-align:center}.kcpro .nv.on{background:var(--brass);color:#20170a;font-weight:700}.kcpro .mainc{flex:1;padding:16px 18px;overflow:hidden;color:#0B1320}.kcpro .mh{font-family:var(--fd);font-size:19px;font-weight:700;color:#0B1320;margin-bottom:12px}.kcpro .tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.kcpro .tile{background:#fff;border:1px solid #ece6da;border-radius:9px;padding:9px}.kcpro .tile .tl{font-family:var(--fm);font-size:7.5px;text-transform:uppercase;letter-spacing:.3px;color:#a49e8f;display:block}.kcpro .tile .tv{font-family:var(--fd);font-size:19px;font-weight:700;color:#0B1320}.kcpro .cardrow{display:grid;grid-template-columns:1.1fr .9fr;gap:9px;margin-top:11px}.kcpro .panel{background:#fff;border:1px solid #ece6da;border-radius:9px;padding:11px 12px}.kcpro .pt{font-size:10px;font-weight:700;color:#0B1320;margin-bottom:9px}.kcpro .bars{display:flex;flex-direction:column;gap:6px}.kcpro .br{display:flex;align-items:center;gap:6px}.kcpro .bl{width:56px;font-size:8.5px;color:#6b6659;flex:0 0 auto}.kcpro .bt{flex:1;height:10px;background:#f0ece2;border-radius:3px;overflow:hidden}.kcpro .bf{display:block;height:100%;background:linear-gradient(90deg,var(--brass2),var(--brass))}.kcpro .bn{width:13px;text-align:right;font-size:8.5px;font-weight:700;color:#0B1320}.kcpro .chart{display:flex;align-items:flex-end;gap:6px;height:96px;padding-top:4px}.kcpro .mc{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end}.kcpro .mb{width:100%;border-radius:3px 3px 0 0;background:linear-gradient(180deg,var(--brass),var(--brass2))}.kcpro .ml{font-size:8px;color:#a49e8f}.kcpro /* stats bar */
.statbar{border-bottom:1px solid var(--line);background:var(--bg2)}.kcpro .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line)}@media(max-width:700px){.kcpro .stats{grid-template-columns:1fr 1fr}}.kcpro .stat{background:var(--bg);padding:30px 20px;text-align:center}.kcpro .stat .sv{font-family:var(--fd);font-size:34px;font-weight:700;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}.kcpro .stat .sl{font-family:var(--fm);font-size:11.5px;letter-spacing:.5px;color:var(--muted);margin-top:6px;text-transform:uppercase}.kcpro /* section */
section.blk{padding:88px 0;position:relative}.kcpro .shead{max-width:660px;margin:0 auto 52px;text-align:center}.kcpro .shead h2{font-family:var(--fd);font-weight:700;font-size:40px;line-height:1.12;letter-spacing:-1px;color:#fff;margin-top:14px}.kcpro .shead p{margin-top:14px;font-size:16.5px;color:var(--muted)}.kcpro /* problem */
.problist{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:940px;margin:0 auto}@media(max-width:800px){.kcpro .problist{grid-template-columns:1fr}}.kcpro .pcard{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:24px}.kcpro .pcard .x{width:34px;height:34px;border-radius:9px;background:rgba(220,80,60,.12);border:1px solid rgba(220,80,60,.25);color:#e8836f;display:flex;align-items:center;justify-content:center;font-weight:700;margin-bottom:14px}.kcpro .pcard b{display:block;font-family:var(--fd);font-size:16px;color:#fff;margin-bottom:6px}.kcpro .pcard span{font-size:14.5px;color:var(--muted)}.kcpro /* features */
.feats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}@media(max-width:900px){.kcpro .feats{grid-template-columns:1fr 1fr}}@media(max-width:620px){.kcpro .feats{grid-template-columns:1fr}}.kcpro .ft{position:relative;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px 24px;transition:.18s;overflow:hidden}.kcpro .ft::after{content:"";position:absolute;inset:0;border-radius:16px;background:radial-gradient(120% 80% at 0% 0%,var(--glow),transparent 55%);opacity:0;transition:.18s;pointer-events:none}.kcpro .ft:hover{border-color:var(--lineB);transform:translateY(-3px)}.kcpro .ft:hover::after{opacity:.5}.kcpro .fic{position:relative;z-index:1;width:48px;height:48px;border-radius:12px;background:rgba(224,190,121,.1);border:1px solid var(--lineB);color:var(--brass);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px;box-shadow:0 0 24px -6px var(--glow)}.kcpro .fl{position:relative;z-index:1;font-family:var(--fd);font-size:19px;font-weight:600;color:#fff;margin-bottom:8px}.kcpro .fd{position:relative;z-index:1;font-size:14.5px;color:var(--muted);line-height:1.6}.kcpro /* steps */
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:940px;margin:0 auto;position:relative}@media(max-width:800px){.kcpro .steps{grid-template-columns:1fr}}.kcpro .step{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px 22px}.kcpro .snum{font-family:var(--fm);font-size:13px;font-weight:600;color:var(--brass);border:1px solid var(--lineB);border-radius:8px;padding:5px 10px;display:inline-block;margin-bottom:16px}.kcpro .st{font-family:var(--fd);font-size:18px;font-weight:600;color:#fff;margin-bottom:7px}.kcpro .sd{font-size:14.5px;color:var(--muted)}.kcpro /* pricing */
.pcardbig{max-width:440px;margin:0 auto;border:1px solid var(--lineB);border-radius:20px;padding:6px;position:relative;background:linear-gradient(180deg,rgba(224,190,121,.08),transparent);box-shadow:0 0 60px -20px var(--glow)}.kcpro .pcardin{background:var(--surf);border-radius:15px;padding:34px 30px;text-align:center}.kcpro .badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--grad);color:#1a1206;font-family:var(--fm);font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:6px 16px;border-radius:999px}.kcpro .plan{font-family:var(--fm);font-size:12px;letter-spacing:1.5px;color:var(--brass);text-transform:uppercase}.kcpro .amt{font-family:var(--fd);font-size:60px;font-weight:700;color:#fff;line-height:1;margin-top:6px}.kcpro .amt small{font-size:18px;color:var(--muted);font-weight:500;font-family:var(--fb)}.kcpro .plist{text-align:left;margin:24px 0;display:flex;flex-direction:column;gap:12px}.kcpro .plist li{list-style:none;display:flex;gap:10px;font-size:14.5px;color:var(--text)}.kcpro .plist .tick{color:var(--brass);font-weight:800}.kcpro .fine{font-size:12.5px;color:var(--muted);margin-top:14px;font-family:var(--fm);line-height:1.6}.kcpro /* demo */
.demo{position:relative;overflow:hidden;border:1px solid var(--lineB);border-radius:20px;padding:40px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;background:linear-gradient(120deg,rgba(224,190,121,.08),var(--surf))}.kcpro .demo h3{font-family:var(--fd);font-size:27px;font-weight:600;color:#fff}.kcpro .demo p{color:var(--muted);font-size:15.5px;margin-top:6px}.kcpro /* faq */
.faqs{max-width:780px;margin:0 auto;display:flex;flex-direction:column;gap:12px}.kcpro .faq{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:4px 22px}.kcpro .faq summary{cursor:pointer;font-family:var(--fd);font-size:16.5px;font-weight:600;color:#fff;padding:18px 0;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:12px}.kcpro .faq summary::-webkit-details-marker{display:none}.kcpro .faq summary::after{content:"+";color:var(--brass);font-size:22px;font-weight:400}.kcpro .faq[open] summary::after{content:"–"}.kcpro .faq p{padding:0 0 18px;font-size:14.5px;color:var(--muted);line-height:1.65}.kcpro /* final */
.final{position:relative;overflow:hidden;text-align:center;border-top:1px solid var(--line)}.kcpro .final .orb{width:600px;height:400px;background:radial-gradient(circle,var(--glow),transparent 70%);top:-100px;left:50%;transform:translateX(-50%);opacity:.6}.kcpro .final h2{position:relative;font-family:var(--fd);font-weight:700;font-size:46px;letter-spacing:-1px;color:#fff}.kcpro .final p{position:relative;margin:16px auto 30px;font-size:17px;color:var(--muted);max-width:520px}.kcpro /* footer */
footer{background:var(--bg2);border-top:1px solid var(--line);padding:54px 0 30px}.kcpro .foot-top{display:grid;grid-template-columns:2fr 1fr 1fr;gap:30px;padding-bottom:30px;border-bottom:1px solid var(--line)}@media(max-width:760px){.kcpro .foot-top{grid-template-columns:1fr}}.kcpro .foot-brand{display:flex;align-items:center;gap:10px;margin-bottom:12px}.kcpro .foot-brand img{width:32px}.kcpro .foot-brand b{font-family:var(--fd);letter-spacing:1.5px;color:var(--text);font-size:14px}.kcpro .foot-desc{font-size:13.5px;color:var(--muted);max-width:320px}.kcpro footer h4{font-family:var(--fm);font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--brass);margin-bottom:14px}.kcpro footer .fl{display:block;font-size:14px;color:var(--muted);margin-bottom:9px}.kcpro footer .fl:hover{color:var(--text)}.kcpro .foot-bar{padding-top:20px;font-family:var(--fm);font-size:11.5px;color:var(--dim);display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;color:#5c6577}.kcpro{min-height:100vh}body{background:#080B12}`;
const BODY = `<header><div class="wrap"><nav>
  <a class="logo" href="#"><img src="/logo-mark.png"><b>KABINET&nbsp;CANTIK</b></a>
  <div class="links"><a href="#ciri">Ciri</a><a href="#cara">Cara Guna</a><a href="#harga">Harga</a><a href="#faq">Soalan</a></div>
  <div class="act"><a class="login" href="https://app.kabinetcantik.com/admin/login">Log Masuk</a><a class="btn btn-p" href="https://app.kabinetcantik.com/daftar">Daftar Percuma</a></div>
</nav></div></header>

<section class="hero">
  <div class="grid-bg"></div><div class="orb orb1"></div><div class="orb orb2"></div>
  <div class="wrap in">
    <div>
      <span class="chip">◆ Platform Kontraktor Kabinet</span>
      <h1>Satu sistem untuk<br>seluruh bisnes<br><span class="ac">kabinet awak.</span></h1>
      <p class="sub">Lead, sebut harga, projek, website &amp; portfolio — semua bersambung dalam satu dashboard. Berhenti bergelut dengan WhatsApp &amp; Excel.</p>
      <div class="cta">
        <a class="btn btn-p" href="https://app.kabinetcantik.com/daftar">Daftar Percuma →</a>
        <a class="btn btn-g" href="https://demokabinet.kabinetcantik.com">▸ Tengok Demo Langsung</a>
      </div>
      <div class="trust"><span>Percuma sepenuhnya</span><span>Tanpa kad kredit</span><span>Siap 2 minit</span></div>
    </div>
    <div class="mockwrap"><div class="win">
      <div class="chrome"><span class="cdot" style="background:#ff5f57"></span><span class="cdot" style="background:#febc2e"></span><span class="cdot" style="background:#28c840"></span><span class="addr">app.kabinetcantik.com/admin</span></div>
      <div class="app">
        <div class="side"><div class="brandrow"><img src="/logo-mark.png"><span>KABINET&nbsp;CANTIK</span></div><div class="nv on"><span class="ic">▦</span>Dashboard</div><div class="nv "><span class="ic">◎</span>Leads Pasaran</div><div class="nv "><span class="ic">▤</span>Pipeline</div><div class="nv "><span class="ic">₪</span>Sebut Harga</div><div class="nv "><span class="ic">▩</span>Projek</div><div class="nv "><span class="ic">❖</span>Portfolio</div></div>
        <div class="mainc">
          <div class="mh">Dashboard</div>
          <div class="tiles">
            <div class="tile"><span class="tl">Jumlah Lead</span><span class="tv">128</span></div>
            <div class="tile"><span class="tl">Lead Baru</span><span class="tv">24</span></div>
            <div class="tile"><span class="tl">Nilai Pipeline</span><span class="tv">RM486k</span></div>
            <div class="tile"><span class="tl">Kadar Tukar</span><span class="tv">38%</span></div>
          </div>
          <div class="cardrow">
            <div class="panel"><div class="pt">Lead ikut peringkat</div><div class="bars"><div class="br"><span class="bl">Baru</span><span class="bt"><span class="bf" style="width:100%"></span></span><span class="bn">6</span></div><div class="br"><span class="bl">Dihubungi</span><span class="bt"><span class="bf" style="width:66%"></span></span><span class="bn">4</span></div><div class="br"><span class="bl">Ukur Tapak</span><span class="bt"><span class="bf" style="width:50%"></span></span><span class="bn">3</span></div><div class="br"><span class="bl">Sebut Harga</span><span class="bt"><span class="bf" style="width:66%"></span></span><span class="bn">4</span></div><div class="br"><span class="bl">Deposit</span><span class="bt"><span class="bf" style="width:33%"></span></span><span class="bn">2</span></div><div class="br"><span class="bl">Fabrikasi</span><span class="bt"><span class="bf" style="width:16%"></span></span><span class="bn">1</span></div></div></div>
            <div class="panel"><div class="pt">Lead 6 bulan</div><div class="chart"><div class="mc"><span class="mb" style="height:51%"></span><span class="ml">Mac</span></div><div class="mc"><span class="mb" style="height:70%"></span><span class="ml">Apr</span></div><div class="mc"><span class="mb" style="height:85%"></span><span class="ml">Mei</span></div><div class="mc"><span class="mb" style="height:66%"></span><span class="ml">Jun</span></div><div class="mc"><span class="mb" style="height:100%"></span><span class="ml">Jul</span></div><div class="mc"><span class="mb" style="height:88%"></span><span class="ml">Ogo</span></div></div></div>
          </div>
        </div>
      </div>
    </div></div>
  </div>
</section>

<section class="statbar"><div class="wrap" style="padding:0"><div class="stats"><div class="stat"><div class="sv">6</div><div class="sl">Modul dalam 1 sistem</div></div><div class="stat"><div class="sv">2 min</div><div class="sl">Masa nak setup</div></div><div class="stat"><div class="sv">RM0</div><div class="sl">Fasa pelancaran</div></div><div class="stat"><div class="sv">100%</div><div class="sl">Data awak terasing</div></div></div></div></section>

<section class="blk">
  <div class="wrap">
    <div class="shead"><span class="eyebrow">Masalah</span><h2>Bisnes kabinet awak bersepah kat merata tempat</h2></div>
    <div class="problist">
      <div class="pcard"><div class="x">✕</div><b>Lead hilang dalam WhatsApp</b><span>Chat bertimbun, lupa follow-up, prospek lari ke kontraktor lain.</span></div>
      <div class="pcard"><div class="x">✕</div><b>Sebut harga lambat</b><span>Kira guna Excel setiap kali, customer tunggu lama, hilang mood.</span></div>
      <div class="pcard"><div class="x">✕</div><b>Susah nak nampak pro</b><span>Takde website, takde portfolio kemas — customer ragu nak percaya.</span></div>
    </div>
  </div>
</section>

<section class="blk" id="ciri" style="background:var(--bg2);border-top:1px solid var(--line);border-bottom:1px solid var(--line)">
  <div class="wrap">
    <div class="shead"><span class="eyebrow">Modul</span><h2>Semua yang awak perlu, dalam satu tempat</h2><p>Dibina khas untuk pembuat kabinet &amp; kontraktor — bukan software generik.</p></div>
    <div class="feats"><div class="ft"><span class="fic">◎</span><div class="fl">Leads Pasaran</div><div class="fd">Kami kongsi lead customer yang nak buat kabinet — awak claim yang berkenaan, terus masuk sistem. Anggap bonus atas usaha awak.</div></div><div class="ft"><span class="fic">▤</span><div class="fl">CRM &amp; Pipeline</div><div class="fd">Papan seret-lepas yang senang. Bagi tugas kat staff, set follow-up, rekod setiap panggilan — tak ada lead terlepas lagi.</div></div><div class="ft"><span class="fic">₪</span><div class="fl">Sebut Harga Auto</div><div class="fd">Borang pintar kat website awak — customer pilih kategori &amp; saiz, terus nampak julat harga. Awak dapat lead yang memang serius.</div></div><div class="ft"><span class="fic">❖</span><div class="fl">Website &amp; Portfolio</div><div class="fd">Website berjenama sendiri + galeri kerja. Customer tengok hasil kerja awak, terus mintak sebut harga kat situ juga.</div></div><div class="ft"><span class="fic">▩</span><div class="fl">Projek &amp; Laporan</div><div class="fd">Jejak setiap projek, upload gambar kerja, jana laporan PDF berjenama — hantar kat customer. Nampak kemas &amp; pro.</div></div><div class="ft"><span class="fic">▧</span><div class="fl">Analitik</div><div class="fd">Tengok statistik lead, nilai pipeline &amp; kadar tukar — tahu bisnes awak sihat ke tak, dalam satu pandangan.</div></div></div>
  </div>
</section>

<section class="blk" id="cara">
  <div class="wrap">
    <div class="shead"><span class="eyebrow">Cara Guna</span><h2>Mula dalam 3 langkah</h2></div>
    <div class="steps"><div class="step"><span class="snum">01</span><div class="st">Daftar percuma</div><div class="sd">Isi nama syarikat &amp; pilih alamat web awak. Ambil masa 2 minit je.</div></div><div class="step"><span class="snum">02</span><div class="st">Setup jenama</div><div class="sd">Letak logo &amp; maklumat syarikat. Website &amp; sistem awak terus siap sedia.</div></div><div class="step"><span class="snum">03</span><div class="st">Mula terima lead</div><div class="sd">Terima lead, buat sebut harga, urus projek — semua dari satu dashboard.</div></div></div>
    <div style="text-align:center;margin-top:40px"><a class="btn btn-p" href="https://app.kabinetcantik.com/daftar">Daftar Percuma →</a></div>
  </div>
</section>

<section class="blk" id="harga" style="background:var(--bg2);border-top:1px solid var(--line)">
  <div class="wrap">
    <div class="shead"><span class="eyebrow">Harga</span><h2>Percuma sepenuhnya — masa fasa pelancaran</h2></div>
    <div class="pcardbig"><div class="pcardin">
      <span class="badge">Tawaran Pelancaran</span>
      <div class="plan">Pelan Launch</div>
      <div class="amt">RM0<small>/bulan</small></div>
      <ul class="plist">
        <li><span class="tick">✓</span> Semua ciri terbuka penuh</li>
        <li><span class="tick">✓</span> Website + portfolio berjenama sendiri</li>
        <li><span class="tick">✓</span> Lead, CRM, sebut harga &amp; projek</li>
        <li><span class="tick">✓</span> Leads Pasaran (bonus)</li>
        <li><span class="tick">✓</span> Tanpa kad kredit, tanpa tarikh tamat</li>
      </ul>
      <a class="btn btn-p" href="https://app.kabinetcantik.com/daftar" style="width:100%;justify-content:center">Daftar Percuma →</a>
      <p class="fine">Harga berpatutan diperkenalkan selepas fasa pelancaran. Yang daftar sekarang kekal keistimewaan awal.</p>
    </div></div>
  </div>
</section>

<section class="blk" style="padding-top:70px">
  <div class="wrap"><div class="demo">
    <div class="grid-bg" style="opacity:.5"></div>
    <div style="position:relative"><h3>Nak tengok dulu sebelum daftar?</h3><p>Cuba dashboard demo langsung — lead, projek, portfolio, semua ada.</p></div>
    <a class="btn btn-p" href="https://demokabinet.kabinetcantik.com" style="position:relative">Buka Demo →</a>
  </div></div>
</section>

<section class="blk" id="faq">
  <div class="wrap">
    <div class="shead"><span class="eyebrow">Soalan Lazim</span><h2>Ada soalan? Ni jawapannya</h2></div>
    <div class="faqs"><details class="faq"><summary>Betul-betul percuma?</summary><p>Ya. Masa fasa pelancaran ni, semua ciri terbuka percuma — tanpa tarikh tamat, tanpa kad kredit. Yang daftar sekarang kekal keistimewaan awal bila harga diperkenalkan nanti.</p></details><details class="faq"><summary>Kena ada website sedia ada?</summary><p>Tak. Sebaik daftar, awak terus dapat website berjenama sendiri (alamat-awak.kabinetcantik.com) + galeri portfolio. Boleh guna terus.</p></details><details class="faq"><summary>Data pelanggan aku selamat?</summary><p>Ya. Setiap syarikat terasing sepenuhnya — data awak hanya awak yang nampak. Tenant lain tak boleh akses langsung.</p></details><details class="faq"><summary>Macam mana Leads Pasaran?</summary><p>Lead customer dari platform kami dikongsi sebagai bonus — awak pilih &amp; claim yang berkenaan. Ia tambahan; awak tetap bina bisnes sendiri.</p></details></div>
  </div>
</section>

<section class="blk final">
  <div class="orb"></div>
  <div class="wrap">
    <h2>Sedia naik taraf bisnes kabinet awak?</h2>
    <p>Daftar percuma hari ni. Siap dalam 2 minit, terus boleh guna.</p>
    <a class="btn btn-p" href="https://app.kabinetcantik.com/daftar">Daftar Percuma →</a>
  </div>
</section>

<footer><div class="wrap">
  <div class="foot-top">
    <div>
      <div class="foot-brand"><img src="/logo-mark.png"><b>KABINET&nbsp;CANTIK</b></div>
      <p class="foot-desc">Sistem lengkap untuk pembuat kabinet &amp; kontraktor Malaysia — urus lead, sebut harga, projek, website &amp; portfolio dalam satu tempat.</p>
    </div>
    <div><h4>Produk</h4><a class="fl" href="#ciri">Ciri</a><a class="fl" href="#cara">Cara Guna</a><a class="fl" href="#harga">Harga</a><a class="fl" href="https://demokabinet.kabinetcantik.com">Demo</a></div>
    <div><h4>Syarikat</h4><a class="fl" href="https://kabinetcantik.com/tentang">Tentang</a><a class="fl" href="https://kabinetcantik.com/hubungi">Hubungi</a><a class="fl" href="https://kabinetcantik.com/terma">Terma</a><a class="fl" href="https://kabinetcantik.com/privasi">Privasi</a></div>
  </div>
  <div class="foot-bar">
    <span>© 2026 KABINETCANTIK · RENORUMAH SDN. BHD. (202301005235)</span>
    <span>app.kabinetcantik.com</span>
  </div>
</div></footer>`;

export default function AppLandingPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;600&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="kcpro" dangerouslySetInnerHTML={{ __html: BODY }} />
    </>
  );
}
