let handPose;
let video;
let hands = [];

// 1. ADIM: Modeli, program başlamadan önce hafızaya yükle
function preload() {
  // ml5.js 1.0 versiyonunda modeli bu şekilde boş başlatmak daha güvenlidir
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  
  // 2. ADIM: Kamerayı aç
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // 3. ADIM: Takibi başlat
  // "Video kaynağını al ve sonuçları gotHands fonksiyonuna gönder"
  handPose.detectStart(video, gotHands);
}

function gotHands(results) {
  // Elleri sürekli güncelle
  hands = results;
}

function draw() {
  // Videoyu çiz
  image(video, 0, 0, width, height);

  // Eğer el algılandıysa
  if (hands.length > 0) {
    let el = hands[0]; // İlk eli al
    
    // İşaret parmağının ucunu bul (Nokta 8)
    let parmakUcu = el.keypoints[8];
    
    // Başparmak ucu (Nokta 4)
    let basParmak = el.keypoints[4];

    // Çizim yap
    fill(0, 255, 0); // Yeşil
    noStroke();
    circle(parmakUcu.x, parmakUcu.y, 20);
    
    fill(255, 0, 0); // Kırmızı
    circle(basParmak.x, basParmak.y, 20);
  }
}
