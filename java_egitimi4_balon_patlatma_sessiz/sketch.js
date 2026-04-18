let handPose;
let video;
let hands = [];
let balonlar = [];
let skor = 0;

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  // Tam ekran tuval
  createCanvas(windowWidth, windowHeight);
  
  // Kamerayı HD olarak başlat
  video = createCapture(VIDEO);
  video.size(1280, 720);
  video.hide();
  
  handPose.detectStart(video, gotHands);
  
  // Balonları üret
  for (let i = 0; i < 10; i++) {
    balonlar.push(new Balon());
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotHands(results) {
  hands = results;
}

function draw() {
  background(0); 

  // --- PROFESYONEL GÖRÜNTÜ ORANTILAMA MATEMATİĞİ ---
  // Amacımız: Videoyu bozmadan ekranı doldurmak (Object-Fit: Cover)
  
  // 1. Ölçekleme Katsayısını Bul (Ekran mı daha geniş, Video mu?)
  let scaleFactor = max(width / video.width, height / video.height);
  
  // 2. Yeni Video Boyutlarını Hesapla
  let yeniGenislik = video.width * scaleFactor;
  let yeniYukseklik = video.height * scaleFactor;
  
  // 3. Videoyu Ortalamak için Koordinatları Hesapla (Center Align)
  let videoX = (width - yeniGenislik) / 2;
  let videoY = (height - yeniYukseklik) / 2;

  // --- ÇİZİME BAŞLA ---
  push();
  
  // Ayna Efekti için sahneyi ters çeviriyoruz
  translate(width, 0);
  scale(-1, 1);
  
  // Videoyu hesapladığımız kusursuz boyutlarda çiz
  // tint(255, 255); // Tam parlaklık (İstersen açabilirsin)
  image(video, videoX, videoY, yeniGenislik, yeniYukseklik);

  // --- EL KOORDİNATLARINI DÜZELTME ---
  // Video artık sündürülmediği için, elin konumu da kaydı.
  // Elin ham koordinatlarını da aynı matematik ile dönüştürmeliyiz.
  
  let parmakX = 0;
  let parmakY = 0;
  let elVar = false;

  if (hands.length > 0) {
    let el = hands[0];
    
    // ml5'ten gelen ham veri
    let hamX = el.keypoints[8].x; 
    let hamY = el.keypoints[8].y;
    
    // Ham veriyi, yeni video boyutlarına göre uyarla
    // Formül: (Ham Veri * Büyütme Oranı) + Kaydırma Miktarı
    // Ayna modunda olduğumuz için X koordinatını özel bir formülle çeviriyoruz:
    // Aynalanmış ekranda koordinat hizalaması:
    
    // Burada videoX'i ters mantıkla düşüneceğiz çünkü scale(-1, 1) yaptık.
    // En temiz yöntem: Görseli ayna modunda çizdik ama koordinatı manuel hesaplayalım.
    
    // Aynalanmış dünyada çizim koordinatları:
    parmakX = (hamX * scaleFactor) + videoX; 
    parmakY = (hamY * scaleFactor) + videoY;
    
    elVar = true;

    // Nişangah
    fill(255, 0, 0); 
    noStroke();
    circle(parmakX, parmakY, 20);
    
    // Hedef halkası
    noFill();
    stroke(255, 255, 0);
    strokeWeight(3);
    circle(parmakX, parmakY, 50);
  }

  // --- BALONLARI YÖNET ---
  // Balonlar da artık aynalanmış (mirrored) dünyada yaşıyor
  for (let i = balonlar.length - 1; i >= 0; i--) {
    let b = balonlar[i];
    b.hareketEt();
    b.ciz();

    if (elVar) {
      let mesafe = dist(parmakX, parmakY, b.x, b.y);
      if (mesafe < b.cap / 1.5) {
        balonlar.splice(i, 1);
        skor++;
        balonlar.push(new Balon());
        
        // Vurulma efekti (Basit bir parlama)
        fill(255, 255, 255, 150);
        circle(b.x, b.y, b.cap * 1.5);
      }
    }
    
    if (b.y > height + 100) {
      balonlar.splice(i, 1);
      skor = max(0, skor - 1);
      balonlar.push(new Balon());
    }
  }
  
  pop(); // Ayna modundan çık

  // --- ARAYÜZ (HUD) ---
  // Burası aynalanmamış, düz dünya. Yazılar düzgün okunur.
  fill(255);
  stroke(0);
  strokeWeight(4);
  textSize(40);
  textAlign(LEFT, TOP);
  text("SKOR: " + skor, 30, 30);
  
  // Panayır logosu veya başlığı ekleyebilirsin
  textSize(20);
  fill(0, 255, 255);
  noStroke();
  text("ZONE A: BALON AVCISI", 30, 80);
}

class Balon {
  constructor() {
    // Balonların ekranın tamamına (video dışı siyah alanlar kalırsa oraya da) yayılmasını engellemek için
    // width ve height kullanıyoruz ama videoX sınırlarına dikkat etmeliyiz.
    // Şimdilik tüm ekrana yayılsınlar, daha eğlenceli.
    this.x = random(50, width - 50); 
    this.y = random(-height, -100);
    this.cap = random(50, 100); 
    this.hiz = random(3, 8); 
    
    this.r = random(100, 255);
    this.g = random(50, 200);
    this.b = random(150, 255);
  }

  hareketEt() {
    this.y += this.hiz;
  }

  ciz() {
    // Balonun gövdesi
    fill(this.r, this.g, this.b, 200);
    noStroke();
    circle(this.x, this.y, this.cap);
    
    // Işık yansıması (Daha 3D görünüm)
    fill(255, 100);
    circle(this.x - this.cap/4, this.y - this.cap/4, this.cap/3);
    
    // İp
    stroke(255, 100);
    strokeWeight(2);
    line(this.x, this.y + this.cap/2, this.x, this.y + this.cap/2 + 20);
  }
}