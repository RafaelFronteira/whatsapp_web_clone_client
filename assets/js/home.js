

function loginUser() {
    const inputUsername = document.getElementById('username');

    if (inputUsername.value || inputUsername.value.trim() !== '') {
        sessionStorage.setItem('username', inputUsername.value);

        const audio = new Audio('./assets/audio/assovio-whatsapp.mp3');
        audio.addEventListener('ended', () => {

            location.href = '/zap.html'
        });
        
        audio.play();

        
    } else {
        alert('Diga um nome, por favor!');
    }
}


(() => {
    // document.getElementById('userimage').addEventListener();
})();