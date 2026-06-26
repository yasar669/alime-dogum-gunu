/* ==========================================================================
   Alime icin terminal gorunumlu dogum gunu kutlamasi
   Saf JavaScript: sahne motoru, daktilo efekti, dilek dugmesi, arka plan akisi
   ========================================================================== */
(function () {
  "use strict";

  var ISTEM = "alime@doğumgünü:~$";
  var ekran = document.getElementById("ekran");

  var azalt = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Durum ------------------------------------------------------------- */
  var yaziliyor = false;     // su an bir sahne yaziliyor mu
  var hizlandir = false;     // mevcut sahneyi aninda tamamla
  var devamBekliyor = false; // [ devam etmek icin dokun ] bekleniyor mu
  var sahneNo = 0;           // sonraki yazilacak sahnenin sirasi
  var dinleyiciAcik = false; // genel girdi dinleyicisi takildi mi
  var bittiEffektBekliyor = false; // son sahne sonrasi harf dokulme bekleniyor mu

  /* --- Acilis (bekleme) sahnesi ------------------------------------------ */
  var acilis = [
    { t: "ALİME İŞLETİM SİSTEMİ  -  sürüm 21.0", c: "baslik2" },
    { t: "[ çekirdek yükleniyor ............ tamam ]", c: "durum" },
    { t: "[ anılar bağlanıyor .............. tamam ]", c: "durum" },
    { t: "[ dostluk modülü hazırlanıyor .... tamam ]", c: "durum" },
    { t: "oturum açıldı: sayın savcım   yetki: müstakbel savcı", c: "soluk" },
    { t: "", c: "bos" },
    { t: "önce bir şey gerekiyor: bir dilek tut.", c: "metin" }
  ];

  /* --- Kutlama sahneleri (sirayla) --------------------------------------- */
  var sahneler = [
    /* Sahne 1 - dilek / cekirdek kutlama */
    [
      { t: ISTEM + " ./kutlama dilek_tut", c: "komut" },
      { t: "[ dileğin tutuluyor .......... tamam ]", c: "durum" },
      { t: "[ mumlar yakılıyor ........... tamam ]", c: "durum" },
      { t: "[ pasta hazırlanıyor ......... tamam ]", c: "durum" },
      { t: "", c: "bos" },
      { t: "========================================", c: "cizgi" },
      { t: "     DOĞUM GÜNÜN KUTLU OLSUN, ALİME", c: "baslik" },
      { t: "========================================", c: "cizgi" },
      { t: "", c: "bos" },
      { t: "Dileğin tutuldu...", c: "vurgu" },
      { t: "İyi ki doğdun, iyi ki varsın.", c: "metin" },
      { t: "Bugün senin günün; yürekten kutlu olsun.", c: "metin" }
    ],

    /* Sahne 2 - anilar dizini */
    [
      { t: ISTEM + " ls ~/anilar/", c: "komut" },
      { t: "19_agustos_2024.txt   ayni_yol.txt   yoldaslik.txt", c: "dizin" },
      { t: "", c: "bos" },
      { t: ISTEM + " cat ~/anilar/ayni_yol.txt", c: "komut" },
      { t: "\"19 Ağustos 2024: aynı üniversiteyi", c: "alinti" },
      { t: " kazandık, bir 'merhaba' ile başladı.", c: "alinti" },
      { t: " Aynı şehir, aynı yol: hukuk.", c: "alinti" },
      { t: " 'Korkma, arkandayım' dedin;", c: "alinti" },
      { t: " o gün bugündür hep yoldaşız.\"", c: "alinti" }
    ],

    /* Sahne 3 - karar (hukuk gondermesi) */
    [
      { t: ISTEM + " karar oku", c: "komut" },
      { t: "", c: "bos" },
      { t: "----------------------------------------", c: "cizgi" },
      { t: "               K A R A R", c: "baslik" },
      { t: "----------------------------------------", c: "cizgi" },
      { t: "DOSYA   : dostluk / sayın savcım", c: "metin" },
      { t: "KONU    : sayın savcının doğum günü", c: "metin" },
      { t: "", c: "bos" },
      { t: "GEREKÇE : Yılların tanıklığı ve sayısız", c: "metin" },
      { t: "          güzel anının delili incelendi.", c: "metin" },
      { t: "", c: "bos" },
      { t: "HÜKÜM   : Bu dostluğun her yerde ve her", c: "metin" },
      { t: "          zaman geçerli olduğuna; iyi ki", c: "metin" },
      { t: "          doğduğuna, süresiz ve koşulsuz", c: "metin" },
      { t: "          olarak karar verilmiştir.", c: "metin" },
      { t: "----------------------------------------", c: "cizgi" },
      { t: "             imza: Başkanın, Yaşar Nigiz", c: "imza" }
    ],

    /* Sahne 4 - bildiri (sadakat sozu) */
    [
      { t: ISTEM + " bildiri oku", c: "komut" },
      { t: "", c: "bos" },
      { t: "----------------------------------------", c: "cizgi" },
      { t: "             B İ L D İ R İ", c: "baslik" },
      { t: "----------------------------------------", c: "cizgi" },
      { t: "Yaşar Nigiz olarak; yalanı,", c: "metin" },
      { t: "adaletsizliği, ihaneti, zulmü,", c: "metin" },
      { t: "derslerdeki başarısızlığı, parasızlığı,", c: "metin" },
      { t: "maddi sıkıntıları, hepsini gördük.", c: "metin" },
      { t: "", c: "bos" },
      { t: "Ancak sayın savcım Alime", c: "metin" },
      { t: "Çoksöyler'in sayesinde", c: "metin" },
      { t: "yalnızlığı hiç yaşamadık.", c: "metin" },
      { t: "'Korkma, arkandayım' dedin; ne gelse", c: "metin" },
      { t: "'hallederiz' dedik, hep beraberdik.", c: "metin" },
      { t: "", c: "bos" },
      { t: "Bu nedenle sayın savcıma sevgi,", c: "metin" },
      { t: "saygı ve şükranlarımı sunuyorum.", c: "vurgu" },
      { t: "----------------------------------------", c: "cizgi" },
      { t: "                    imza: Yaşar Nigiz", c: "imza" }
    ],

    /* Sahne 5 - dilek muhru (bastaki dilegin karsiligi) */
    [
      { t: ISTEM + " dilek durumu", c: "komut" },
      { t: "", c: "bos" },
      { t: "[ dileğin kaydedildi ......... tamam ]", c: "durum" },
      { t: "[ dileğin mühürleniyor ....... tamam ]", c: "durum" },
      { t: "", c: "bos" },
      { t: "Dileğini açıp okumadım, okumayacağım da;", c: "metin" },
      { t: "o dilek senin yüreğinde saklı kalsın.", c: "metin" },
      { t: "Çünkü en güzel dilekler, sessizce", c: "metin" },
      { t: "tutulup yürekte büyüyenlerdir.", c: "metin" },
      { t: "", c: "bos" },
      { t: "Yürekten tutulan her dilek bir gün tutar.", c: "vurgu" },
      { t: "Senin dileğin de tutsun Alime;", c: "vurgu" },
      { t: "hem bu yıl, hem her yıl.", c: "vurgu" }
    ],

    /* Sahne 6 - kapanis mesaji */
    [
      { t: ISTEM + " cat ~/dilek/yeni_yas.txt", c: "komut" },
      { t: "", c: "bos" },
      { t: "Sevgili Alime,", c: "vurgu" },
      { t: "", c: "bos" },
      { t: "Bugün bir yaşını daha geride bırakıyor,", c: "metin" },
      { t: "yeni bir yaşa adım atıyorsun. Bu yeni yaş", c: "metin" },
      { t: "sana sağlık, sevinç ve aydınlık günler", c: "metin" },
      { t: "getirsin. Aklındaki her güzel düşünce", c: "metin" },
      { t: "gerçek olsun; attığın her adım seni", c: "metin" },
      { t: "hayallerine biraz daha yaklaştırsın.", c: "metin" },
      { t: "", c: "bos" },
      { t: "Gülüşün hiç eksilmesin, yüreğin hep", c: "metin" },
      { t: "ferah olsun. Zorlu günlerde yılma,", c: "metin" },
      { t: "güzel günlerin tadını doyasıya çıkar.", c: "metin" },
      { t: "Yürüdüğün yolda hep başarı, hep huzur", c: "metin" },
      { t: "yanında olsun.", c: "metin" },
      { t: "", c: "bos" },
      { t: "İyi ki doğdun, iyi ki yoldaşımsın.", c: "vurgu" },
      { t: "Ne gelirse gelsin, hallederiz.", c: "vurgu" },
      { t: "Nice yaşlara, nice güzel yıllara.", c: "vurgu" },
      { t: "", c: "bos" },
      { t: "                Başkanın — Yaşar Nigiz", c: "imza" },
      { t: "", c: "bos" },
      { t: "(bu pencereyi kapatabilirsin ama", c: "soluk" },
      { t: " dostluğumuz hep açık kalacak.)", c: "soluk" }
    ]
  ];

  /* --- Hiz ayarlari (ms) ------------------------------------------------- */
  var harfHizi = { durum: 9, komut: 26, baslik: 36, baslik2: 22, cizgi: 4 };
  var harfVarsayilan = 20;
  var satirGec = { cizgi: 45, durum: 95, baslik: 320, baslik2: 120, bos: 70 };
  var satirVarsayilan = 150;

  function harfMs(tur) {
    if (azalt) return 0;
    return harfHizi[tur] != null ? harfHizi[tur] : harfVarsayilan;
  }
  function satirMs(tur) {
    var m = satirGec[tur] != null ? satirGec[tur] : satirVarsayilan;
    return azalt ? Math.min(m, 28) : m;
  }

  /* --- Yardimcilar ------------------------------------------------------- */
  function bekle(ms) {
    return new Promise(function (coz) { setTimeout(coz, ms); });
  }
  function guvenli(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function kaydir() {
    ekran.scrollTop = ekran.scrollHeight;
  }

  /* Satir tamamlaninca renklendirme (tamam, istem) */
  function satirBitir(el, satir) {
    var metin = el.textContent;
    if (satir.c === "durum" && metin.indexOf("tamam") !== -1) {
      el.innerHTML = guvenli(metin).replace("tamam", "<span class=\"ok\">tamam</span>");
    } else if (satir.c === "komut" && metin.indexOf(ISTEM) === 0) {
      var geri = metin.slice(ISTEM.length);
      el.innerHTML = "<span class=\"istem\">" + guvenli(ISTEM) + "</span>" + guvenli(geri);
    }
  }

  /* --- Tek satir yaz ----------------------------------------------------- */
  function satirYaz(satir) {
    return new Promise(function (coz) {
      var el = document.createElement("div");
      el.className = "satir " + (satir.c || "");
      ekran.appendChild(el);

      var metin = satir.t || "";
      var harfler = Array.from(metin);
      var i = 0;
      var hiz = harfMs(satir.c);

      function adim() {
        if (hizlandir) {
          el.textContent = metin;
          satirBitir(el, satir);
          kaydir();
          coz();
          return;
        }
        if (i < harfler.length) {
          el.textContent += harfler[i];
          i += 1;
          kaydir();
          setTimeout(adim, hiz);
        } else {
          satirBitir(el, satir);
          kaydir();
          setTimeout(coz, satirMs(satir.c));
        }
      }

      if (metin === "") {
        // bos satir: sadece kucuk bir bosluk
        setTimeout(coz, hizlandir ? 0 : satirMs("bos"));
      } else {
        adim();
      }
    });
  }

  /* --- Bir sahneyi bastan sona yaz --------------------------------------- */
  async function sahneYaz(sahne) {
    yaziliyor = true;
    hizlandir = false;
    for (var i = 0; i < sahne.length; i += 1) {
      await satirYaz(sahne[i]);
    }
    yaziliyor = false;
  }

  /* --- Devam satiri / son imlec ------------------------------------------ */
  function devamGoster() {
    var el = document.createElement("div");
    el.className = "satir devam";
    el.textContent = "[ devam etmek için dokun ]";
    ekran.appendChild(el);
    kaydir();
    devamBekliyor = true;
  }

  function sonImlec() {
    var el = document.createElement("div");
    el.className = "satir komut";
    el.innerHTML = "<span class=\"istem\">" + guvenli(ISTEM) +
      "</span> <span class=\"imlec\"></span>";
    ekran.appendChild(el);
    kaydir();
  }

  function sonHintGoster() {
    var el = document.createElement("div");
    el.className = "satir son-dokun";
    el.textContent = "[ son bir kez dokun ]";
    ekran.appendChild(el);
    kaydir();
  }

  /* Son sahneden sonra: ekrandaki tum harfleri tek tek dokup dusur */
  function harfDokulmesi() {
    if (azalt) {
      ekran.style.transition = "opacity 0.5s ease";
      ekran.style.opacity = "0";
      setTimeout(function () {
        ekran.style.transition = "";
        ekran.style.opacity = "";
        ekran.innerHTML = "";
        sonImlec();
      }, 520);
      return;
    }

    var katman = document.createElement("div");
    katman.className = "dokulen-katman";
    var ce = window.getComputedStyle(ekran);
    katman.style.fontFamily = ce.fontFamily;
    katman.style.fontSize = ce.fontSize;
    document.body.appendChild(katman);

    var gezgin = document.createTreeWalker(ekran, NodeFilter.SHOW_TEXT, null);
    var dugum, enGec = 0;
    var parcalar = [];

    while ((dugum = gezgin.nextNode())) {
      var metin = dugum.nodeValue;
      if (!metin) continue;
      var ps = window.getComputedStyle(dugum.parentNode);
      var renk = ps.color, agirlik = ps.fontWeight, egim = ps.fontStyle;
      for (var i = 0; i < metin.length; i += 1) {
        var ch = metin.charAt(i);
        if (ch === " " || ch === " ") continue;
        var aralik = document.createRange();
        aralik.setStart(dugum, i);
        aralik.setEnd(dugum, i + 1);
        var r = aralik.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        parcalar.push({ ch: ch, x: r.left, y: r.top, renk: renk, agirlik: agirlik, egim: egim });
      }
    }

    ekran.style.visibility = "hidden";

    for (var j = 0; j < parcalar.length; j += 1) {
      var p = parcalar[j];
      var s = document.createElement("span");
      s.className = "dokulen";
      s.textContent = p.ch;
      s.style.left = p.x + "px";
      s.style.top = p.y + "px";
      s.style.color = p.renk;
      s.style.fontWeight = p.agirlik;
      s.style.fontStyle = p.egim;
      var dx = Math.random() * 80 - 40;
      var rot = Math.random() * 140 - 70;
      var sure = 1.1 + Math.random() * 1.4;
      var gecik = Math.random() * 0.55;
      s.style.setProperty("--dx", dx.toFixed(1) + "px");
      s.style.setProperty("--rot", rot.toFixed(1) + "deg");
      s.style.animationDuration = sure.toFixed(2) + "s";
      s.style.animationDelay = gecik.toFixed(2) + "s";
      if (sure + gecik > enGec) enGec = sure + gecik;
      katman.appendChild(s);
    }

    setTimeout(function () {
      katman.remove();
      ekran.style.visibility = "";
      ekran.innerHTML = "";
      sonImlec();
    }, Math.round((enGec + 0.25) * 1000));
  }

  /* --- Sonraki sahneye gec ----------------------------------------------- */
  async function sonrakiSahne() {
    if (sahneNo >= sahneler.length) return;
    ekran.innerHTML = "";
    var sahne = sahneler[sahneNo];
    sahneNo += 1;
    await sahneYaz(sahne);
    if (sahneNo < sahneler.length) {
      devamGoster();
    } else {
      sonImlec();
      sonHintGoster();
      bittiEffektBekliyor = true;
    }
  }

  /* --- Genel girdi: hizlandir ya da devam et ----------------------------- */
  function girdi() {
    if (yaziliyor) {
      hizlandir = true;
      return;
    }
    if (devamBekliyor) {
      devamBekliyor = false;
      sonrakiSahne();
      return;
    }
    if (bittiEffektBekliyor) {
      bittiEffektBekliyor = false;
      harfDokulmesi();
    }
  }

  function tusBas(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar" ||
        e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      girdi();
    }
  }

  function dinleyicileriTak() {
    if (dinleyiciAcik) return;
    dinleyiciAcik = true;
    document.addEventListener("click", girdi);
    document.addEventListener("keydown", tusBas);
  }

  /* --- Dilek dugmesi ----------------------------------------------------- */
  function dilekDugmesiGoster() {
    var alan = document.createElement("div");
    alan.className = "dilek-alan";

    var dugme = document.createElement("button");
    dugme.type = "button";
    dugme.className = "dilek-dugme";
    dugme.textContent = "[ BİR DİLEK TUT ]";

    var ipucu = document.createElement("div");
    ipucu.className = "ipucu";
    ipucu.textContent = "gözlerini kapat ve dokun";

    alan.appendChild(dugme);
    alan.appendChild(ipucu);
    ekran.appendChild(alan);
    kaydir();

    try { dugme.focus(); } catch (hata) {}

    dugme.addEventListener("click", function tetik(e) {
      e.stopPropagation();
      dugme.removeEventListener("click", tetik);
      dilekTutuldu();
    });
  }

  /* --- Dilek tutulunca: yolculuk baslar ---------------------------------- */
  function dilekTutuldu() {
    // Genel dinleyicileri bu olay bittikten SONRA tak ki ayni tiklamayi
    // yanlislikla "devam" olarak algilamayalim.
    setTimeout(dinleyicileriTak, 0);
    sonrakiSahne();
  }

  /* --- Acilis ------------------------------------------------------------ */
  async function baslat() {
    await sahneYaz(acilis);
    dilekDugmesiGoster();
  }

  /* ======================================================================= */
  /* Arka planda akan karakterler (canvas)                                   */
  /* ======================================================================= */
  function akisBaslat() {
    if (azalt) return;
    var tuval = document.getElementById("akis");
    if (!tuval || !tuval.getContext) return;
    var ciz = tuval.getContext("2d");

    var harfler = "DOĞUMGÜNÜKUTLUOLSUNALİME0123456789".split("");
    var fontBoyu = 16;
    var sutunlar = 0;
    var damlalar = [];

    function olcekle() {
      tuval.width = window.innerWidth;
      tuval.height = window.innerHeight;
      sutunlar = Math.floor(tuval.width / fontBoyu);
      damlalar = [];
      for (var i = 0; i < sutunlar; i += 1) {
        damlalar[i] = Math.floor(Math.random() * (tuval.height / fontBoyu));
      }
    }
    olcekle();
    window.addEventListener("resize", olcekle);

    function kare() {
      ciz.fillStyle = "rgba(7, 10, 18, 0.10)";
      ciz.fillRect(0, 0, tuval.width, tuval.height);
      ciz.fillStyle = "rgba(86, 225, 230, 0.30)";
      ciz.font = fontBoyu + "px monospace";
      for (var i = 0; i < damlalar.length; i += 1) {
        var ch = harfler[Math.floor(Math.random() * harfler.length)];
        var x = i * fontBoyu;
        var y = damlalar[i] * fontBoyu;
        ciz.fillText(ch, x, y);
        if (y > tuval.height && Math.random() > 0.975) {
          damlalar[i] = 0;
        } else {
          damlalar[i] += 1;
        }
      }
    }
    setInterval(kare, 85);
  }

  /* --- Calistir ---------------------------------------------------------- */
  function calistir() {
    akisBaslat();
    baslat();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", calistir);
  } else {
    calistir();
  }
})();
