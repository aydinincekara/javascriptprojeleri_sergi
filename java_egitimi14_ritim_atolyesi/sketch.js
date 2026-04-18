let handPose;
let video;
let hands = [];

// --- SES DOSYALARI ---
// Az dosya ile çok ses üreteceğiz (Pitch Shifting)
let sesDosyalari = {};
let sesLinkleri = {
    kick: "https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/kick.wav",
    snare: "https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/snare.wav",
    hihat: "https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/hihat.wav",
    tom: "https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/boom.wav",
    crash: "https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/tink.wav",
    clap: "https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/clap.wav"
};
let seslerYuklendi = false;

// --- DAVULLAR ---
let davullar = [];

function preload() {
  handPose = ml5.handPose();
  soundFormats('wav', 'mp3');
  
  // Sesleri yükle
  sesDosyalari.kick = loadSound(sesLinkleri.kick);
  sesDosyalari.snare = loadSound(sesLinkleri.snare);
  sesDosyalari.hihat = loadSound(sesLinkleri.hihat);
  sesDosyalari.tom = loadSound(sesLinkleri.tom);
  sesDosyalari.crash = loadSound(sesLinkleri.crash);
  sesDosyalari.clap = loadSound(sesLinkleri.clap, () => {
      console.log("Sesler hazır!");
      seslerYuklendi = true;
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  video = createCapture(VIDEO);
  video.size(1024, 768);
  video.hide();
  
  handPose.detectStart(video, gotHands);

  // --- STADYUM YERLEŞİMİ (8 PARÇA) ---
  let w = width;
  let h = height;
  let cx = w / 2;
  let cy = h / 2;

  // -- ALT SIRA (ANA RİTİM) - KOCAMAN BUTONLAR --
  // KICK (En büyük, en altta)
  davullar.push(new Davul(cx, h * 0.85, 200, [255, 0, 0], sesDosyalari.kick, 1.0, "KICK"));
  
  // SNARE (Sol Ana)
  davullar.push(new Davul(cx - 280, h * 0.75, 180, [0, 255, 0], sesDosyalari.snare, 1.0, "SNARE"));
  
  // FLOOR TOM (Sağ Ana - Kalınlaştırılmış Tom)
  davullar.push(new Davul(cx + 280, h * 0.75, 180, [50, 100, 255], sesDosyalari.tom, 0.8, "FLOOR"));

  // HI-HAT (En Sol Alt)
  davullar.push(new Davul(cx - 500, h * 0.65, 160, [255, 255, 0], sesDosyalari.hihat, 1.0, "HI-HAT"));

  // -- ÜST SIRA (ZİLLER VE EFEKTLER) --
  // RACK TOM (Sağ Üst - İnceltilmiş Tom)
  davullar.push(new Davul(cx + 150, h * 0.4, 150, [100, 50, 200], sesDosyalari.tom, 1.5, "TOM"));
  
  // CLAP (Sol Üst)
  davullar.push(new Davul(cx - 150, h * 0.4, 150, [255, 0, 255], sesDosyalari.clap, 1.0, "ALKIŞ"));

  // CRASH (En Sağ Üst - Zil)
  davullar.push(new Davul(cx + 450, h * 0.35, 150, [0, 255, 255], sesDosyalari.crash, 1.0, "CRASH"));
  
  // OPEN HI-HAT (En Sol Üst - Yavaşlatılmış Hi-hat)
  davullar.push(new Davul(cx - 450, h * 0.35, 150, [255, 150, 0], sesDosyalari.hihat, 0.6, "OPEN-H"));
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

function draw() {
  background(20);

  if (!seslerYuklendi) {
      fill(255); textAlign(CENTER); textSize(40);
      text("DEV BATERİ KURULUYOR...", width/2, height/2);
      return;
  }

  // --- EKRAN AYARLARI ---
  let scaleFactor = max(width / video.width, height / video.height);
  let w = video.width * scaleFactor;
  let h = video.height * scaleFactor;
  let x = (width - w) / 2;
  let y = (height - h) / 2;

  push();
  translate(width, 0);
  scale(-1, 1);
  tint(150); // Videoyu karart
  image(video, x, y, w, h);

  // --- EL ÇİZİMİ ---
  if (hands.length > 0) {
    for (let el of hands) {
        let parmak = el.keypoints[8];
        let px = (parmak.x * scaleFactor) + x;
        let py = (parmak.y * scaleFactor) + y;
        
        // Baget ucu
        fill(255); noStroke(); circle(px, py, 25);
        stroke(255, 150); noFill(); strokeWeight(3); circle(px, py, 50);
    }
  }

  // --- ÇARPIŞMA MANTIĞI (STABIL) ---
  for (let d of davullar) {
      let temasVar = false;

      if (hands.length > 0) {
          for (let el of hands) {
              let parmak = el.keypoints[8];
              let px = (parmak.x * scaleFactor) + x;
              let py = (parmak.y * scaleFactor) + y;

              // Çapı biraz genişletelim ki vurmak kolay olsun (d.cap * 0.6)
              if (dist(px, py, d.x, d.y) < d.cap * 0.6) {
                  temasVar = true;
              }
          }
      }

      if (temasVar) {
          if (!d.caliyor) {
              d.vur();
              d.caliyor = true;
          }
      } else {
          d.caliyor = false;
      }

      d.ciz();
  }

  pop(); // Ayna modu bitiş

  drawUI();
}

function drawUI() {
    fill(255); noStroke(); 
    textSize(36); textAlign(CENTER, TOP); textStyle(BOLD);
    text("HALKALI DEV STADYUM BATERİSİ", width/2, 20);
    
    if (getAudioContext().state !== 'running') {
        textSize(24); fill(255, 50, 50);
        text("SES MOTORU KAPALI - EKRANA TIKLA!", width/2, 80);
    }
}

// --- DAVUL SINIFI ---
class Davul {
    constructor(x, y, cap, renk, sesDosyasi, pitch, isim) {
        this.x = x; this.y = y;
        this.cap = cap; this.orijinalCap = cap;
        this.renk = renk;
        this.ses = sesDosyasi;
        this.pitch = pitch; // Sesin hızı (1.0 = Normal, 0.5 = Kalın, 1.5 = İnce)
        this.isim = isim;
        this.caliyor = false; 
        this.animasyon = 0; 
    }
    
    vur() {
        this.animasyon = 40; // Çok daha büyük zıplama
        if (this.ses && this.ses.isLoaded()) {
            // Sesi özel hızla (pitch) çal
            // .play(startTime, rate, amp, cueStart, duration)
            this.ses.play(0, this.pitch, 1.0, 0); 
        }
    }
    
    ciz() {
        let r = this.renk[0]; let g = this.renk[1]; let b = this.renk[2];
        
        // Animasyon geri dönüşü
        if (this.animasyon > 0) this.animasyon -= 4;
        
        let guncelCap = this.orijinalCap + this.animasyon;

        // Vurunca çıkan şok dalgası
        if (this.animasyon > 10) {
            noFill(); stroke(r, g, b, 200); strokeWeight(15);
            circle(this.x, this.y, guncelCap + 30);
        }

        if (this.caliyor) {
            // Vurunca içi dolu parlak
            fill(r + 50, g + 50, b + 50, 220); stroke(255); strokeWeight(8);
        } else {
            // Normalde sadece çerçeve ve hafif şeffaf iç
            fill(r, g, b, 60); stroke(r, g, b); strokeWeight(6);
        }
        
        circle(this.x, this.y, guncelCap);
        
        // Orta süs
        noFill(); stroke(255, 80); strokeWeight(3);
        circle(this.x, this.y, guncelCap * 0.7);
        
        push(); translate(this.x, this.y); scale(-1, 1); 
        fill(255); noStroke(); textAlign(CENTER, CENTER);
        textSize(30); textStyle(BOLD);
        // Yazıya gölge at
        fill(0, 150); text(this.isim, 3, 3);
        fill(255); text(this.isim, 0, 0);
        pop();
    }
}