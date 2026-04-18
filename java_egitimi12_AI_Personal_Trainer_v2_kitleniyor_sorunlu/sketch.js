let bodyPose;
let video;
let poses = [];

// İstatistikler
let sagRep = 0; let solRep = 0;
let sagDurum = "ASAGI"; let solDurum = "ASAGI";
let sagAci = 0; let solAci = 0;
let sagMesaj = "Hazır"; let solMesaj = "Hazır";

// HIZ AYARI: "MULTIPOSE_LIGHTNING" en hızlı modeldir.
let options = {
  modelType: "MULTIPOSE_LIGHTNING",
  enableSmoothing: true,
  minPoseConfidence: 0.2
};

function preload() {
  bodyPose = ml5.bodyPose(options);
}

function setup() {
  // Tam ekran yapalım
  createCanvas(windowWidth, windowHeight);
  
  // --- KRİTİK DEĞİŞİKLİK ---
  // Kamerayı bir boyuta zorlamıyoruz. Bırakalım doğal açılsın.
  video = createCapture(VIDEO);
  video.hide();
  
  // Takibi başlat
  bodyPose.detectStart(video, gotPoses);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotPoses(results) {
  poses = results;
}

function draw() {
  background(20);

  // Video hazır değilse çizme (Hata önleyici)
  if (!video.loadedmetadata) {
    fill(255); textAlign(CENTER); textSize(20);
    text("Kamera Başlatılıyor...", width/2, height/2);
    return;
  }

  // --- EKRANA OTURTMA (SCALE) ---
  let scaleFactor = max(width / video.width, height / video.height);
  let w = video.width * scaleFactor;
  let h = video.height * scaleFactor;
  let x = (width - w) / 2;
  let y = (height - h) / 2;

  push();
  translate(width, 0);
  scale(-1, 1);
  tint(200); 
  image(video, x, y, w, h);

  if (poses.length > 0) {
    let pose = poses[0];
    
    // Sağ ve Sol Kol Analizi
    analyzeArm(pose, 6, 8, 10, "SAG", scaleFactor, x, y);
    analyzeArm(pose, 5, 7, 9, "SOL", scaleFactor, x, y);
    
    // Hedef Karesi
    let burun = pose.keypoints[0];
    if(burun.confidence > 0.2) {
       let nx = (burun.x * scaleFactor) + x;
       let ny = (burun.y * scaleFactor) + y;
       noFill(); stroke(0, 255, 255, 50); strokeWeight(2);
       rectMode(CENTER); rect(nx, ny, 80, 100);
    }
  }
  pop();
  
  // Arayüz
  drawHUD();
  
  // FPS Göstergesi (Debug)
  fill(0, 255, 0); textSize(14); textAlign(LEFT, BOTTOM);
  text("FPS: " + int(frameRate()), 10, height - 10);
}

function analyzeArm(pose, omuzId, dirsekId, bilekId, taraf, scale, vidX, vidY) {
  let omuz = pose.keypoints[omuzId];
  let dirsek = pose.keypoints[dirsekId];
  let bilek = pose.keypoints[bilekId];

  if (omuz.confidence > 0.2 && dirsek.confidence > 0.2 && bilek.confidence > 0.2) {
    
    let ax = (omuz.x * scale) + vidX;
    let ay = (omuz.y * scale) + vidY;
    let bx = (dirsek.x * scale) + vidX;
    let by = (dirsek.y * scale) + vidY;
    let cx = (bilek.x * scale) + vidX;
    let cy = (bilek.y * scale) + vidY;

    let hamAci = calculateAngle(ax, ay, bx, by, cx, cy);
    
    if (taraf === "SAG") sagAci = lerp(sagAci, hamAci, 0.3);
    else solAci = lerp(solAci, hamAci, 0.3);
    
    let guncelAci = (taraf === "SAG") ? sagAci : solAci;

    // Mantık
    let durum = (taraf === "SAG") ? sagDurum : solDurum;
    let mesaj = "";
    let renk = color(255);

    if (guncelAci > 140) { durum = "ASAGI"; mesaj = "Hazır"; renk = color(0, 255, 255); }
    else if (guncelAci < 60 && durum === "ASAGI") { durum = "YUKARI"; mesaj = "SÜPER!"; renk = color(0, 255, 0); 
        if(taraf === "SAG") sagRep++; else solRep++; 
    }
    else if (guncelAci < 140 && guncelAci > 60) { mesaj = "Çek..."; renk = color(255, 200, 0); }

    if (taraf === "SAG") { sagDurum = durum; sagMesaj = mesaj; } else { solDurum = durum; solMesaj = mesaj; }

    // Çizim
    strokeWeight(6); stroke(renk);
    line(ax, ay, bx, by); line(bx, by, cx, cy);
    fill(20); noStroke(); circle(bx, by, 15);
    
    // Grafik
    push(); translate(bx, by);
    noFill(); stroke(50); strokeWeight(6); arc(0, 0, 70, 70, 0, TWO_PI);
    stroke(renk); 
    rotate(-PI/2);
    let doluluk = map(guncelAci, 180, 30, 0, TWO_PI * 0.75);
    arc(0, 0, 70, 70, 0, doluluk);
    pop();
    
    push(); translate(bx, by); scale(-1, 1);
    fill(255); noStroke(); textSize(14); textAlign(CENTER);
    text(int(guncelAci), 0, 55); pop();
  }
}

function drawHUD() {
  drawPanel(20, 20, "SOL KOL", solRep, solMesaj, solAci);
  drawPanel(width - 220, 20, "SAĞ KOL", sagRep, sagMesaj, sagAci);
  textAlign(CENTER, BOTTOM); fill(150); textSize(12);
  text("HALKALI GENÇLİK MERKEZİ - SPOR LAB", width/2, height - 10);
}

function drawPanel(x, y, baslik, skor, mesaj, aci) {
  fill(0, 0, 0, 180); stroke(0, 255, 255); strokeWeight(2);
  rectMode(CORNER); rect(x, y, 200, 120, 10);
  noStroke(); fill(0, 255, 255); textSize(18); textAlign(LEFT, TOP);
  text(baslik, x + 10, y + 10);
  fill(255); textSize(50); textAlign(RIGHT, TOP);
  text(skor, x + 180, y + 5);
  textSize(16); textAlign(CENTER, CENTER);
  if (mesaj === "SÜPER!") fill(0, 255, 0); else fill(200);
  text(mesaj, x + 100, y + 70);
  let bar = map(aci, 180, 30, 0, 180);
  fill(50); rect(x + 10, y + 100, 180, 8);
  fill(0, 255, 255); rect(x + 10, y + 100, constrain(bar, 0, 180), 8);
}

function calculateAngle(ax, ay, bx, by, cx, cy) {
  let radyan = Math.atan2(cy - by, cx - bx) - Math.atan2(ay - by, ax - bx);
  let derece = Math.abs(radyan * 180.0 / Math.PI);
  if (derece > 180.0) derece = 360 - derece;
  return derece;
}