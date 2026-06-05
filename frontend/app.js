// Промени на твоя порт, ако го стартираш локално! 
const API_URL = 'http://localhost:5000/api'; 

// 1. Инициализация на картата (Тъмна тема)
const map = L.map('map', { zoomControl: false }).setView([42.6593, 27.7326], 14);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// Речник за маркерите (за да можем да ги отваряме от менюто)
let markers = {};
let isCreating = false;
let newMissionCoords = null;

// Симулация на Логин (За демото)
const currentUser = { name: "Владимир", avatar: "https://ui-avatars.com/api/?name=Vladimir&background=00ff66&color=000" };

function simulateLogin() {
    document.getElementById('login-btn').classList.add('hidden');
    document.getElementById('user-profile').classList.remove('hidden');
}

function showCreateForm() {
    document.getElementById('missions-list').classList.add('hidden');
    document.getElementById('create-form').classList.remove('hidden');
    isCreating = true;
}

function hideCreateForm() {
    document.getElementById('create-form').classList.add('hidden');
    document.getElementById('missions-list').classList.remove('hidden');
    isCreating = false;
}

// 2. Зареждане на мисиите от C# сървъра
async function loadMissions() {
    try {
        const response = await fetch(`${API_URL}/tours`);
        const tours = await response.json();
        
        const container = document.getElementById('tours-container');
        container.innerHTML = ''; 

        tours.forEach(tour => {
            // Създаване на Аватар Пин (Custom Marker)
            const customIcon = L.divIcon({
                className: 'custom-pin',
                html: `<img src="${tour.avatarUrl}" alt="Guide">`,
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            });

            // Добавяне на пин на картата
            const marker = L.marker([tour.lat, tour.lng], { icon: customIcon }).addTo(map);
            marker.bindPopup(`<b>${tour.title}</b><br>${tour.cause}<br><i>Води: ${tour.guide}</i>`);
            markers[tour.id] = marker; // Запазваме го

            // Създаване на картата в лявото меню
            const card = document.createElement('div');
            card.className = 'tour-card';
            card.onclick = () => flyToMission(tour.id, tour.lat, tour.lng);
            card.innerHTML = `
                <h3>${tour.title}</h3>
                <div class="host-info">
                    <img src="${tour.avatarUrl}">
                    <span>Водено от <b>${tour.guide}</b></span>
                </div>
                <p>${tour.cause}</p>
                <button class="action-btn" onclick="event.stopPropagation(); alert('Записан си! Очакваме те.')">🖐️ Искам да помогна</button>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Сървърът не отговаря", err);
    }
}

// 3. Анимацията за летене (FlyTo)
function flyToMission(id, lat, lng) {
    // Картата се анимира и зуумва до локацията
    map.flyTo([lat, lng], 17, { duration: 1.5 });
    
    // След като приключи полета, отваряме пина
    setTimeout(() => {
        markers[id].openPopup();
    }, 1500);
}

// 4. Логика за Кликане върху картата (Избор на локация за нова мисия)
map.on('click', function(e) {
    if (!isCreating) return; // Правим нещо само ако формата е отворена
    
    newMissionCoords = e.latlng;
    document.getElementById('selected-coords').innerText = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
    
    // Временен пин
    L.marker([e.latlng.lat, e.latlng.lng]).addTo(map).bindPopup("Нова мисия тук!").openPopup();
});

// 5. Изпращане на новата мисия към сървъра
async function submitMission() {
    if (!newMissionCoords) return alert("Първо кликни на картата, за да избереш локация!");
    
    const newTour = {
        title: document.getElementById('m-title').value,
        cause: document.getElementById('m-desc').value,
        guide: currentUser.name,
        avatarUrl: currentUser.avatar,
        lat: newMissionCoords.lat,
        lng: newMissionCoords.lng,
        maxSpots: parseInt(document.getElementById('m-spots').value) || 10,
        currentSpots: 0
    };

    try {
        const res = await fetch(`${API_URL}/tours`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTour)
        });

        if (res.ok) {
            hideCreateForm();
            loadMissions(); // Презареждаме, за да се появи в списъка
        }
    } catch (err) {
        console.error("Грешка при запазване", err);
    }
}

// Старт
loadMissions();