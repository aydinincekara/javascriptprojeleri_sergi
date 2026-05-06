document.addEventListener("DOMContentLoaded", function() {
    // Header'ı yükle
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-placeholder").innerHTML = data;
        });

    // Footer'ı yükle
    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
        });
});

// Mobil Menü Aç/Kapat (Global)
window.toggleMenu = function() {
    var menu = document.getElementById("mobileMenu");
    if(menu) menu.classList.toggle("active");
};

// Versiyon Modalı Aç/Kapat (Global)
window.openVersionModal = function(e) {
    e.preventDefault();
    var modal = document.getElementById('versionModal');
    if(modal) modal.style.display = 'flex';
};

window.closeVersionModal = function() {
    var modal = document.getElementById('versionModal');
    if(modal) modal.style.display = 'none';
};

// Modal dışına tıklayınca kapatma
window.onclick = function(event) {
    var modal = document.getElementById('versionModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
