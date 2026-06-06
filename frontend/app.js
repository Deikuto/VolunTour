const API_URL = 'http://localhost:5246/api'; 

const cityLocations = {
    nessebar: [42.6593, 27.7326],
    burgas: [42.5048, 27.4626],
    sofia: [42.6977, 23.3219]
};

const map = L.map('map', { zoomControl: false }).setView([42.6593, 27.7326], 13);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: 'OpenStreetMap'
}).addTo(map);

let allTours = [];
let markers = [];
let isCreating = false;
let tempCoords = null;
let tempMarker = null;

let isLoggedIn = false;
const currentUser = { name: "Деян", avatar: "https://ui-avatars.com/api/?name=Deyan&background=607D8B&color=fff" };

function openLoginModal() { document.getElementById('login-modal').classList.remove('hidden'); }
function closeLoginModal() { document.getElementById('login-modal').classList.add('hidden'); }

function simulateLogin() {
    isLoggedIn = true;
    closeLoginModal();
    document.getElementById('login-btn').classList.add('hidden');
    document.getElementById('user-profile').classList.remove('hidden');
}

function logout() {
    isLoggedIn = false;
    document.getElementById('login-btn').classList.remove('hidden');
    document.getElementById('user-profile').classList.add('hidden');
    cancelCreatingMission();
}

function goToLocation() {
    const city = document.getElementById('location-select').value;
    if (cityLocations[city]) {
        map.flyTo(cityLocations[city], 14, { duration: 2 });
    }
}

function filterMissions() {
    const category = document.getElementById('category-filter').value;
    renderMissions(category === 'all' ? allTours : allTours.filter(t => t.category === category));
}

async function loadMissions() {
    try {
        const response = await fetch(`${API_URL}/tours`);
        allTours = await response.json();
        renderMissions(allTours);
    } catch (err) {
        console.error("Грешка при връзка със сървъра", err);
    }
}

function getCategoryClass(category) {
    if (category === "Екология") return "ecology";
    if (category === "Култура") return "culture";
    if (category === "Инфраструктура") return "infrastructure";
    return "default";
}

function renderMissions(toursData) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    toursData.forEach(tour => {
        const catClass = getCategoryClass(tour.category);
        
        // Изграждане на HTML структурата за формата на капка
        const pinHtml = `
            <div class="pin-wrapper pin-${catClass}">
                <div class="pin-shape"></div>
                <img src="${tour.avatarUrl}" class="pin-image" alt="Avatar">
            </div>
        `;

        const customIcon = L.divIcon({
            className: '', // Изчистваме базoвия клас, за да не пречи на стиловете
            html: pinHtml,
            iconSize: [44, 44],
            iconAnchor: [22, 44],
            popupAnchor: [0, -40]
        });

        const isFull = tour.currentSpots >= tour.maxSpots;
        const btnClass = isFull ? "popup-action full" : "popup-action active";
        const btnText = isFull ? "Групата е запълнена" : "Запиши се за участие";
        const btnOnclick = isFull ? "" : `onclick="joinMission(${tour.id})"`;

        const tagsHtml = tour.tags ? tour.tags.map(tag => `<span class="popup-tag">${tag}</span>`).join('') : '';

        const popupContent = `
            <div class="popup-container">
                <div class="popup-header">
                    <span class="popup-category cat-${catClass}">${tour.category}</span>
                    <h3>${tour.title}</h3>
                </div>
                <div class="popup-details">
                    <p><strong>Водач:</strong> ${tour.guide}</p>
                    <p><strong>Време:</strong> ${tour.time}</p>
                    <p><strong>Обхват:</strong> ${tour.scope}</p>
                    <p><strong>Цел:</strong> ${tour.cause}</p>
                    <div class="popup-tags">${tagsHtml}</div>
                    <p><strong>Участници:</strong> ${tour.currentSpots} / ${tour.maxSpots}</p>
                </div>
                <button class="${btnClass}" ${btnOnclick}>${btnText}</button>
            </div>
        `;

        const marker = L.marker([tour.lat, tour.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(popupContent, { maxWidth: 300, minWidth: 250 });
        markers.push(marker);
    });
}

function startCreatingMission() {
    isCreating = true;
    document.getElementById('create-panel').classList.remove('hidden');
    if (tempMarker) map.removeLayer(tempMarker);
}

function cancelCreatingMission() {
    isCreating = false;
    document.getElementById('create-panel').classList.add('hidden');
    if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
    document.getElementById('mission-coords').innerText = "Липсват";
}

map.on('click', function(e) {
    if (!isCreating) return;
    tempCoords = e.latlng;
    if (tempMarker) map.removeLayer(tempMarker);
    tempMarker = L.marker([tempCoords.lat, tempCoords.lng]).addTo(map).bindPopup("Избрана локация").openPopup();
    document.getElementById('mission-coords').innerText = `${tempCoords.lat.toFixed(4)}, ${tempCoords.lng.toFixed(4)}`;
});

async function submitMission() {
    if (!tempCoords) { alert("Моля, кликнете върху картата, за да зададете локация."); return; }

    // Събиране на маркираните тагове
    const selectedTags = Array.from(document.querySelectorAll('#m-tags-container input:checked')).map(cb => cb.value);

    const newTour = {
        title: document.getElementById('m-title').value,
        cause: document.getElementById('m-desc').value,
        category: document.getElementById('m-category').value,
        guide: currentUser.name,
        avatarUrl: currentUser.avatar,
        tags: selectedTags,
        time: document.getElementById('m-time').value,
        scope: document.getElementById('m-scope').value,
        lat: tempCoords.lat,
        lng: tempCoords.lng,
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
            cancelCreatingMission();
            loadMissions();
        }
    } catch (err) {
        console.error("Възникна грешка при запазване.", err);
    }
}

async function joinMission(id) {
    try {
        const res = await fetch(`${API_URL}/tours/${id}/join`, { method: 'POST' });
        if (res.ok) {
            alert('Успешно се записахте.');
            loadMissions();
        } else {
            alert('Групата е запълнена или възникна грешка.');
        }
    } catch (err) {
        console.error("Грешка при записване.", err);
    }
}

loadMissions();