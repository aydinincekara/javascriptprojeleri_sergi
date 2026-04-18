let bodyPose;
let video;
let poses = [];

// Hareket Sayacı Değişkenleri
let tekrarSayisi = 0;
let durum = "ASAGI"; // Kolun durumu: "YUKARI" veya "ASAGI"
let sonAci = 0; // Ekrana yazdırmak için

function preload() {
  // Vücut takip modelini yükle (MoveNet)
  bodyPose = ml5.bodyPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  bodyPose.detectStart(video, gotPoses);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotPoses(results) {
  poses = results;
}

function draw() {
  background(20); // Laboratuvar grisi

  // --- MÜHENDİSLİK ARAYÜZÜ ---
  // Ekranı ortala ve videoyu çiz
  let scaleFactor = max(width / video.width, height / video.height);
  let yeniGenislik = video.width * scaleFactor;
  let yeniYukseklik = video.height * scaleFactor;
  let videoX = (width - yeniGenislik) / 2;
  let videoY = (height - yeniYukseklik) / 2;

  push();
  translate(width, 0);
  scale(-1, 1);
  tint(200); // Hafif karanlık yap ki iskelet parlasın
  image(video, videoX, videoY, yeniGenislik, yeniYukseklik);
  
  if (poses.length > 0) {
    let pose = poses[0];

    // --- 1. İSKELET ÇİZİMİ (Wireframe) ---
    // Tüm eklem noktalarını (Keypoints) gez ve çiz
    for (let i = 0; i < pose.keypoints.length; i++) {
      let nokta = pose.keypoints[i];
      // Güvenilirlik kontrolü (Yapay zeka eminse çizsin)
      if (nokta.confidence > 0.1) {
        let px = (nokta.x * scaleFactor) + videoX;
        let py = (nokta.y * scaleFactor) + videoY;
        
        fill(0, 255, 255);
        noStroke();
        circle(px, py, 10);
      }
    }
    
    // --- 2. AÇI HESAPLAMA (Mühendislik Kısmı) ---
    // Sağ Kol: Omuz(6) - Dirsek(8) - Bilek(10)
    // Bu noktaların numaraları standarttır.
    
    let omuz = pose.keypoints[6];
    let dirsek = pose.keypoints[8];
    let bilek = pose.keypoints[10];

    // Noktalar ekranda görünüyor mu?
    if (omuz.confidence > 0.1 && dirsek.confidence > 0.1 && bilek.confidence > 0.1) {
        
        // Koordinatları düzelt
        let ax = (omuz.x * scaleFactor) + videoX;
        let ay = (omuz.y * scaleFactor) + videoY;
        let bx = (dirsek.x * scaleFactor) + videoX;
        let by = (dirsek.y * scaleFactor) + videoY;
        let cx = (bilek.x * scaleFactor) + videoX;
        let cy = (bilek.y * scaleFactor) + videoY;

        // Çizgileri Çek (Kemikler)
        stroke(0, 255, 0);
        strokeWeight(6);
        line(ax, ay, bx, by); // Omuz-Dirsek
        line(bx, by, cx, cy); // Dirsek-Bilek
        
        // AÇIYI HESAPLA (Fonksiyon aşağıda)
        let aci = aciHesapla(ax, ay, bx, by, cx, cy);
        sonAci = int(aci); // Virgülden kurtul
        
        // Açı Metni (Dirseğin yanına yaz)
        push();
        translate(bx, by);
        scale(-1, 1); // Yazıyı düzelt
        fill(255);
        noStroke();
        textSize(20);
        text(int(aci) + "°", 20, 0);
        pop();
        
        // --- 3. TEKRAR SAYMA MANTIĞI (State Machine) ---
        // Kol tamamen açıksa (Açı > 160) -> Durum "ASAGI"
        // Kol tamamen kapalıysa (Açı < 30) -> Durum "YUKARI" ve SAYACI ARTIR
        
        if (aci > 160) {
            durum = "ASAGI";
        }
        
        if (aci < 40 && durum === "ASAGI") {
            durum = "YUKARI";
            tekrarSayisi++;
            // Başarı Sesi veya Efekti eklenebilir
        }
        
        // Görsel Bar (Açıyı gösteren bar)
        let barYukseklik = map(aci, 0, 180, 0, 100);
        noStroke();
        fill(255, 0, 0);
        rect(bx - 60, by, 10, -barYukseklik); // Ters çiz
    }
  }
  pop();

  // --- ARAYÜZ (HUD) ---
  // Sol üst köşe bilgi paneli
  fill(0, 0, 0, 150);
  noStroke();
  rect(20, 20, 300, 150, 20);
  
  fill(0, 255, 0);
  textSize(24);
  textAlign(LEFT, TOP);
  text("AI SPOR ANALİZİ v1.0", 40, 40);
  
  fill(255);
  textSize(18);
  text("Hareket: Sağ Kol Curl", 40, 80);
  text("Anlık Açı: " + sonAci + "°", 40, 105);
  
  // Dev Skor
  textAlign(RIGHT, TOP);
  textSize(80);
  fill(0, 255, 255);
  text(tekrarSayisi, width - 40, 20);
  textSize(20);
  fill(200);
  text("TEKRAR", width - 40, 100);
  
  // Alt bilgi
  textAlign(CENTER, BOTTOM);
  fill(150);
  text("Kamera karşısına geçin ve sağ kolunuzu kaldırıp indirin.", width/2, height - 20);
}

// --- TRİGONOMETRİ FONKSİYONU ---
// Üç nokta arasındaki açıyı bulur (Matematiksel Büyü)
function aciHesapla(ax, ay, bx, by, cx, cy) {
  // İki vektör arasındaki açıyı atan2 fonksiyonu ile buluyoruz
  let radyan = Math.atan2(cy - by, cx - bx) - Math.atan2(ay - by, ax - bx);
  let derece = Math.abs(radyan * 180.0 / Math.PI);
  
  if (derece > 180.0) {
    derece = 360 - derece;
  }
  return derece;
}