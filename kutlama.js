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

  /* --- Arka plan muzigi (gizli YouTube gomme oynatici) ------------------- */
  var MUZIK_ID = "dGsfuXGU0K4"; // Semicenk - Canin Saglosun (resmi ses)
  var SES_DUZEY = 60;           // ortak ses duzeyi (0-100); Aziz sesi de bunun
                                // kesriyle (SES_DUZEY/100) calar ki seviyeler esit olsun
  var ytFadeTimer = null;       // YouTube ses gecisi (fade) zamanlayicisi
  var oynatici = null;          // YT.Player ornegi
  var muzikHazir = false;       // oynatici hazir mi
  var sesAcik = true;           // kullanici susturduysa false
  var baslatildi = false;       // calma istegi verildi mi
  var sesGosterildi = false;    // ses dugmesi DOM'a eklendi mi
  var sesDugmesi = null;

  /* --- Bildiri sahnesi: Aziz Yildirim sesi senkronu --------------------- */
  var BILDIRI_INDEX = 3;        // sahneler[] icinde bildiri sahnesinin sirasi
  var azizSes = null;           // konusma ses kirpintisi (HTMLAudioElement)
  var azizCaliyor = false;      // konusma sesi su an caliyor mu
  var muzikDuraklatildi = false;// arka plan muzigi gecici durduruldu mu
  var bildiriModu = false;      // bildiri ozel akisi suruyor mu
  var bildiriGovdeBasladi = false; // senkron govde basladi mi
  var bildiriAtlaFn = null;     // senkron govdeyi atla (kullanici dokununca)

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
      { t: "DAVACI  : Başkan", c: "metin" },
      { t: "DAVALI  : Sayın Savcım Alime", c: "metin" },
      { t: "KONU    : bir yaş daha büyümek", c: "metin" },
      { t: "", c: "bos" },
      { t: "GEREKÇE : Dosya incelendi. İki yıldır", c: "metin" },
      { t: "          aynı yolda yürüdüğü, her", c: "metin" },
      { t: "          zorlukta 'arkandayım' deyip", c: "metin" },
      { t: "          yoldaşlık ettiği sabittir.", c: "metin" },
      { t: "", c: "bos" },
      { t: "HÜKÜM   : Sayın savcımın iyi ki", c: "metin" },
      { t: "          doğduğuna; bu dostluğun", c: "metin" },
      { t: "          süresiz, koşulsuz ve", c: "metin" },
      { t: "          temelli geçerli olduğuna", c: "metin" },
      { t: "          oybirliğiyle karar verildi.", c: "metin" },
      { t: "", c: "bos" },
      { t: "iyi ki doğdun, sayın savcım.", c: "vurgu" },
      { t: "----------------------------------------", c: "cizgi" },
      { t: "             imza: Başkanın, Yaşar Nigiz", c: "imza" }
    ],

    /* Sahne 4 - bildiri (sadakat sozu)
       Bu sahne ozeldir: ust cerceve normal yazilir; 'at' damgali satirlar,
       Aziz Yildirim konusmasinin sesiyle (bildiri-ses.m4a) senkron belirir.
       'at' = ses kirpintisinin basindan itibaren saniye. */
    [
      { t: ISTEM + " bildiri oku", c: "komut" },
      { t: "", c: "bos" },
      { t: "----------------------------------------", c: "cizgi" },
      { t: "             B İ L D İ R İ", c: "baslik" },
      { t: "----------------------------------------", c: "cizgi" },
      { t: "Yaşar Nigiz olarak; yalanı,", c: "metin", at: 0.3 },
      { t: "adaletsizliği, ihaneti, zulmü,", c: "metin", at: 3.2 },
      { t: "derslerdeki başarısızlığı, parasızlığı,", c: "metin", at: 4.5 },
      { t: "maddi sıkıntıları, hepsini gördük.", c: "metin", at: 5.3 },
      { t: "", c: "bos", at: 6.4 },
      { t: "Ancak sayın savcım Alime", c: "metin", at: 8.4 },
      { t: "Çoksöyler'in sayesinde", c: "metin", at: 9.3 },
      { t: "yalnızlığı hiç yaşamadık.", c: "metin", at: 9.9 },
      { t: "'Korkma, arkandayım' dedin; ne gelse", c: "metin", at: 12.0 },
      { t: "'hallederiz' dedik, hep beraberdik.", c: "metin", at: 13.6 },
      { t: "", c: "bos", at: 14.4 },
      { t: "Bu nedenle sayın savcıma sevgi,", c: "metin", at: 15.1 },
      { t: "saygı ve şükranlarımı sunuyorum.", c: "vurgu", at: 17.5 },
      { t: "----------------------------------------", c: "cizgi", at: 19.0 },
      { t: "                    imza: Yaşar Nigiz", c: "imza", at: 19.5 }
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
    azizDurdur();            // onceki sahne bildiriyse konusmayi durdur, muzige don
    ekran.innerHTML = "";
    var sahne = sahneler[sahneNo];
    var buBildiri = (sahneNo === BILDIRI_INDEX);
    sahneNo += 1;
    if (buBildiri) {
      await bildiriYaz(sahne);
    } else {
      await sahneYaz(sahne);
    }
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
    if (bildiriModu) {
      // Ust cerceve yazilirken: daktiloyu hizlandir.
      // Senkron govde sirasinda: govdeyi atla (ses calmaya devam eder).
      if (!bildiriGovdeBasladi) {
        hizlandir = true;
      } else if (bildiriAtlaFn) {
        var f = bildiriAtlaFn;
        bildiriAtlaFn = null;
        f();
      }
      return;
    }
    if (yaziliyor) {
      hizlandir = true;
      return;
    }
    if (devamBekliyor) {
      devamBekliyor = false;
      if (sahneNo === BILDIRI_INDEX) azizHazirla(); // jest icinde sesi kilitten cikar
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
    muzikCal();   // dokunus = kullanici jesti; muzik burada baslar
    sonrakiSahne();
  }

  /* --- Acilis ------------------------------------------------------------ */
  async function baslat() {
    await sahneYaz(acilis);
    dilekDugmesiGoster();
  }

  /* ======================================================================= */
  /* Arka plan muzigi                                                        */
  /* ======================================================================= */
  /* Telif: sarki dosyasi repoya konmaz; resmi YouTube kaynagi gomulur.
     Tarayicilar sese ancak kullanici dokunusundan sonra izin verdigi icin
     muzik "dilek tut" aninda (muzikCal) baslar. */
  function muzikKur() {
    // Gizli oynatici yuvasi (API bu div'i iframe ile degistirir)
    var sarmal = document.createElement("div");
    sarmal.className = "muzik-gizli";
    sarmal.setAttribute("aria-hidden", "true");
    var yuva = document.createElement("div");
    yuva.id = "muzik-yuva";
    sarmal.appendChild(yuva);
    document.body.appendChild(sarmal);

    // API hazir olunca oynaticiyi olustur
    window.onYouTubeIframeAPIReady = function () {
      try {
        oynatici = new YT.Player(yuva, {
          videoId: MUZIK_ID,
          width: "200",
          height: "120",
          playerVars: {
            // Not: loop/playlist KULLANILMAZ; dongu asagidaki ENDED isleyicisiyle
            // tek elden yapilir (cift dongu sarkiyi tuhaf yere atliyordu).
            autoplay: 0, controls: 0, disablekb: 1,
            modestbranding: 1, playsinline: 1, rel: 0, fs: 0
          },
          events: {
            onReady: function () {
              muzikHazir = true;
              try { oynatici.setVolume(SES_DUZEY); } catch (e) {}
              if (baslatildi) muzikCal();
            },
            onStateChange: function (ev) {
              // tek video dongusu icin guvence
              if (ev && ev.data === 0) {
                try { oynatici.seekTo(0); oynatici.playVideo(); } catch (e) {}
              }
            },
            onError: function () {}
          }
        });
      } catch (e) {}
    };

    // API betigini yukle (basarisiz olursa sayfa sessizce calismaya devam eder)
    var s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  }

  /* YouTube ses seviyesini 'hedef'e yumusakca getir (fade) */
  function ytFade(hedef, sure, bitince) {
    if (!oynatici || !muzikHazir) { if (bitince) bitince(); return; }
    if (ytFadeTimer) { clearInterval(ytFadeTimer); ytFadeTimer = null; }
    var bas = hedef;
    try { bas = oynatici.getVolume(); } catch (e) {}
    if (typeof bas !== "number" || isNaN(bas)) bas = hedef;
    var adim = Math.max(1, Math.round(sure / 50));
    var n = 0;
    ytFadeTimer = setInterval(function () {
      n += 1;
      var v = bas + (hedef - bas) * (n / adim);
      try { oynatici.setVolume(Math.max(0, Math.min(100, Math.round(v)))); } catch (e) {}
      if (n >= adim) {
        clearInterval(ytFadeTimer); ytFadeTimer = null;
        if (bitince) bitince();
      }
    }, 50);
  }

  function muzikCal() {
    baslatildi = true;
    sesDugmesiGoster();
    if (!muzikHazir || !oynatici) return;
    try {
      if (sesAcik) {
        oynatici.setVolume(0);
        oynatici.unMute();
        oynatici.playVideo();
        ytFade(SES_DUZEY, 1200);   // yumusak acilis
      } else {
        oynatici.setVolume(SES_DUZEY);
      }
    } catch (e) {}
  }

  function sesDugmesiYaziGuncelle() {
    if (!sesDugmesi) return;
    sesDugmesi.textContent = sesAcik ? "[ ses: açık ]" : "[ ses: kapalı ]";
    sesDugmesi.setAttribute(
      "aria-label", sesAcik ? "Sesi kapat" : "Sesi aç"
    );
  }

  function sesDugmesiGoster() {
    if (sesGosterildi) return;
    sesGosterildi = true;
    sesDugmesi = document.createElement("button");
    sesDugmesi.type = "button";
    sesDugmesi.className = "ses-dugme";
    sesDugmesiYaziGuncelle();
    sesDugmesi.addEventListener("click", function (e) {
      e.stopPropagation(); // sahneyi ilerletme
      sesDegistir();
    });
    document.body.appendChild(sesDugmesi);
  }

  function sesDegistir() {
    sesAcik = !sesAcik;
    if (azizSes) { azizSes.muted = !sesAcik; }
    if (oynatici && muzikHazir) {
      try {
        if (!sesAcik) {
          oynatici.mute();
        } else if (!azizCaliyor) {
          // konusma calmiyorsa arka plan muzigine don
          oynatici.setVolume(SES_DUZEY);
          oynatici.unMute();
          oynatici.playVideo();
        }
      } catch (e) {}
    }
    sesDugmesiYaziGuncelle();
  }

  /* ======================================================================= */
  /* Bildiri sahnesi: Aziz Yildirim sesi ile senkron                         */
  /* ======================================================================= */
  /* Bildiri acilinca arka plan Canin Saglosun durur, kirpilmis konusma sesi
     (bildiri-ses.m4a, "Fenerbahce camiasi olarak"tan baslar) calar; satirlar
     'at' zamanlarinda belirir; ses bitince arka plan muzigine donulur. */
  function azizOlustur() {
    if (azizSes) return;
    azizSes = new Audio("bildiri-ses.m4a?v=25");
    azizSes.preload = "auto";
    azizSes.addEventListener("ended", function () {
      azizCaliyor = false;
      muzigeDon();
    });
  }

  /* Dokunus (kullanici jesti) icinde ses ogesini "kilidini ac": boylece
     sahne icinde sessiz boslukta cagrilan play() engellenmez. */
  function azizHazirla() {
    try {
      azizOlustur();
      azizSes.muted = true;
      azizSes.currentTime = 0;
      var p = azizSes.play();
      if (p && p.then) {
        p.then(function () {
          try { azizSes.pause(); azizSes.currentTime = 0; } catch (e) {}
          azizSes.muted = !sesAcik;
        }).catch(function () {});
      }
    } catch (e) {}
  }

  function azizBaslat() {
    try {
      azizOlustur();
      azizSes.muted = !sesAcik;
      azizSes.currentTime = 0;
      azizSes.volume = SES_DUZEY / 100;  // arka plan muzigiyle ayni seviye
      azizCaliyor = true;
      var p = azizSes.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  function azizDurdur() {
    if (azizSes) { try { azizSes.pause(); } catch (e) {} }
    if (azizCaliyor) { azizCaliyor = false; muzigeDon(); }
  }

  function muzikDurdurGecici() {
    muzikDuraklatildi = true;
    if (oynatici && muzikHazir) {
      // kisarak durdur (sert kesme yerine yumusak gecis)
      ytFade(0, 500, function () {
        try { oynatici.pauseVideo(); } catch (e) {}
      });
    }
  }

  function muzigeDon() {
    muzikDuraklatildi = false;
    if (oynatici && muzikHazir && sesAcik && !azizCaliyor) {
      try {
        oynatici.setVolume(0);
        oynatici.unMute();
        oynatici.playVideo();
      } catch (e) {}
      ytFade(SES_DUZEY, 1500);   // yavasca geri ac (konum farki sert duyulmasin)
    }
  }

  /* Senkron govde satirini aninda (yumusak belirerek) ekle */
  function bildiriSatirEkle(satir) {
    var el = document.createElement("div");
    el.className = "satir beliren " + (satir.c || "");
    if (satir.t) {
      el.textContent = satir.t;
      satirBitir(el, satir);
    }
    ekran.appendChild(el);
    kaydir();
  }

  /* Zaman damgali ('at') satirlari sirayla belirir; coz() son satirda */
  function bildiriZamanliOynat(satirlar) {
    return new Promise(function (coz) {
      var i = 0;
      var zaman = null;
      function adim() {
        bildiriSatirEkle(satirlar[i]);
        i += 1;
        if (i >= satirlar.length) { coz(); return; }
        var delta = (satirlar[i].at - satirlar[i - 1].at) * 1000;
        zaman = setTimeout(adim, Math.max(60, delta));
      }
      var ilk = (satirlar[0].at || 0) * 1000;
      zaman = setTimeout(adim, Math.max(0, ilk));
      bildiriAtlaFn = function () {
        if (zaman) { clearTimeout(zaman); zaman = null; }
        while (i < satirlar.length) { bildiriSatirEkle(satirlar[i]); i += 1; }
        coz();
      };
    });
  }

  async function bildiriYaz(sahne) {
    bildiriModu = true;
    bildiriGovdeBasladi = false;
    bildiriAtlaFn = null;

    // 1) Ust cerceve ('at' tasimayan satirlar): normal daktilo
    yaziliyor = true;
    hizlandir = false;
    var i = 0;
    for (; i < sahne.length; i += 1) {
      if (sahne[i].at != null) break;
      await satirYaz(sahne[i]);
    }
    yaziliyor = false;

    // 2) Arka plan muzigini durdur, konusma sesini baslat
    muzikDurdurGecici();
    azizBaslat();
    bildiriGovdeBasladi = true;

    // 3) Zaman damgali satirlar sesle senkron belirir
    await bildiriZamanliOynat(sahne.slice(i));

    bildiriModu = false;
    bildiriAtlaFn = null;
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
    muzikKur();   // API'yi onceden yukle ki dilek aninda hazir olsun
    baslat();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", calistir);
  } else {
    calistir();
  }
})();
