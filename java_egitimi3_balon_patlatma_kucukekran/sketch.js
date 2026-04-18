let handPose;
let video;
let hands = [];
let balonlar = []; // Balonları saklayacağımız sepet (Dizi/Array)
let skor = 0;

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
  
  // Oyuna başlarken 5 tane balon üretelim
  for (let i = 0; i < 5; i++) {
    balonlar.push(new Balon());
  }
}

function gotHands(results) {
  hands = results;
}

function draw() {
  // 1. Arka planı çiz
  push();
  translate(width, 0);
  scale(-1, 1);
  tint(255, 200); // Videoyu biraz soluklaştır ki balonlar net görünsün
  image(video, 0, 0, width, height);
  
  // 2. Parmak Ucunu Bul (Silahımız bu)
  let parmakX = 0;
  let parmakY = 0;
  let elVar = false;

  if (hands.length > 0) {
    let el = hands[0];
    let isaretParmagi = el.keypoints[8]; // 8 numara işaret parmağı ucudur
    parmakX = isaretParmagi.x;
    parmakY = isaretParmagi.y;
    elVar = true;

    // Parmak ucuna nişangah çiz
    fill(255, 0, 0);
    noStroke();
    circle(parmakX, parmakY, 20);
    
    // Nişangahın etrafına halka
    noFill();
    stroke(255, 255, 0);
    strokeWeight(3);
    circle(parmakX, parmakY, 40);
  }

  // 3. Balonları Yönet (Hareket, Çizim, Patlatma)
  for (let i = balonlar.length - 1; i >= 0; i--) {
    let b = balonlar[i];
    b.hareketEt();
    b.ciz();

    // ÇARPIŞMA KONTROLÜ (Mantık Kısmı)
    // Eğer el varsa VE parmak ile balon arasındaki mesafe balonun yarıçapından küçükse...
    if (elVar) {
      let mesafe = dist(parmakX, parmakY, b.x, b.y);
      if (mesafe < b.cap / 2) {
        // Balon patladı!
        balonlar.splice(i, 1); // Listeden sil
        skor++; // Puanı artır
        balonlar.push(new Balon()); // Yeni balon gönder
      }
    }
    
    // Balon ekranın altına düştü mü?
    if (b.y > height + 50) {
      balonlar.splice(i, 1); // Sil
      skor = max(0, skor - 1); // Puan kır (Eksiye düşmesin)
      balonlar.push(new Balon()); // Yeni balon
    }
  }
  pop(); // Ayna modundan çık (Yazıları düz yazmak için)

  // 4. Skoru Ekrana Yaz (HUD)
  fill(255);
  stroke(0);
  strokeWeight(4);
  textSize(32);
  text("SKOR: " + skor, 20, 50);
}

// --- BALON FABRİKASI (CLASS) ---
// Bu bir "Kalıp"tır. Her "new Balon()" dediğimizde buradaki özelliklerde yeni bir nesne oluşur.
class Balon {
  constructor() {
    this.x = random(50, width - 50); // Rastgele yatay konum
    this.y = random(-200, -50);      // Ekranın üstünden başlasın
    this.cap = random(40, 80);       // Rastgele büyüklük
    this.hiz = random(2, 5);         // Rastgele düşüş hızı
    // Rastgele renk (R, G, B)
    this.r = random(255);
    this.g = random(255);
    this.b = random(255);
  }

  hareketEt() {
    this.y += this.hiz; // Aşağı doğru in
  }

  ciz() {
    fill(this.r, this.g, this.b, 200); // Hafif şeffaf renk
    noStroke();
    circle(this.x, this.y, this.cap);
    
    // Balonun üzerine parlama efekti (Estetik dokunuş)
    fill(255, 100);
    circle(this.x - this.cap/4, this.y - this.cap/4, this.cap/4);
  }
}