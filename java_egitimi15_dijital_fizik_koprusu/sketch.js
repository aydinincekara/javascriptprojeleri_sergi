let handPose;
let video;
let hands = [];

// --- FİZİK MOTORU DEĞİŞKENLERİ (MATTER.JS) ---
const { Engine, World, Bodies, Composite, Body, Runner } = Matter;
let engine;
let world;
let toplar = [];
let zemin;
let solDuvar, sagDuvar;

// Bizim elimiz (Fiziksel bir çubuk olacak)
let elKalkani;

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Kamerayı başlat
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  handPose.detectStart(video, gotHands);

  // --- FİZİK DÜNYASINI KUR ---
  engine = Engine.create();
  world = engine.world;
  
  // Yerçekimini ayarla (1 normal, 2 daha ağır)
  engine.gravity.y = 1;

  // Sınırları oluştur (Toplar ekrandan kaçmasın)
  zemin = Bodies.rectangle(width/2, height + 50, width, 100, { isStatic: true });
  solDuvar = Bodies.rectangle(-50, height/2, 100, height, { isStatic: true });
  sagDuvar = Bodies.rectangle(width + 50, height/2, 100, height, { isStatic: true });
  
  // El Kalkanını Oluştur (Başlangıçta ekran dışında dursun)
  // isStatic: true diyoruz çünkü yerçekiminden etkilenip düşmesin, biz yöneteceğiz.
  elKalkani = Bodies.rectangle(width/2, height/2, 200, 20, { 
      isStatic: true,
      angle: 0,
      render: { fillStyle: '#00ffff' }
  });

  // Dünyaya ekle
  Composite.add(world, [zemin, solDuvar, sagDuvar, elKalkani]);

  // Fizik motorunu çalıştır
  let runner = Runner.create();
  Runner.run(runner, engine);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Duvarları güncellemek gerekir ama şimdilik kalsın
}

function gotHands(results) {
  hands = results;
}

function draw() {
  background(30);

  // --- TOP ÜRETİM FABRİKASI ---
  // Her 20 karede bir (yaklaşık saniyede 3 top) yeni top düşür
  if (frameCount % 20 === 0) {
      yeniTopUret();
  }

  // --- GÖRÜNTÜ AYARLARI ---
  let scaleFactor = max(width / video.width, height / video.height);
  let w = video.width * scaleFactor;
  let h = video.height * scaleFactor;
  let x = (width - w) / 2;
  let y = (height - h) / 2;

  push();
  translate(width, 0);
  scale(-1, 1);
  tint(100); // Arka plan videosunu karart
  image(video, x, y, w, h);

  // --- EL FİZİĞİ MANTIĞI ---
  if (hands.length > 0) {
      let el = hands[0];
      
      // İşaret parmağı kökü (Knuckle) ve Serçe parmağı kökü
      // Bu iki nokta elin "Düzlemini" verir.
      let p1 = el.keypoints[5]; // İşaret parmağı kökü
      let p2 = el.keypoints[17]; // Serçe parmağı kökü
      
      // Koordinatları ekrana uyarla
      let x1 = (p1.x * scaleFactor) + x;
      let y1 = (p1.y * scaleFactor) + y;
      let x2 = (p2.x * scaleFactor) + x;
      let y2 = (p2.y * scaleFactor) + y;
      
      // Kalkanın Merkezini Bul
      let cx = (x1 + x2) / 2;
      let cy = (y1 + y2) / 2;
      
      // Kalkanın Açısını Bul (Elin eğimine göre dönsün)
      // Math.atan2(y farkı, x farkı)
      let aci = Math.atan2(y2 - y1, x2 - x1);
      
      // FİZİK MOTORUNU GÜNCELLE
      // El kalkanını, elimizin olduğu yere ışınlıyoruz
      Body.setPosition(elKalkani, { x: cx, y: cy });
      Body.setAngle(elKalkani, aci);
      
      // Görsel Olarak Çiz (Neon Çubuk)
      stroke(0, 255, 255);
      strokeWeight(10);
      line(x1, y1, x2, y2);
      
      // Tutma noktaları
      fill(255); noStroke();
      circle(x1, y1, 10);
      circle(x2, y2, 10);
      
  } else {
      // El yoksa kalkanı ekran dışına at ki toplara çarpmasın
      Body.setPosition(elKalkani, { x: -1000, y: -1000 });
  }

  // --- TOPLARI ÇİZ ---
  noStroke();
  for (let i = toplar.length - 1; i >= 0; i--) {
      let top = toplar[i];
      
      // Fizik motorundaki koordinatları al
      let pos = top.position;
      let angle = top.angle;
      
      push();
      translate(pos.x, pos.y);
      rotate(angle);
      
      // Renkli Top Çiz
      fill(top.render.fillStyle);
      circle(0, 0, top.circleRadius * 2);
      
      // İçine parıltı
      fill(255, 100);
      circle(0, 0, top.circleRadius);
      pop();
      
      // Ekrandan düşenleri sil (Hafıza dolmasın)
      if (pos.y > height + 50) {
          Composite.remove(world, top);
          toplar.splice(i, 1);
      }
  }

  pop(); // Ayna modu bitiş
  
  drawUI();
}

function yeniTopUret() {
    let r = random(10, 25); // Top büyüklüğü
    let x = random(50, width - 50);
    let y = -50; // Ekranın üstünden başla
    
    // Rastgele neon renkler
    let renkler = ["#ff0000", "#00ff00", "#ffff00", "#ff00ff", "#ffffff"];
    let secilenRenk = random(renkler);
    
    // Fiziksel topu oluştur
    let top = Bodies.circle(x, y, r, {
        restitution: 0.8, // Zıplama katsayısı (1 = Süper zıplayan, 0 = Hamur)
        friction: 0.005,  // Sürtünme
        render: { fillStyle: secilenRenk }
    });
    
    toplar.push(top);
    Composite.add(world, top);
}

function drawUI() {
    fill(255); noStroke();
    textSize(24); textAlign(LEFT, TOP);
    text("HALKALI BİLİM MERKEZİ - FİZİK LAB", 20, 20);
    
    textSize(16); fill(200);
    text("Top Sayısı: " + toplar.length, 20, 50);
    
    textAlign(CENTER, BOTTOM);
    text("Elinizi 'Kalkan' gibi kullanarak topları zıplatın!", width/2, height - 20);
}