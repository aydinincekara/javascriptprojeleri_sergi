let handPose;
let video;
let hands = [];

// Topun özellikleri
let topX = 320;
let topY = 0;
let topHiz = 0;
let yerCekimi = 0.6;

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
}

function gotHands(results) {
  hands = results;
}

function draw() {
  // Ayna görüntüsü
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);

  // 1. FİZİK HESAPLAMALARI
  topY = topY + topHiz; // Topu hareket ettir
  topHiz = topHiz + yerCekimi; // Hızına yerçekimi ekle (hızlandır)

  // Top yere düşerse başa sar (ekrandan çıkmasın)
  if (topY > height) {
    topY = 0;
    topHiz = 0;
    topX = random(100, 500); // Rastgele bir yerden düşsün
  }

  // Topu çiz
  fill(255, 255, 0); // Sarı Top
  stroke(0);
  circle(topX, topY, 50);

  // 2. ÇARPIŞMA KONTROLÜ (MANTIK)
  if (hands.length > 0) {
    let el = hands[0];
    let parmakUcu = el.keypoints[8]; // İşaret parmağı

    // Parmak ucunu kırmızı çizelim ki görelim
    fill(255, 0, 0);
    circle(parmakUcu.x, parmakUcu.y, 20);

    // Matematik: İki nokta arasındaki mesafe (dist)
    let mesafe = dist(parmakUcu.x, parmakUcu.y, topX, topY);

    // Eğer mesafe topun yarıçapından küçükse, çarpmış demektir!
    if (mesafe < 50) {
      topHiz = -15; // Hızı terse çevir (Yukarı fırlat!)
      
      // Bonus: Çarpınca topun rengini rastgele değiştir
      fill(random(255), random(255), random(255));
      circle(topX, topY, 50);
    }
  }
  pop();
}
