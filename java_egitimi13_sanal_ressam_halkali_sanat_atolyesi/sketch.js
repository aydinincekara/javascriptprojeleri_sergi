let handPose;
let video;
let hands = [];

// --- ÇİZİM DEĞİŞKENLERİ ---
let cizimler = []; 
let suankiCizgi = []; 
let kalemRengi = [0, 255, 255]; // Başlangıç: Turkuaz
let kalemKalinligi = 8;

// --- ARAYÜZ (RENK PALETİ) ---
// Listeyi burada BOŞ tanımlıyoruz, setup içinde dolduracağız
let butonlar = []; 

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // KAMERAYI BAŞLAT
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  handPose.detectStart(video, gotHands);
  
  // --- BUTONLARI BURADA TANIMLIYORUZ ---
  // Çünkü 'width' değişkeni ancak createCanvas çalıştıktan sonra kullanılabilir.
  butonlar = [
    { renk: [255, 0, 0], x: 50, y: 50, tur: "RENK" },   // Kırmızı
    { renk: [0, 255, 0], x: 120, y: 50, tur: "RENK" },  // Yeşil
    { renk: [0, 100, 255], x: 190, y: 50, tur: "RENK" }, // Mavi
    { renk: [255, 255, 0], x: 260, y: 50, tur: "RENK" }, // Sarı
    { renk: [255, 255, 255], x: 330, y: 50, tur: "RENK" }, // Beyaz
    // Silgi butonu (Sağ üst köşe)
    { renk: [0, 0, 0], x: width - 80, y: 50, tur: "TEMIZLE" } 
  ];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Ekran boyutu değişirse silgi butonunu tekrar sağa çek
  if (butonlar.length > 0) {
      butonlar[5].x = width - 80;
  }
}

function gotHands(results) {
  hands = results;
}

function draw() {
  background(30); 

  // --- GÜVENLİK KONTROLÜ ---
  if (!video.loadedmetadata) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(30);
    text("KAMERA BAŞLATILIYOR...", width/2, height/2);
    return;
  }

  // --- EKRAN AYARLARI ---
  let scaleFactor = max(width / video.width, height / video.height);
  let w = video.width * scaleFactor;
  let h = video.height * scaleFactor;
  let x = (width - w) / 2;
  let y = (height - h) / 2;

  push();
  translate(width, 0);
  scale(-1, 1);
  
  tint(150); 
  image(video, x, y, w, h);

  // --- ÇİZİM MANTIĞI ---
  if (hands.length > 0) {
    let el = hands[0];
    let parmakUcu = el.keypoints[8]; // İşaret Parmağı

    // Koordinatları Ekrana Uyarla
    let px = (parmakUcu.x * scaleFactor) + x;
    let py = (parmakUcu.y * scaleFactor) + y;

    // Çizgiye nokta ekle
    suankiCizgi.push({ x: px, y: py, renk: kalemRengi });
    
    // İmleç
    noStroke();
    fill(kalemRengi);
    circle(px, py, 20);
    noFill();
    stroke(255);
    strokeWeight(2);
    circle(px, py, 40);

  } else {
    // El kaybolursa çizgiyi bitir
    if (suankiCizgi.length > 0) {
      cizimler.push(suankiCizgi);
      suankiCizgi = [];
    }
  }
  
  // --- ÇİZİMLERİ GÖSTER ---
  for (let cizgi of cizimler) {
    cizgiCiz(cizgi);
  }
  cizgiCiz(suankiCizgi);

  pop(); // Ayna modundan çık

  // --- ARAYÜZ ---
  drawUI(scaleFactor, x, y);
}

// --- YARDIMCI FONKSİYONLAR ---

function cizgiCiz(noktalar) {
  if (noktalar.length < 2) return;
  
  noFill();
  strokeWeight(kalemKalinligi);
  beginShape();
  for (let p of noktalar) {
    stroke(p.renk); 
    vertex(p.x, p.y);
  }
  endShape();
}

function drawUI(scaleFactor, videoX, videoY) {
  // Başlık
  fill(255); noStroke(); textSize(24); textAlign(CENTER, TOP);
  text("HALKALI SANAT ATÖLYESİ", width/2, 20);
  textSize(14); text("Parmağınla renk seç ve havaya çiz!", width/2, 50);

  // Butonları Çiz
  for (let btn of butonlar) {
      if (btn.tur === "RENK") {
          fill(btn.renk); stroke(255); strokeWeight(2); circle(btn.x, btn.y, 50);
      } else {
          fill(50); stroke(255, 0, 0); circle(btn.x, btn.y, 60);
          fill(255); noStroke(); textSize(14); textAlign(CENTER, CENTER);
          text("SİL", btn.x, btn.y);
      }
  }
  
  // --- ETKİLEŞİM KONTROLÜ ---
  if (hands.length > 0) {
     let el = hands[0];
     // Ayna modundaki koordinatı düzelt
     let rawX = (el.keypoints[8].x * scaleFactor) + videoX;
     let duzX = width - rawX; // Ters çevir
     let duzY = (el.keypoints[8].y * scaleFactor) + videoY;
     
     // İmleç (Debug için - elin nerede olduğunu görelim)
     noFill(); stroke(255, 0, 0); circle(duzX, duzY, 10);

     for (let btn of butonlar) {
         if (dist(duzX, duzY, btn.x, btn.y) < 40) {
             if (btn.tur === "RENK") kalemRengi = btn.renk;
             else if (btn.tur === "TEMIZLE") { cizimler = []; suankiCizgi = []; }
             
             stroke(255); strokeWeight(5); noFill(); circle(btn.x, btn.y, 60);
         }
     }
  }
}