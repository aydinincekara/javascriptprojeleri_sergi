let handPose;
let video;
let hands = [];

// --- FİZİK MOTORU (MATTER.JS) ---
const { Engine, World, Bodies, Composite, Body, Runner } = Matter;
let engine;
let world;
let toplar = [];
let zemin;
let solDuvar, sagDuvar;
let kalkanlar = []; 

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // --- HD AYARI ---
  video = createCapture(VIDEO);
  video.size(1280, 720); // 720p HD Çözünürlük
  video.hide();
  
  handPose.detectStart(video, gotHands);

  // --- FİZİK DÜNYASI ---
  engine = Engine.create();
  world = engine.world;
  engine.gravity.y = 1; // Yerçekimi

  // Sınırları oluştur
  zemin = Bodies.rectangle(width/2, height + 50, width, 100, { isStatic: true });
  solDuvar = Bodies.rectangle(-50, height/2, 100, height, { isStatic: true });
  sagDuvar = Bodies.rectangle(width + 50, height/2, 100, height, { isStatic: true });
  
  // 2 Adet Kalkan (Eller için)
  for(let i=0; i<2; i++) {
      let kalkan = Bodies.rectangle(-1000, -1000, 250, 30, { // Kalkanları biraz büyüttüm
          isStatic: true, 
          angle: 0,
          friction: 0.1,  
          restitution: 1.3 // Daha da zıplatıcı!
      });
      kalkanlar.push(kalkan);
      Composite.add(world, kalkan);
  }

  Composite.add(world, [zemin, solDuvar, sagDuvar]);

  let runner = Runner.create();
  Runner.run(runner, engine);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotHands(results) {
  hands = results;
}

function draw() {
  background(20);

  // --- TOP FABRİKASI ---
  if (frameCount % 10 === 0) { // HD olduğu için daha sık top yağsın (Daha akıcı)
      yeniTopUret();
  }

  // --- GÖRÜNTÜ (HD SCALE) ---
  // HD videoyu ekrana tam oturtmak için oranlıyoruz
  let scaleFactor = max(width / video.width, height / video.height);
  let w = video.width * scaleFactor;
  let h = video.height * scaleFactor;
  let x = (width - w) / 2;
  let y = (height - h) / 2;

  push();
  translate(width, 0);
  scale(-1, 1);
  
  // HD olduğu için tint'i biraz açtım, netlik belli olsun
  tint(180); 
  image(video, x, y, w, h);

  // --- EL FİZİĞİ ---
  for (let i = 0; i < 2; i++) {
      if (hands[i]) {
          let el = hands[i];
          
          // İşaret (5) ve Serçe (17) parmağı
          let p1 = el.keypoints[5]; 
          let p2 = el.keypoints[17]; 
          
          let x1 = (p1.x * scaleFactor) + x;
          let y1 = (p1.y * scaleFactor) + y;
          let x2 = (p2.x * scaleFactor) + x;
          let y2 = (p2.y * scaleFactor) + y;
          
          let cx = (x1 + x2) / 2;
          let cy = (y1 + y2) / 2;
          let aci = Math.atan2(y2 - y1, x2 - x1);
          
          // FİZİK GÜNCELLEME
          Body.setPosition(kalkanlar[i], { x: cx, y: cy });
          Body.setAngle(kalkanlar[i], aci);
          
          // --- HD GÖRSELLİK ---
          // Neon çizgi daha parlak ve kalın
          strokeWeight(15);
          if (i === 0) stroke(0, 255, 255); // Turkuaz
          else stroke(255, 0, 255);         // Magenta
          
          line(x1, y1, x2, y2);
          
          // İç parlama
          strokeWeight(5); stroke(255);
          line(x1, y1, x2, y2);

          // Tutma noktaları
          noStroke(); fill(255);
          circle(x1, y1, 15);
          circle(x2, y2, 15);
          
      } else {
          Body.setPosition(kalkanlar[i], { x: -1000, y: -1000 });
      }
  }

  // --- TOPLARI ÇİZ ---
  noStroke();
  for (let i = toplar.length - 1; i >= 0; i--) {
      let top = toplar[i];
      let pos = top.position;
      let angle = top.angle;
      
      push();
      translate(pos.x, pos.y);
      rotate(angle);
      
      // Topun kendisi
      fill(top.render.fillStyle);
      circle(0, 0, top.circleRadius * 2);
      
      // HD Parlama Efekti (Daha detaylı)
      fill(255, 100);
      circle(top.circleRadius * 0.3, -top.circleRadius * 0.3, top.circleRadius * 0.6);
      
      pop();
      
      if (pos.y > height + 50) {
          Composite.remove(world, top);
          toplar.splice(i, 1);
      }
  }

  pop();
  
  drawUI();
}

function yeniTopUret() {
    let r = random(15, 30); // Toplar biraz daha büyük
    let x = random(50, width - 50);
    let y = -50; 
    
    let renkler = ["#ff0055", "#00ffaa", "#ffff00", "#aa00ff", "#ffffff"];
    let secilenRenk = random(renkler);
    
    let top = Bodies.circle(x, y, r, {
        restitution: 0.95, 
        friction: 0.001, 
        density: 0.04,
        render: { fillStyle: secilenRenk }
    });
    
    toplar.push(top);
    Composite.add(world, top);
}

function drawUI() {
    fill(255); noStroke();
    // Başlık daha şık
    textSize(28); textStyle(BOLD); textAlign(LEFT, TOP);
    text("HALKALI BİLİM MERKEZİ", 20, 20);
    
    textSize(18); textStyle(NORMAL); fill(0, 255, 255);
    text("NEWTON FİZİK LABORATUVARI", 20, 55);
    
    fill(200); textSize(16);
    text("Aktif Top Sayısı: " + toplar.length, 20, 85);
    
    textAlign(CENTER, BOTTOM);
    fill(255, 255, 0);
    text("İKİ ELİNİ KULLANARAK TOPLARI YÖNET! ✋🤚", width/2, height - 30);
}