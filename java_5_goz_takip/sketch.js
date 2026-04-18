let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

function preload() {
  // Yüz ağını (FaceMesh) yüklüyoruz. 
  // refineLandmarks: true -> Bu ayar Göz Bebeklerini (İris) bulmayı açar.
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // Yüz takibini başlat
  faceMesh.detectStart(video, gotFaces);
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  // Videoyu Ayna (Mirror) modunda çiz
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);

  if (faces.length > 0) {
    let face = faces[0];

    // --- TEKNİK BİLGİ ---
    // FaceMesh modelinde 468 tane nokta vardır.
    // Sol Göz Bebeği Merkezi: 468. nokta
    // Sağ Göz Bebeği Merkezi: 473. nokta
    
    let solGoz = face.keypoints[468];
    let sagGoz = face.keypoints[473];

    // Gözleri Bulduysak Çizime Başla
    if (solGoz && sagGoz) {
      
      // 1. Göz Bebeklerine "Target" (Hedef) Çiz
      drawTarget(solGoz.x, solGoz.y);
      drawTarget(sagGoz.x, sagGoz.y);

      // 2. İki göz arasına bir çizgi çek (Analiz Çizgisi)
      stroke(0, 255, 0); // Matriks Yeşili
      strokeWeight(2);
      line(solGoz.x, solGoz.y, sagGoz.x, sagGoz.y);

      // 3. Bakış Yönü (Basit Lazer)
      // Kafanı çevirdiğinde lazerler de döner
      drawLaser(solGoz.x, solGoz.y);
      drawLaser(sagGoz.x, sagGoz.y);
      
      // 4. Koordinatları Ekrana Yaz (Videodaki gibi data)
      noStroke();
      fill(0, 255, 0);
      textSize(16);
      // Yazıyı ters çevirme işlemi (ayna modundan çıkıp yazmak için)
      push();
      scale(-1, 1);
      text("X: " + floor(solGoz.x) + " Y: " + floor(solGoz.y), -solGoz.x + 20, solGoz.y + 50);
      pop();
    }
  }
  pop();
}

// Havalı bir hedef dairesi çizen fonksiyon
function drawTarget(x, y) {
  noFill();
  stroke(0, 255, 255); // Cam Göbeği
  strokeWeight(2);
  circle(x, y, 20); // Göz bebeği dairesi
  
  stroke(255, 0, 100); // Pembe
  strokeWeight(1);
  circle(x, y, 40); // Dış halka
}

// Gözden çıkan lazer çizgisi
function drawLaser(x, y) {
  stroke(255, 255, 0, 150); // Yarı şeffaf sarı
  strokeWeight(4);
  // Aşağı doğru uzanan bir lazer efekti
  line(x, y, x, height); 
}

