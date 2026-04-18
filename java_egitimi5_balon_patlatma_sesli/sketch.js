let handPose;
let video;
let hands = [];
let balonlar = [];
let parcalar = [];
let skor = 0;
let popSesi;

function preload() {
  handPose = ml5.handPose();
  soundFormats('mp3', 'ogg');
  popSesi = loadSound('pop.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(1280, 720);
  video.hide();
  
  // --- SES AYARLARI (TURBO MOD) ---
  outputVolume(1.0); 
  
  if (popSesi) {
      popSesi.setVolume(1.0); 
      // 'sustain' modu: Ses bitmeden yenisi çalabilir (Üst üste binme izni)
      popSesi.playMode('sustain'); 
  }

  handPose.detectStart(video, gotHands);
  
  for (let i = 0; i < 7; i++) {
    balonlar.push(new Balon());
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotHands(results) {
  hands = results;
}

function mousePressed() {
  userStartAudio();
}

// --- YENİ FONKSİYON: SESİ 3 KATINA ÇIKARAN HİLE ---
function sesiPatlat() {
  if (popSesi.isLoaded()) {
    // Sesi aynı milisaniyede 3 kere üst üste çalıyoruz!
    // Bu, hoparlöre "Daha güçlü vur" emri verir.
    popSesi.play();
    popSesi.play();
    popSesi.play();
  }
}

function draw() {
  background(0); 

  let scaleFactor = max(width / video.width, height / video.height);
  let yeniGenislik = video.width * scaleFactor;
  let yeniYukseklik = video.height * scaleFactor;
  let videoX = (width - yeniGenislik) / 2;
  let videoY = (height - yeniYukseklik) / 2;

  push();
  translate(width, 0);
  scale(-1, 1);
  
  tint(255); 
  image(video, videoX, videoY, yeniGenislik, yeniYukseklik);

  // --- EL ---
  let parmakX = 0;
  let parmakY = 0;
  let elVar = false;

  if (hands.length > 0) {
    let el = hands[0];
    let hamX = el.keypoints[8].x; 
    let hamY = el.keypoints[8].y;
    
    parmakX = (hamX * scaleFactor) + videoX; 
    parmakY = (hamY * scaleFactor) + videoY;
    elVar = true;

    // Nişangah
    fill(255, 0, 0); 
    noStroke();
    circle(parmakX, parmakY, 15);
    
    noFill();
    stroke(0, 255, 255);
    strokeWeight(3);
    circle(parmakX, parmakY, 50);
  }

  // --- PARÇACIKLAR ---
  for (let i = parcalar.length - 1; i >= 0; i--) {
    let p = parcalar[i];
    p.hareketEt();
    p.ciz();
    if (p.omur <= 0) {
      parcalar.splice(i, 1);
    }
  }

  // --- BALONLAR ---
  for (let i = balonlar.length - 1; i >= 0; i--) {
    let b = balonlar[i];
    b.hareketEt();
    b.ciz();

    if (elVar) {
      let mesafe = dist(parmakX, parmakY, b.x, b.y);
      if (mesafe < b.cap / 1.5) {
        
        // TURBO SES FONKSİYONUNU ÇAĞIR
        sesiPatlat();

        patlamaYarat(b.x, b.y, b.r, b.g, b.b);
        balonlar.splice(i, 1);
        skor++;
        balonlar.push(new Balon());
      }
    }
    
    if (b.y > height + 100) {
      balonlar.splice(i, 1);
      if (skor > 0) skor--;
      balonlar.push(new Balon());
    }
  }
  
  pop();

  // --- ARAYÜZ ---
  textAlign(LEFT, TOP);
  fill(0, 255, 0); 
  stroke(0);
  strokeWeight(2); 
  textSize(40);
  text("SKOR: " + skor, 40, 40);
  
  if (frameCount < 200) {
    textSize(20);
    fill(255, 255, 0);
    noStroke();
    text("Ses için ekrana TIKLA!", 40, 90);
  }
}

function patlamaYarat(x, y, r, g, b) {
  for (let k = 0; k < 12; k++) {
    parcalar.push(new Parca(x, y, r, g, b));
  }
}

class Balon {
  constructor() {
    this.x = random(width * 0.1, width * 0.9); 
    this.y = random(-height, -100);
    this.cap = random(70, 110); 
    this.hiz = random(4, 8); 
    this.r = random(100, 255);
    this.g = random(50, 200);
    this.b = random(150, 255);
  }

  hareketEt() {
    this.y += this.hiz;
    this.x += sin(frameCount * 0.05 + this.y) * 1.5; 
  }

  ciz() {
    fill(this.r, this.g, this.b, 230);
    noStroke();
    circle(this.x, this.y, this.cap);
    fill(255, 150);
    circle(this.x - this.cap/4, this.y - this.cap/4, 15);
  }
}

class Parca {
  constructor(x, y, r, g, b) {
    this.x = x;
    this.y = y;
    this.vx = random(-8, 8); 
    this.vy = random(-8, 8);
    this.omur = 255;
    this.r = r; this.g = g; this.b = b;
  }

  hareketEt() {
    this.x += this.vx;
    this.y += this.vy;
    this.omur -= 8;
  }

  ciz() {
    fill(this.r, this.g, this.b, this.omur);
    noStroke();
    circle(this.x, this.y, 12);
  }
}