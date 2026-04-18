let handPose;
let video;
let hands = [];

// --- İÇERİK HAVUZU ---
let konular = [
  {
    baslik: "YAPAY ZEKA (AI)",
    renk: [0, 150, 255], // Mavi
    ozet: "Makinelerin düşünme ve öğrenme yeteneği.",
    detaylar: "Yapay Zeka (AI), insan zekasını taklit eden sistemlerdir. \n\n• ChatGPT gibi dil modelleri,\n• Otonom araçlar,\n• Tıbbi teşhis sistemleri,\n\nbu teknolojinin en popüler örnekleridir."
  },
  {
    baslik: "METAVERSE",
    renk: [255, 100, 0], // Turuncu
    ozet: "Fiziksel ve dijital dünyanın birleşimi.",
    detaylar: "Sanal Gerçeklik (VR) ve Artırılmış Gerçeklik (AR) teknolojileri ile oluşturulan yeni bir evrendir.\n\nİnsanlar burada 'Avatar'lar aracılığıyla sosyalleşir, oyun oynar ve çalışır."
  },
  {
    baslik: "SİBER GÜVENLİK",
    renk: [255, 50, 50], // Kırmızı
    ozet: "Dijital saldırılara karşı savunma sanatı.",
    detaylar: "Verilerinizi hackerlardan koruma bilimidir.\n\n• Şifreleme (Kriptografi),\n• Ağ güvenliği,\n• Beyaz şapkalı hackerlık,\n\nbu alanın temel taşlarıdır."
  },
  {
    baslik: "ROBOTİK",
    renk: [50, 205, 50], // Yeşil
    ozet: "Mekanik sistemlere zeka kazandırma.",
    detaylar: "Yazılımın fiziksel dünyaya dokunduğu noktadır.\n\nArduino ve Raspberry Pi gibi kartlar kullanılarak; dronelar, robot kollar ve otonom araçlar kodlanır."
  },
  {
    baslik: "OYUN TASARIMI",
    renk: [180, 50, 255], // Mor
    ozet: "Eğlencenin kod ve sanatla buluşması.",
    detaylar: "Unity ve Unreal Engine motorları kullanılarak hayal dünyaları yaratılır.\n\nSadece kodlama değil; hikaye anlatımı, 3D modelleme ve ses tasarımı da bu sürecin parçasıdır."
  }
];

// --- AYARLAR ---
let aktifSlayt = 0;
let durum = "ANA_SAYFA"; // "ANA_SAYFA" veya "DETAY"
let gecisSayaci = 0; 
let yumrukSayaci = 0;

// Sanal Buton Bölgeleri
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
  
  // Bölgeleri tanımla (%15 sağ ve sol)
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
  // Arka planı her zaman koyu gri yap (Okunabilirlik için)
  background(30);

  let konu = konular[aktifSlayt];
  let r = konu.renk[0];
  let g = konu.renk[1];
  let b = konu.renk[2];

  // --- 1. ARAYÜZ TASARIMI ---

  if (durum === "ANA_SAYFA") {
    // --- ANA SAYFA ---
    
    // Ortadaki Renkli Halka
    noFill();
    stroke(r, g, b, 100);
    strokeWeight(10);
    circle(width/2, height/2, height * 0.5);
    
    // Başlık (Neon Efekti)
    textAlign(CENTER, CENTER);
    textSize(width * 0.07);
    textStyle(BOLD);
    
    // Gölge (Okunabilirlik için)
    fill(0);
    text(konu.baslik, width/2 + 4, height/2 + 4 - 50);
    // Asıl Yazı (Renkli)
    fill(r, g, b);
    text(konu.baslik, width/2, height/2 - 50);
    
    // Özet (Beyaz ve Net)
    textStyle(NORMAL);
    textSize(width * 0.025);
    fill(255);
    // Metni kutuya sığdır
    rectMode(CENTER);
    text(konu.ozet, width/2, height/2 + 100, width * 0.6, 200);
    
    // Yönergeler
    textSize(20);
    fill(150);
    text("Detay için YUMRUK yap ✊", width/2, height - 80);
    
    // Okları Çiz
    cizButonlar();

  } else {
    // --- DETAY SAYFASI ---
    // Yarı saydam siyah perde (Arka planı karart)
    fill(0, 0, 0, 220);
    rectMode(CORNER);
    noStroke();
    rect(0, 0, width, height);
    
    // Başlık Kutusu
    fill(r, g, b);
    rect(0, 0, width, 100);
    
    fill(255);
    textSize(40);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(konu.baslik + " - DETAYLAR", width/2, 50);
    
    // Detay Metni (Sola dayalı, Okunaklı)
    textAlign(LEFT, TOP);
    textSize(30);
    textStyle(NORMAL);
    let margin = width * 0.15;
    
    // Metin arka planı (Kutu)
    fill(50); // Koyu gri kutu
    rectMode(CORNER);
    rect(margin - 20, 150 - 20, width - (margin*2) + 40, height * 0.6 + 40, 20);
    
    fill(255);
    text(konu.detaylar, margin, 150, width - (margin*2), height * 0.6);
    
    // Çıkış Butonu
    textAlign(CENTER);
    fill(255, 50);
    textSize(24);
    text("ÇIKMAK İÇİN İKİ ELİNİ KALDIR ✋✋", width/2, height - 60);
  }

  // --- 2. EL ETKİLEŞİMİ ---
  
  if (gecisSayaci > 0) gecisSayaci--;

  if (hands.length > 0) {
    let el = hands[0];
    
    // Koordinat düzeltme (Ayna modu)
    // El sağa gidince ekranın sağına gitsin
    let elX = map(el.keypoints[9].x, 0, video.width, width, 0);
    let elY = map(el.keypoints[9].y, 0, video.height, 0, height);

    // İMLEÇ (Cursor)
    drawCursor(elX, elY, r, g, b);

    // MANTIK
    
    // Çıkış (Çift El)
    if (hands.length >= 2 && durum === "DETAY" && gecisSayaci === 0) {
       durum = "ANA_SAYFA";
       gecisSayaci = 40;
    }
    
    // Yumruk (Detay)
    else if (durum === "ANA_SAYFA" && gecisSayaci === 0) {
       
       // Sadece ORTA alandaysa yumruk işlesin (Kenarlarda oklar var)
       if (elX > solBolge && elX < sagBolge) {
           if (yumrukMu(el)) {
               yumrukSayaci++;
               // Dolum animasyonu
               noFill();
               stroke(r, g, b);
               strokeWeight(10);
               let angle = map(yumrukSayaci, 0, 40, 0, TWO_PI);
               arc(elX, elY, 80, 80, 0, angle);
               
               if (yumrukSayaci > 40) {
                   durum = "DETAY";
                   gecisSayaci = 40;
                   yumrukSayaci = 0;
               }
           } else {
               yumrukSayaci = 0;
           }
       }
       
       // SAĞ BÖLGE -> İLERİ GİT
       if (elX > sagBolge) {
           highlightZone("SAG");
           if (gecisSayaci === 0) {
               aktifSlayt++;
               if (aktifSlayt >= konular.length) aktifSlayt = 0;
               gecisSayaci = 30; // Hızlı geçiş için süreyi kısalttım
           }
       }
       
       // SOL BÖLGE -> GERİ GİT
       if (elX < solBolge) {
           highlightZone("SOL");
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
  // SOL OK (<)
  fill(50); // Pasif renk
  rectMode(CORNER);
  rect(0, 0, solBolge, height);
  
  fill(255);
  textSize(60);
  textAlign(CENTER, CENTER);
  text("<", solBolge/2, height/2);
  textSize(20);
  text("GERİ", solBolge/2, height/2 + 50);

  // SAĞ OK (>)
  fill(50);
  rect(sagBolge, 0, width-sagBolge, height);
  
  fill(255);
  textSize(60);
  text(">", sagBolge + (width-sagBolge)/2, height/2);
  textSize(20);
  text("İLERİ", sagBolge + (width-sagBolge)/2, height/2 + 50);
}

function highlightZone(yon) {
  // Seçilen bölgeyi parlat
  fill(255, 50);
  rectMode(CORNER);
  if (yon === "SOL") {
    rect(0, 0, solBolge, height);
  } else {
    rect(sagBolge, 0, width-sagBolge, height);
  }
}

function drawCursor(x, y, r, g, b) {
  noCursor();
  // Dış Halka
  noFill();
  stroke(r, g, b);
  strokeWeight(3);
  circle(x, y, 40);
  // İç Nokta
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