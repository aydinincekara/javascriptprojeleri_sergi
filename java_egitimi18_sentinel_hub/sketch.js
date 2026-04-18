let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

// --- SİBER DEĞİŞKENLER ---
let taramaCizgisiY = 0; // Yukarı aşağı giden lazer
let veriAkisi = []; // Ekranda akan kodlar
let tehditSeviyesi = 0; // 0-100 arası
let sistemDurumu = "TARANIYOR";

function preload() {
  faceMesh = ml5.faceMesh(options);
  
  // Rastgele Hex kodları üret (Süs için)
  for(let i=0; i<20; i++) {
    veriAkisi.push(generateHex());
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // HD Kamera
  video = createCapture(VIDEO);
  video.size(1280, 720);
  video.hide();
  
  faceMesh.detectStart(video, gotFaces);
  
  textFont("Courier New"); // Hacker fontu
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  background(0, 10, 15); // Koyu siber-mavi arka plan

  // --- 1. GLITCH EFEKTLİ VİDEO ---
  let scaleFactor = max(width / video.width, height / video.height);
  let w = video.width * scaleFactor;
  let h = video.height * scaleFactor;
  let x = (width - w) / 2;
  let y = (height - h) / 2;

  push();
  translate(width, 0);
  scale(-1, 1);
  
  // Renk Filtresi
  tint(50, 255, 150, 200); 
  
  // Glitch (Bozulma) Efekti
  if (random(1) < 0.05) { 
      x += random(-10, 10);
      tint(255, 50, 50, 200); // Hata anında kırmızı ol
  }
  
  image(video, x, y, w, h);
  
  // --- 2. YÜZ ANALİZİ ---
  if (faces.length > 0) {
    let face = faces[0];
    
    // Yüz Çizimi
    drawCyberFace(face, scaleFactor, x, y);
    
    // Tehdit Analizi
    analyzeThreat(face);
    
  } else {
    sistemDurumu = "HEDEF ARANIYOR...";
    tehditSeviyesi = lerp(tehditSeviyesi, 0, 0.1);
  }
  
  pop(); // Ayna modundan çık

  // --- 3. HUD ARAYÜZÜ ---
  drawHUD();
  
  // EKSİK OLAN FONKSİYON BURADA ÇAĞRILIYOR
  drawScanLine(); 
}

// --- EKSİK OLAN FONKSİYON (TARAMA ÇİZGİSİ) ---
function drawScanLine() {
    // Lazer Çizgisi
    stroke(0, 255, 255, 150);
    strokeWeight(2);
    line(0, taramaCizgisiY, width, taramaCizgisiY);
    
    // Arkasında hayalet iz bırak
    fill(0, 255, 255, 20);
    noStroke();
    rect(0, taramaCizgisiY - 20, width, 20);
    
    // Hareketi sağla
    taramaCizgisiY += 5;
    if (taramaCizgisiY > height) taramaCizgisiY = 0;
}

// --- SİBER YÜZ ÇİZİMİ ---
function drawCyberFace(face, scale, vidX, vidY) {
  noFill();
  strokeWeight(1);
  
  // 1. Çene Hattı
  stroke(0, 255, 255); 
  beginShape();
  for(let i=0; i<=32; i++) { 
     let p = face.keypoints[i];
     if(p) vertex(p.x * scale + vidX, p.y * scale + vidY);
  }
  endShape();
  
  // 2. Gözler (Nişangah)
  let solGoz = face.keypoints[159];
  let sagGoz = face.keypoints[386];
  
  if (solGoz && sagGoz) {
      drawReticle(solGoz.x * scale + vidX, solGoz.y * scale + vidY);
      drawReticle(sagGoz.x * scale + vidX, sagGoz.y * scale + vidY);
  }
  
  // 3. Yüz Kutusu (Dinamik)
  let tepe = face.keypoints[10];
  let cene = face.keypoints[152];
  let solYanak = face.keypoints[234];
  let sagYanak = face.keypoints[454];
  
  if (tepe && cene && solYanak && sagYanak) {
      let ty = tepe.y * scale + vidY;
      let cy = cene.y * scale + vidY;
      let sx = solYanak.x * scale + vidX;
      let sax = sagYanak.x * scale + vidX;
      
      stroke(255, 0, 0); // Kırmızı
      strokeWeight(2);
      
      let boxW = abs(sx - sax) * 1.2;
      let boxH = abs(ty - cy) * 1.2;
      let centerX = (sx + sax) / 2;
      let centerY = (ty + cy) / 2;
      
      let len = 30;
      // Sol Üst Köşe
      line(centerX - boxW/2, centerY - boxH/2, centerX - boxW/2 + len, centerY - boxH/2);
      line(centerX - boxW/2, centerY - boxH/2, centerX - boxW/2, centerY - boxH/2 + len);
      
      // Sağ Alt Köşe
      line(centerX + boxW/2, centerY + boxH/2, centerX + boxW/2 - len, centerY + boxH/2);
      line(centerX + boxW/2, centerY + boxH/2, centerX + boxW/2, centerY + boxH/2 - len);
  }
}

function drawReticle(x, y) {
    push();
    translate(x, y);
    rotate(frameCount * 0.1);
    noFill();
    stroke(0, 255, 0);
    strokeWeight(1);
    circle(0, 0, 30);
    line(-20, 0, 20, 0);
    line(0, -20, 0, 20);
    pop();
}

function analyzeThreat(face) {
    // Yakınlık analizi
    let sol = face.keypoints[234].x;
    let sag = face.keypoints[454].x;
    let yuzBuyuklugu = dist(sol, 0, sag, 0);
    
    let hedefTehdit = map(yuzBuyuklugu, 50, 300, 10, 100);
    hedefTehdit = constrain(hedefTehdit, 0, 100);
    tehditSeviyesi = lerp(tehditSeviyesi, hedefTehdit, 0.1);
    
    if (tehditSeviyesi > 80) sistemDurumu = "TEHLİKE: HEDEF ÇOK YAKIN";
    else if (tehditSeviyesi > 50) sistemDurumu = "ANALİZ: ŞÜPHELİ";
    else sistemDurumu = "DURUM: GÜVENLİ";
}

function drawHUD() {
    // VERİ AKIŞI (SOL)
    fill(0, 255, 0);
    textSize(12);
    textAlign(LEFT, TOP);
    let startY = 100;
    
    if (frameCount % 5 === 0) {
        veriAkisi.shift();
        veriAkisi.push(generateHex());
    }
    
    for(let i=0; i<veriAkisi.length; i++) {
        text(veriAkisi[i], 20, startY + (i*15));
    }
    
    // TEHDİT BAR (SAĞ ALT)
    let barW = 300; let barH = 20;
    let barX = width - 350; let barY = height - 100;
    
    noFill(); stroke(255); rect(barX, barY, barW, barH);
    
    noStroke();
    if (tehditSeviyesi > 80) fill(255, 0, 0);
    else if (tehditSeviyesi > 50) fill(255, 165, 0);
    else fill(0, 255, 255);
    
    let doluluk = map(tehditSeviyesi, 0, 100, 0, barW);
    rect(barX, barY, doluluk, barH);
    
    fill(255); textSize(20); textAlign(LEFT, BOTTOM);
    text("THREAT LEVEL: " + int(tehditSeviyesi) + "%", barX, barY - 10);
    
    // Yanıp Sönen Uyarı
    textAlign(CENTER, TOP); textSize(24);
    if (frameCount % 30 < 15) { 
        if (sistemDurumu.includes("TEHLİKE")) fill(255, 0, 0);
        else fill(0, 255, 255);
        text(sistemDurumu, width/2, 50);
    }
    
    drawCrosshairs();
}

function drawCrosshairs() {
    stroke(255, 100); strokeWeight(1);
    let len = 50; let pad = 30;
    // Köşe süsleri
    line(pad, pad, pad + len, pad); line(pad, pad, pad, pad + len);
    line(width-pad, pad, width-pad-len, pad); line(width-pad, pad, width-pad, pad+len);
    line(pad, height-pad, pad+len, height-pad); line(pad, height-pad, pad, height-pad-len);
    line(width-pad, height-pad, width-pad-len, height-pad); line(width-pad, height-pad, width-pad, height-pad-len);
}

function generateHex() {
    let chars = "0123456789ABCDEF";
    let hex = "0x";
    for (let i = 0; i < 8; i++) {
        hex += chars.charAt(floor(random(chars.length)));
    }
    return hex + " [ANALYZING]";
}