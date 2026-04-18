let handPose;
let video;
let hands = [];

// --- HALKALI GENÇLİK MERKEZİ İÇERİK HAVUZU ---
let konular = [
  {
    baslik: "BİLİŞİM KURSLARI",
    renk: [0, 150, 255], // Teknoloji Mavisi
    ozet: "Geleceğin yazılımcılarını yetiştiriyoruz.",
    detaylar: "Halkalı Gençlik Merkezi, teknolojiyi tüketen değil üreten bir nesil hedefliyor.\n\n• Robotik Kodlama & Arduino\n• Python & Yapay Zeka\n• Web Tasarım & Grafik\n• 3D Yazıcı Atölyeleri\n\nile gençlerimizi dijital çağa hazırlıyoruz."
  },
  {
    baslik: "YKS HAZIRLIK KURSLARI",
    renk: [220, 20, 60], // Akademik Kırmızı
    ozet: "Üniversite yolunda tam destek.",
    detaylar: "Hayalindeki üniversiteyi kazanmak isteyen gençlerimiz için:\n\n• Alanında uzman eğitmen kadrosu,\n• Ücretsiz kaynak kitaplar,\n• Düzenli deneme sınavları,\n• Soru çözüm saatleri ile başarıya giden yolda yanınızdayız."
  },
  {
    baslik: "KÜTÜPHANE HİZMETLERİ",
    renk: [46, 139, 87], // Huzurlu Yeşil
    ozet: "Sessiz, modern ve zengin kaynaklar.",
    detaylar: "Ders çalışmak ve araştırma yapmak için mükemmel ortam:\n\n• Binlerce basılı ve dijital kaynak,\n• Sessiz ders çalışma alanları,\n• Ücretsiz ve hızlı Wi-Fi,\n• Konforlu okuma köşeleri ile hizmetinizdeyiz."
  },
  {
    baslik: "REHBERLİK SERVİSİ",
    renk: [147, 112, 219], // Psikoloji Lavantası
    ozet: "Geleceğini planlarken yalnız değilsin.",
    detaylar: "Sadece ders başarısı değil, ruhsal iyilik hali de önceliğimizdir.\n\n• Kariyer planlama ve meslek seçimi,\n• Sınav kaygısı yönetimi,\n• Bireysel görüşmeler ve motivasyon seminerleri ile rehberlik birimimiz her zaman açık."
  },
  {
    baslik: "SPOR SALONU",
    renk: [255, 140, 0], // Enerjik Turuncu
    ozet: "Sağlam kafa, sağlam vücutta bulunur.",
    detaylar: "Gençlerimizin fiziksel gelişimi için modern donanımlı salonumuzda:\n\n• Fitness ve kondisyon,\n• Pilates ve Yoga grupları,\n• Masa tenisi turnuvaları,\nile hem spor yapıyor hem de sosyalleşiyoruz."
  },
  {
    baslik: "KAFETERYA & SOSYAL ALAN",
    renk: [139, 69, 19], // Sıcak Kahve Tonu
    ozet: "Ders aralarında keyifli bir mola.",
    detaylar: "Gençlerin buluşma noktası:\n\n• Hijyenik ve uygun fiyatlı ikramlar,\n• Arkadaşlarınızla sohbet edebileceğiniz oturma alanları,\n• Kitap okuma köşeleri ile merkezimizin en canlı noktası."
  },
  {
    baslik: "DİĞER ATÖLYELER",
    renk: [0, 206, 209], // Yaratıcı Turkuaz
    ozet: "Sanat ve kişisel gelişim.",
    detaylar: "Yeteneklerinizi keşfetmeniz için çeşitli kulüplerimiz var:\n\n• Resim ve Müzik Atölyeleri,\n• Yabancı Dil Kulüpleri,\n• Akıl ve Zeka Oyunları,\n• Drama ve Tiyatro etkinlikleri ile kendinizi geliştirin."
  }
];

// --- AYARLAR ---
let aktifSlayt = 0;
let durum = "ANA_SAYFA"; 
let gecisSayaci = 0; 
let yumrukSayaci = 0;

let solBolge, sagBolge;

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
  
  solBolge = width * 0.15;
  sagBolge = width * 0.85;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  solBolge = width * 0.15;
  sagBolge = width * 0.85;
}

function gotHands(results) {
  hands = results;
}

function draw() {
  // Arka plan koyu gri (Kurumsal ciddiyet)
  background(25);

  let konu = konular[aktifSlayt];
  let r = konu.renk[0];
  let g = konu.renk[1];
  let b = konu.renk[2];

  // --- ARAYÜZ ---

  if (durum === "ANA_SAYFA") {
    
    // Ortadaki Halka
    noFill();
    stroke(r, g, b, 150);
    strokeWeight(8);
    circle(width/2, height/2, height * 0.55);
    
    // İçine hafif dolgu
    fill(r, g, b, 20);
    noStroke();
    circle(width/2, height/2, height * 0.55);
    
    // Başlık
    textAlign(CENTER, CENTER);
    textSize(width * 0.05); // Başlık boyutu
    textStyle(BOLD);
    
    fill(255);
    // Gölge efekti
    text(konu.baslik, width/2 + 3, height/2 + 3 - 40);
    fill(r, g, b);
    text(konu.baslik, width/2, height/2 - 40);
    
    // Özet
    textStyle(NORMAL);
    textSize(width * 0.025);
    fill(220);
    rectMode(CENTER);
    text(konu.ozet, width/2, height/2 + 100, width * 0.7, 200);
    
    // Alt Yönerge
    textSize(22);
    fill(180);
    text("Detaylı bilgi için YUMRUK yapın ✊", width/2, height - 100);
    
    // Oklar
    cizButonlar();

  } else {
    // --- DETAY SAYFASI ---
    // Arka planı karart
    fill(10, 15, 30, 240);
    rectMode(CORNER);
    noStroke();
    rect(0, 0, width, height);
    
    // Üst Şerit (Renkli Başlık)
    fill(r, g, b);
    rect(0, 0, width, height * 0.15);
    
    fill(255);
    textSize(width * 0.04);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(konu.baslik, width/2, height * 0.075);
    
    // İçerik Kutusu
    let margin = width * 0.1;
    
    // Sol tarafa dikey çizgi (Tasarım detayı)
    stroke(r, g, b);
    strokeWeight(5);
    line(margin, height * 0.25, margin, height * 0.8);
    noStroke();
    
    // Metin
    textAlign(LEFT, TOP);
    textSize(width * 0.022); // Okunaklı font
    textStyle(NORMAL);
    fill(230);
    
    // Metni saracak alan
    text(konu.detaylar, margin + 30, height * 0.25, width - (margin*2) - 30, height * 0.6);
    
    // Çıkış
    textAlign(CENTER);
    fill(255, 100);
    textSize(24);
    text("ANA EKRANA DÖNMEK İÇİN İKİ ELİNİZİ KALDIRIN ✋✋", width/2, height - 50);
  }

  // --- EL ETKİLEŞİMİ ---
  
  if (gecisSayaci > 0) gecisSayaci--;

  if (hands.length > 0) {
    let el = hands[0];
    
    let elX = map(el.keypoints[9].x, 0, video.width, width, 0);
    let elY = map(el.keypoints[9].y, 0, video.height, 0, height);

    drawCursor(elX, elY, r, g, b);

    // Çıkış
    if (hands.length >= 2 && durum === "DETAY" && gecisSayaci === 0) {
       durum = "ANA_SAYFA";
       gecisSayaci = 40;
    }
    
    // Ana Sayfa Kontrolleri
    else if (durum === "ANA_SAYFA" && gecisSayaci === 0) {
       
       // Yumruk (Orta Alan)
       if (elX > solBolge && elX < sagBolge) {
           if (yumrukMu(el)) {
               yumrukSayaci++;
               // Dolum
               noFill();
               stroke(r, g, b);
               strokeWeight(12);
               let angle = map(yumrukSayaci, 0, 40, 0, TWO_PI);
               arc(elX, elY, 90, 90, 0, angle);
               
               if (yumrukSayaci > 40) {
                   durum = "DETAY";
                   gecisSayaci = 40;
                   yumrukSayaci = 0;
               }
           } else {
               yumrukSayaci = 0;
           }
       }
       
       // İleri (Sağ)
       if (elX > sagBolge) {
           highlightZone("SAG", r, g, b);
           if (gecisSayaci === 0) {
               aktifSlayt++;
               if (aktifSlayt >= konular.length) aktifSlayt = 0;
               gecisSayaci = 30;
           }
       }
       
       // Geri (Sol)
       if (elX < solBolge) {
           highlightZone("SOL", r, g, b);
           if (gecisSayaci === 0) {
               aktifSlayt--;
               if (aktifSlayt < 0) aktifSlayt = konular.length - 1;
               gecisSayaci = 30;
           }
       }
    }
  }
}

// --- YARDIMCI FONKSİYONLAR ---

function cizButonlar() {
  fill(80, 80, 80, 100); 
  rectMode(CORNER);
  rect(0, 0, solBolge, height); // Sol Şerit
  rect(sagBolge, 0, width-sagBolge, height); // Sağ Şerit
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(60);
  textStyle(BOLD);
  text("<", solBolge/2, height/2);
  text(">", sagBolge + (width-sagBolge)/2, height/2);
}

function highlightZone(yon, r, g, b) {
  fill(r, g, b, 100); // Tematik renkte parlasın
  rectMode(CORNER);
  if (yon === "SOL") {
    rect(0, 0, solBolge, height);
  } else {
    rect(sagBolge, 0, width-sagBolge, height);
  }
}

function drawCursor(x, y, r, g, b) {
  noCursor();
  noFill();
  stroke(r, g, b);
  strokeWeight(4);
  circle(x, y, 50);
  fill(255);
  noStroke();
  circle(x, y, 10);
}

function yumrukMu(el) {
  let bilek = el.keypoints[0];
  let parmakUclari = [8, 12, 16, 20];
  let toplam = 0;
  for (let i of parmakUclari) {
    let uc = el.keypoints[i];
    toplam += dist(bilek.x, bilek.y, uc.x, uc.y);
  }
  return (toplam/4 < 100);
}