let video;

// Çözünürlük Ayarı (Daha küçük sayı = Daha çok detay ama daha yavaş bilgisayar)
let stepSize = 12; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Kamerayı başlat
  video = createCapture(VIDEO);
  video.size(640, 480); // İşlemciyi yormamak için video küçük kalsın
  video.hide();
  
  noStroke(); // Çizgileri kaldır, sadece renkli şekiller olsun
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0); // Arka plan simsiyah (Sinematik etki)
  
  // Videonun piksellerini "Okunabilir" hale getir
  video.loadPixels();
  
  // --- MATEMATİKSEL ORANTILAMA ---
  // Küçük videoyu (640x480) dev ekrana yaymak için oranları buluyoruz
  let scaleX = width / video.width;
  let scaleY = height / video.height;
  
  // Ayna etkisi için sahneyi çevir
  push();
  translate(width, 0);
  scale(-1, 1);

  // --- PİKSEL DÖNGÜSÜ ---
  // Ekrandaki her pikseli tek tek gezmek yerine, "stepSize" kadar atlayarak geziyoruz.
  // y += stepSize: Satır satır atlayarak git
  // x += stepSize: Sütun sütun atlayarak git
  for (let y = 0; y < video.height; y += stepSize) {
    for (let x = 0; x < video.width; x += stepSize) {
      
      // 1. Bu pikselin rengini ve parlaklığını bul
      // (Burası biraz teknik, p5.js'in piksel dizisinden veri okuyoruz)
      let index = (y * video.width + x) * 4;
      let r = video.pixels[index];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];
      
      // Parlaklık hesapla (Gözün algıladığı formül: 0.299R + 0.587G + 0.114B)
      let parlaklik = (r + g + b) / 3;
      
      // 2. Eğer piksel çok karanlıksa çizme (Tasarruf et ve siyah arka plan kalsın)
      if (parlaklik > 20) {
        
        // 3. Şeklin Rengini Belirle
        fill(r, g, b, 200); // Biraz şeffaflık ekle (Sanatsal olsun)
        
        // 4. Şeklin Boyutunu Parlaklığa Göre Ayarla
        // Parlak yerler BÜYÜK daire, karanlık yerler KÜÇÜK daire olsun
        let cap = map(parlaklik, 0, 255, 0, stepSize * 1.5);
        
        // 5. Çizimi Yap (Koordinatları ekrana göre büyüt)
        // Daire yerine 'rect' yazarsan mozaik kareler olur
        circle(x * scaleX, y * scaleY, cap);
      }
    }
  }
  pop();
  
  // --- ARAYÜZ (Kodu yazan sensin, imzanı at) ---
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text("DİJİTAL AYNA: " + int(frameRate()) + " FPS", 20, 20);
}