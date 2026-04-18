function setup() {
    // Sayfanın ortasına 600x600 bir tuval aç
    createCanvas(600, 600);
    background(0); // Siyah zemin
}

function draw() {
    // Hafif saydam bir siyah boya ile her karede ekranı temizle (İz efekti için)
    // Eğer bunu kapatırsan kalıcı çizim yapar
    background(0, 20); 

    // Fareye basılı tutulursa çizim yap
    if (mouseIsPressed) {
        fill(255, 0, 100); // Pembe
        noStroke();
        
        // Farenin hızına göre boyutu değiştir
        // Fare hızlıysa büyük, yavaşsa küçük çizer
        let hiz = dist(mouseX, mouseY, pmouseX, pmouseY);
        circle(mouseX, mouseY, hiz + 10);
    }
    
    // Farenin ucunda her zaman dönen bir rehber olsun
    fill(0, 255, 200); // Turkuaz
    circle(mouseX, mouseY, 10);
}