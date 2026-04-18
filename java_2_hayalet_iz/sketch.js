let handPose;
let video;
let hands = [];
let izler = []; // Parmağının geçmiş konumlarını saklayacağımız kutu

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
  // Videoyu çiz
  image(video, 0, 0, width, height);

  // Eğer el varsa
  if (hands.length > 0) {
    let el = hands[0];
    let parmakUcu = el.keypoints[8]; // İşaret parmağı

    // YENİ KISIM: Parmağın şu anki konumunu "izler" listesine ekle
    izler.push({ x: parmakUcu.x, y: parmakUcu.y });

    // Eğer liste çok uzarsa (30'dan fazla), en eskiyi sil (yoksa ekran dolar)
    if (izler.length > 30) {
      izler.shift(); 
    }
  }

  // ŞİMDİ İZLERİ ÇİZELİM
  noStroke();
  for (let i = 0; i < izler.length; i++) {
    // i sayısı 0'dan 30'a kadar artar.
    // Bunu kullanarak eski izleri küçük ve soluk, yenileri büyük ve parlak yapabiliriz.
    
    let kucukluk = i * 1.5; // Sayı arttıkça daire büyüsün
    let renk = map(i, 0, izler.length, 0, 255); // Eskiler sönük, yeniler parlak

    fill(255, 0, 150, renk); // Pembe renk ve şeffaflık
    circle(izler[i].x, izler[i].y, kucukluk);
  }
}
