let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

// Veri Grafikleri için değişkenler
let agizAciklikGecmisi = [];
let grafikGenislik = 200;

function preload() {
  // Yüz Ağı modelini yükle
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // HD Kamera (Net analiz için)
  video = createCapture(VIDEO);
  video.size(1280, 720);
  video.hide();
  
  faceMesh.detectStart(video, gotFaces);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  background(10, 20, 30); // Koyu Lacivert (Hacker/Sci-Fi teması)

  // --- GÖRÜNTÜ AYARLARI ---
  let scaleFactor = max(width / video.width, height / video.height);
  let w = video.width * scaleFactor;
  let h = video.height * scaleFactor;
  let x = (width - w) / 2;
  let y = (height - h) / 2;

  push();
  translate(width, 0);
  scale(-1, 1);
  
  // Matrix Efekti: Videoyu yeşilimsi yap
  tint(100, 255, 200, 150); 
  image(video, x, y, w, h);

  // --- YÜZ ANALİZİ VE ÇİZİMİ ---
  if (faces.length > 0) {
    let face = faces[0];
    
    // 1. Yüz Ağını Çiz (Mesh)
    drawFaceMesh(face, scaleFactor, x, y);
    
    // 2. Biyometrik Verileri Hesapla
    let analizVerisi = calculateBiometrics(face, scaleFactor, x, y);
    
    // Ayna modundan çık (Yazıları düz yazmak için)
    pop();
    
    // 3. HUD ARAYÜZÜ (Veri Panelleri)
    drawHUD(analizVerisi);
    
  } else {
    pop();
    // Yüz aranıyor ekranı
    drawSearching();
  }
}

// --- YÜZ AĞI ÇİZİMİ ---
function drawFaceMesh(face, scale, vidX, vidY) {
  // Tüm noktaları (468 nokta) küçük, siber noktalar olarak çiz
  strokeWeight(2);
  
  for (let i = 0; i < face.keypoints.length; i++) {
    let p = face.keypoints[i];
    let px = (p.x * scale) + vidX;
    let py = (p.y * scale) + vidY;
    
    // Bazı noktaları özel renklendir (Gözler, Dudaklar)
    if (i === 13 || i === 14) { // Dudak ortası
         stroke(255, 0, 0); // Kırmızı
    } else {
         stroke(0, 255, 255, 100); // Camgöbeği (Cyan)
    }
    point(px, py);
  }
  
  // Yüzün etrafına bir "Hedefleme Karesi"
  let box = face.box; // ml5 yüzün kutusunu verir (xmin, ymin, width, height)
  // Kutuyu manuel hesaplayalım (bazı sürümlerde box gelmeyebilir)
  // Basitçe: En sol, en sağ, en üst, en alt noktaları bulup kutu çizmek daha garantidir ama
  // şimdilik görsel efekt olarak sadece merkeze odaklanalım.
}

// --- MATEMATİKSEL ANALİZ ---
function calculateBiometrics(face, scale, vidX, vidY) {
  // Dudak Açıklığı Hesabı
  // Üst dudak (13) ve Alt dudak (14) arasındaki mesafe
  let ustDudak = face.keypoints[13];
  let altDudak = face.keypoints[14];
  
  // Öklid Mesafesi (Mühendislik Hesabı)
  let mesafe = dist(ustDudak.x, ustDudak.y, altDudak.x, altDudak.y);
  
  // Grafiğe ekle
  agizAciklikGecmisi.push(mesafe);
  if (agizAciklikGecmisi.length > grafikGenislik) {
    agizAciklikGecmisi.shift(); // En eski veriyi at
  }
  
  return {
    agizAciklik: mesafe,
    kafaX: face.keypoints[1].x, // Burun ucu X
    kafaY: face.keypoints[1].y  // Burun ucu Y
  };
}

// --- ARAYÜZ (HUD) ---
function drawHUD(veri) {
  // Sol Panel: Sistem Durumu
  fill(0, 0, 0, 200);
  stroke(0, 255, 255);
  strokeWeight(2);
  rect(20, 20, 300, 150);
  
  noStroke();
  fill(0, 255, 255);
  textSize(20); textAlign(LEFT, TOP);
  text("SİSTEM: ÇEVRİMİÇİ", 35, 35);
  
  textSize(14); fill(200);
  text("Hedef Taranıyor...", 35, 65);
  text("Poligon Sayısı: 468", 35, 85);
  text("İşlemci: NÖRAL AĞ (GPU)", 35, 105);
  
  // Sağ Panel: Canlı Veri Grafiği (EKG gibi)
  let panelX = width - 320;
  fill(0, 0, 0, 200);
  stroke(0, 255, 255);
  rect(panelX, 20, 300, 150);
  
  fill(0, 255, 255);
  text("SES/KONUŞMA ANALİZİ", panelX + 15, 35);
  
  // Grafiği Çiz
  noFill();
  stroke(0, 255, 0);
  strokeWeight(2);
  beginShape();
  for (let i = 0; i < agizAciklikGecmisi.length; i++) {
    // Veriyi panele sığdır
    let val = agizAciklikGecmisi[i];
    let y = map(val, 0, 50, 150, 50); // 0-50 arası açıklığı panel yüksekliğine eşle
    vertex(panelX + 15 + i, 20 + y);
  }
  endShape();
  
  // Alt Bilgi
  textAlign(CENTER, BOTTOM);
  fill(0, 255, 255);
  textSize(16);
  text("HALKALI BİYOMETRİK VERİ LABORATUVARI", width/2, height - 20);
  
  // Reticle (Nişangah - Burun Ucunda)
  // Veriyi analizden aldığımız için tekrar ters çevirmemiz lazım (Ayna modu iptal olmuştu)
  // Burası biraz karışık olabilir, basitçe ekranın ortasına sabit bir nişangah çizelim.
  stroke(255, 0, 0, 150);
  strokeWeight(1);
  line(width/2 - 50, height/2, width/2 + 50, height/2);
  line(width/2, height/2 - 50, width/2, height/2 + 50);
  noFill();
  circle(width/2, height/2, 200);
}

function drawSearching() {
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(255, 0, 0);
  text("HEDEF ARANIYOR...", width/2, height/2);
  
  noFill();
  stroke(255, 0, 0);
  strokeWeight(4);
  rect(width/2 - 200, height/2 - 100, 400, 200);
}