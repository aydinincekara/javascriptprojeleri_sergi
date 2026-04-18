let handPose;
let video;
let hands = [];

// Panayır havası için bir "Tarama Çizgisi" değişkeni
let taramaY = 0; 

function preload() {
  // Yapay zeka modelini önceden yüklüyoruz
  handPose = ml5.handPose();
}

function setup() {
  // HTML'deki pencereye tam otursun diye
  createCanvas(640, 480);
  
  // Kamerayı başlat
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); // Orijinal ham videoyu gizle, biz işlenmiş halini çizeceğiz

  // Takibi başlat
  handPose.detectStart(video, gotHands);
}

function gotHands(results) {
  hands = results;
}

function draw() {
  background(0); // Arka planı temizle

  // --- 1. VİDEOYU AYNA GİBİ ÇİZMEK ---
  push();
  translate(width, 0); // Tuvali sağa kaydır
  scale(-1, 1); // Yatayda ters çevir (Ayna efekti)
  // Videoyu biraz soluk çizelim ki neonlar parlasın (tint)
  tint(255, 200); 
  image(video, 0, 0, width, height);
  
  // --- 2. EL TAKİBİ VE ÇİZİM ---
  if (hands.length > 0) {
    let el = hands[0];

    // Tüm parmak boğumlarını gez
    for (let i = 0; i < el.keypoints.length; i++) {
      let nokta = el.keypoints[i];
      
      // Neon Efekti: Önce kalın bulanık bir daire, sonra içi parlak beyaz
      noStroke();
      
      // Dış parlama (Glow)
      fill(0, 255, 0, 100); // Yarı şeffaf yeşil
      circle(nokta.x, nokta.y, 20);
      
      // İç çekirdek
      fill(255); // Beyaz
      circle(nokta.x, nokta.y, 8);
    }
    
    // İşaret parmağı ile Baş parmak arasına çizgi çek (Etkileşim çizgisi)
    let p8 = el.keypoints[8]; // İşaret
    let p4 = el.keypoints[4]; // Baş
    
    stroke(0, 255, 255); // Turkuaz Çizgi
    strokeWeight(4);
    line(p8.x, p8.y, p4.x, p4.y);
  }
  
  pop(); // Ayna etkisini bitir

  // --- 3. SİBER ARAYÜZ SÜSLERİ (HUD) ---
  // Yukarıdan aşağı inen tarama çizgisi
  stroke(0, 255, 255, 150);
  strokeWeight(2);
  line(0, taramaY, width, taramaY);
  
  taramaY += 2; // Çizgiyi aşağı indir
  if (taramaY > height) taramaY = 0; // Sona gelince başa sar

  // Köşeye yazı yaz
  fill(0, 255, 0);
  noStroke();
  textSize(16);
  text("SİSTEM AKTİF: KAMERA_01", 20, 30);
  text("EL TAKİBİ: " + (hands.length > 0 ? "AÇIK" : "ARANIYOR..."), 20, 50);
}