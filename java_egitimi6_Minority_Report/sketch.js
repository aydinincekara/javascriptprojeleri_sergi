let handPose;
let video;
let hands = [];

// --- SUNUM DEĞİŞKENLERİ ---
let slaytlar = ["HOŞ GELDİNİZ", "MÜHENDİSLİK", "SANAT", "GELECEK", "TEŞEKKÜRLER"];
let renkler = [
  [0, 100, 200], // Mavi
  [200, 50, 50], // Kırmızı
  [50, 150, 50], // Yeşil
  [200, 200, 50], // Sarı
  [100, 50, 200] // Mor
];

let aktifSlayt = 0; // Şu an kaçıncı slayttayız?
let gecisSayaci = 0; // Slaytların çok hızlı değişmesini engellemek için (Cooldown)

// Hareket Analizi İçin
let oncekiX = 0;
let simdikiX = 0;

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(1280, 720);
  video.hide();
  handPose.detectStart(video, gotHands);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotHands(results) {
  hands = results;
}

function draw() {
  background(20); 

  // --- 1. ARKAPLANDA SLAYTI GÖSTER ---
  // Ayna moduna gerek yok, sunum düz olmalı.
  // Ama el kontrolü için kafamız karışmasın diye video analizini arkada halledeceğiz.
  
  // Şık bir geçiş efekti (Slayt Numarasına göre renk değişimi)
  let hedefRenk = renkler[aktifSlayt];
  background(hedefRenk[0], hedefRenk[1], hedefRenk[2]);
  
  // Slayt Yazısı
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(width * 0.1); // Ekran genişliğine göre dev yazı
  text(slaytlar[aktifSlayt], width/2, height/2);
  
  // Alt bilgi
  textSize(30);
  text((aktifSlayt + 1) + " / " + slaytlar.length, width/2, height - 100);
  text("Değiştirmek için elini SAĞA veya SOLA savur", width/2, height - 50);

  // --- 2. EL ANALİZİ VE KONTROL ---
  if (hands.length > 0) {
    let el = hands[0];
    
    // Elin merkezini (Avuç içi) baz alalım (Nokta 9)
    let hamX = el.keypoints[9].x; 
    
    // Videoyu ekrana scale etmediğimiz için, elin hareketini normalize etmeliyiz.
    // Ancak sadece YÖN baktığımız için karmaşık matematiğe gerek yok.
    // Sadece "X artıyor mu, azalıyor mu?" buna bakacağız.
    
    // Aynalama sorunu: ml5 videoyu düz görür. 
    // Sen elini sağa götürdüğünde, kamerada x değeri azalır (veya artar).
    // Bu yüzden hissettiğin yön ile sayısal yön ters olabilir. Deneyerek bulacağız.
    
    simdikiX = hamX;
    
    // Hareket Hızı (Velocity) Hesapla
    // Şimdiki konumdan önceki konumu çıkarırsak hızı ve yönü buluruz.
    let hiz = simdikiX - oncekiX;
    
    // --- AKILLI KARAR MEKANİZMASI ---
    
    // 1. Sayaç 0 ise (Yani sistem yeni bir komuta hazırsa)
    if (gecisSayaci === 0) {
      
      // Hız Eşiği: El sadece kıpırdıyor mu yoksa savruluyor mu?
      // 30 sayısı hassasiyettir. Çok hassas ise artır (50 yap).
      
      if (hiz > 50) { 
        // Hızlıca SAĞA (veya sola) gidiyor
        oncekiSlayt();
        gecisSayaci = 30; // 30 kare boyunca (yaklaşık yarım saniye) kilitlen
      } 
      else if (hiz < -50) {
        // Hızlıca SOLA (veya sağa) gidiyor
        sonrakiSlayt();
        gecisSayaci = 30; // Kilitlen
      }
    }
    
    // Hafızayı güncelle (Şimdiki, bir sonraki karede "önceki" olacak)
    oncekiX = simdikiX;
    
    // --- GÖRSEL GERİ BİLDİRİM (HUD) ---
    // Elin nerede olduğunu küçük bir imleçle gösterelim (Sağ alt köşe)
    // Küçük bir "Kamera Penceresi"
    let camW = 320;
    let camH = 240;
    
    // Küçük pencere çerçevesi
    fill(0, 150);
    rect(width - camW - 20, height - camH - 20, camW, camH);
    
    push();
    translate(width - 20, height - 20); // Sağ alt köşe
    scale(-1, 1); // Ayna modu (Sadece küçük pencere için)
    tint(255);
    // Videoyu küçük çiz
    image(video, 0, -camH, camW, camH); 
    
    // Elin üzerine ok işareti çiz
    let kucukX = map(hamX, 0, video.width, 0, camW);
    let kucukY = map(el.keypoints[9].y, 0, video.height, 0, camH);
    
    noFill();
    stroke(0, 255, 0);
    strokeWeight(3);
    circle(kucukX, -camH + kucukY, 20);
    pop();
  }

  // --- SOĞUMA SAYACI (COOLDOWN) ---
  if (gecisSayaci > 0) {
    gecisSayaci--;
    
    // Kilitli olduğunu gösteren bir bar
    noStroke();
    fill(255, 255, 255, 100);
    rect(0, height-10, map(gecisSayaci, 0, 30, width, 0), 10);
  }
}

// --- YARDIMCI FONKSİYONLAR ---
function sonrakiSlayt() {
  aktifSlayt++;
  if (aktifSlayt >= slaytlar.length) {
    aktifSlayt = 0; // Başa dön
  }
  feedbackSesi(); // Opsiyonel: "Klik" sesi eklenebilir
}

function oncekiSlayt() {
  aktifSlayt--;
  if (aktifSlayt < 0) {
    aktifSlayt = slaytlar.length - 1; // Sona git
  }
  feedbackSesi();
}

function feedbackSesi() {
  // Şimdilik boş, buraya "klik" sesi ekleyebilirsin
}