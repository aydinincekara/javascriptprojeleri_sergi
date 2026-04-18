let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

// --- FARE KONTROL DEĞİŞKENLERİ ---
let imlecX = 0;
let imlecY = 0;
// Yumuşatma (Titremeyi önlemek için)
let hedefX = 0;
let hedefY = 0;

// --- OYUN DEĞİŞKENLERİ ---
let butonX, butonY, butonR = 60; // Hedefin konumu
let skor = 0;
let tiklamaSayaci = 0; // Göz kırpma süresi
let gozKirptiMi = false;

function preload() {
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // HD Kamera (Hassasiyet için önemli)
  video = createCapture(VIDEO);
  video.size(1280, 720);
  video.hide();
  
  faceMesh.detectStart(video, gotFaces);
  
  // İlk hedefi rastgele koy
  hedefTasi();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  background(30);

  // --- 1. GÖRÜNTÜ (AYNA MODU) ---
  let scaleFactor = max(width / video.width, height / video.height);
  let w = video.width * scaleFactor;
  let h = video.height * scaleFactor;
  let x = (width - w) / 2;
  let y = (height - h) / 2;

  push();
  translate(width, 0);
  scale(-1, 1);
  tint(100); // Arka planı biraz karart ki imleç parlasın
  image(video, x, y, w, h);
  pop();

  // --- 2. HEDEFİ ÇİZ ---
  drawTarget();

  // --- 3. YÜZ TAKİBİ VE FARE MANTIĞI ---
  if (faces.length > 0) {
    let face = faces[0];
    
    // BURUN UCU (1. Nokta)
    let burun = face.keypoints[1];
    
    // Koordinatları ekrana uyarla (Ayna modu tersliği burada düzeltiliyor)
    let hamX = width - ((burun.x * scaleFactor) + x); 
    let hamY = (burun.y * scaleFactor) + y;
    
    // --- HASSASİYET AYARI (MAPPING) ---
    // Kafanı çok az çevirsen bile imleç ekranın ucuna gidebilmeli.
    // Ekranın ortasındaki 200 piksellik alanı tüm ekrana yayıyoruz.
    let zoneW = 300; 
    let zoneH = 200;
    
    let mapX = map(hamX, width/2 - zoneW, width/2 + zoneW, 0, width);
    let mapY = map(hamY, height/2 - zoneH, height/2 + zoneH, 0, height);
    
    // Sınırların dışına çıkmasın
    mapX = constrain(mapX, 0, width);
    mapY = constrain(mapY, 0, height);
    
    // --- YUMUŞATMA (SMOOTHING) ---
    // İmleç yağ gibi kaysın diye lerp kullanıyoruz
    imlecX = lerp(imlecX, mapX, 0.1);
    imlecY = lerp(imlecY, mapY, 0.1);
    
    // --- GÖZ KIRPMA TESPİTİ (BLINK) ---
    let solGozUst = face.keypoints[159];
    let solGozAlt = face.keypoints[145];
    let sagGozUst = face.keypoints[386];
    let sagGozAlt = face.keypoints[374];
    
    // Göz açıklığı mesafesi
    let solAciklik = dist(solGozUst.x, solGozUst.y, solGozAlt.x, solGozAlt.y);
    let sagAciklik = dist(sagGozUst.x, sagGozUst.y, sagGozAlt.x, sagGozAlt.y);
    
    // Eşik değer (Kameraya uzaklığına göre değişebilir ama 10-12 genelde iyidir)
    // Eğer gözler kapalıysa mesafe küçülür.
    let blinkThreshold = 12; 
    
    if (solAciklik < blinkThreshold && sagAciklik < blinkThreshold) {
        if (!gozKirptiMi) {
            tiklamaYap(); // Sadece ilk kapandığı an tıkla
            gozKirptiMi = true;
        }
        
        // Görsel geri bildirim (Kırpınca ekran hafif beyazlasın)
        fill(255, 50); noStroke(); rect(0,0,width,height);
        
    } else {
        gozKirptiMi = false;
    }

    // --- İMLECİ ÇİZ ---
    drawCursor(imlecX, imlecY, gozKirptiMi);
    
  } else {
      // Yüz yoksa uyarı
      fill(255, 0, 0); textAlign(CENTER); textSize(30);
      text("YÜZ BULUNAMADI - KAMERAYA BAKIN", width/2, height/2);
  }
  
  // Arayüz Bilgileri
  drawUI();
}

function drawCursor(x, y, tiklaniyor) {
    noFill();
    strokeWeight(3);
    
    if (tiklaniyor) {
        stroke(0, 255, 0); // Tıklayınca Yeşil
        fill(0, 255, 0, 100);
        circle(x, y, 40); // Küçülen daire
    } else {
        stroke(0, 255, 255); // Normalde Mavi
        circle(x, y, 50);
        
        // Nişangah çizgileri
        line(x - 40, y, x + 40, y);
        line(x, y - 40, x, y + 40);
    }
    
    // Merkez nokta
    fill(255); noStroke(); circle(x, y, 5);
}

function drawTarget() {
    // Hedef Butonu
    noStroke();
    
    // Mesafe kontrolü (İmleç butonun üzerinde mi?)
    let d = dist(imlecX, imlecY, butonX, butonY);
    
    if (d < butonR) {
        // Üzerine gelince parlasın
        fill(255, 100, 100); // Açık Kırmızı
        
        // Eğer üzerine gelmişken GÖZ KIRPARSA
        if (gozKirptiMi) {
            hedefVuruldu();
        }
    } else {
        fill(200, 0, 0); // Koyu Kırmızı
    }
    
    circle(butonX, butonY, butonR * 2);
    
    // Hedef Halkaları
    stroke(255); noFill(); strokeWeight(2);
    circle(butonX, butonY, butonR * 1.5);
    circle(butonX, butonY, butonR * 0.5);
}

function hedefVuruldu() {
    skor++;
    hedefTasi();
}

function tiklamaYap() {
    // Tıklama anında yapılacak diğer işlemler
    // Şimdilik sadece hedef kontrolü draw içinde yapılıyor
}

function hedefTasi() {
    // Kenarlardan biraz içeride rastgele bir yer
    let margin = 100;
    butonX = random(margin, width - margin);
    butonY = random(margin, height - margin);
}

function drawUI() {
    // Üst Bilgi Barı
    fill(0, 0, 0, 150); noStroke();
    rect(0, 0, width, 80);
    
    fill(0, 255, 255);
    textSize(24); textAlign(LEFT, TOP);
    text("BİYONİK GÖZ FARESİ", 20, 20);
    
    textSize(14); fill(200);
    text("Kafanı çevirerek nişan al, GÖZ KIRPARAK ateş et.", 20, 50);
    
    // Skor
    fill(255); textAlign(RIGHT, TOP);
    textSize(40);
    text("SKOR: " + skor, width - 20, 20);
}