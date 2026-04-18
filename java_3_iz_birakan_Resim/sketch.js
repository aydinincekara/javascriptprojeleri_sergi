let handPose;
let video;
let hands = [];
let izler = []; 
let resim; // Resim değişkenimiz

function preload() {
  handPose = ml5.handPose();
  // İnternetten şeffaf bir ateş görseli yüklüyoruz
  resim = loadImage('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png'); 
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
  // Videoyu ters çevirip çizelim (Ayna etkisi için)
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  
  if (hands.length > 0) {
    let el = hands[0];
    let parmakUcu = el.keypoints[8];

    // İzi listeye ekle
    izler.push({ x: parmakUcu.x, y: parmakUcu.y });

    // Kuyruk çok uzamasın
    if (izler.length > 20) {
      izler.shift(); 
    }
  }

  // İZLERİ RESİM OLARAK ÇİZ
  for (let i = 0; i < izler.length; i++) {
    let boyut = i * 2; // Eskiler küçük, yeniler büyük
    
    // Şeffaflık ayarı (tint)
    // i ne kadar büyükse o kadar opak (görünür) olsun
    let seffaflik = map(i, 0, izler.length, 0, 255);
    tint(255, seffaflik); // Resme şeffaflık verir
    
    // Resmi çiz (Merkezden çizmek için boyutu çıkarıyoruz)
    image(resim, izler[i].x - boyut/2, izler[i].y - boyut/2, boyut, boyut);
  }
  
  // Ayna etkisini kapat
  pop();
}
