const auth = {
    token: localStorage.getItem("token") || "",
    userData: {},
    isGuest: false,
    guestLeft: parseInt(localStorage.getItem('guestLeft') ?? '3'),
    GUEST_LIMIT: 3,

    save(data) {
        this.token = data.token;
        this.userData = data;
        localStorage.setItem('token', this.token);
        localStorage.setItem('userData', JSON.stringify(data));
        this.isGuest = false;
        localStorage.removeItem('guestLeft');
        this.updateUI();
    },

    logout() {
        this.token = '';
        this.userData = {};
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        this.isGuest = true;
        this.guestLeft = parseInt(localStorage.getItem('guestLeft') ?? this.GUEST_LIMIT);
        this.updateUI();
        app.showPage('pg-login');
    },

    async doLogin() {
        const email = document.getElementById('login-email').value.trim();
        const pw = document.getElementById('login-pw').value;
        const btn = document.getElementById('login-btn');
        
        btn.disabled = true;
        btn.textContent = 'Загрузка…';
        
        try {
            const data = await api.call('/login', {
                method: 'POST',
                body: { email, password: pw }
            });
            
            if (data.error) {
                app.showErr('login-err', data.error);
                return;
            }
            
            this.save(data);
            app.showPage('pg-cabinet');
        } catch (e) {
            app.showErr('login-err', 'Ошибка соединения');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Войти →';
        }
    },

    async doRegister() {
        const email = document.getElementById('reg-email').value.trim();
        const pw = document.getElementById('reg-pw').value;
        const btn = document.getElementById('reg-btn');
        
        btn.disabled = true;
        btn.textContent = 'Загрузка…';
        
        try {
            const data = await api.call('/register', {
                method: 'POST',
                body: { email, password: pw }
            });
            
            if (data.error) {
                app.showErr('reg-err', data.error);
                return;
            }
            
            this.save(data);
            app.showPage('pg-cabinet');
        } catch (e) {
            app.showErr('reg-err', 'Ошибка соединения');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Создать аккаунт →';
        }
    },

    async loadCabinet() {
        try {
            const data = await api.call('/me');
            if (data.error) {
                this.logout();
                return;
            }
            this.userData = data;
            localStorage.setItem('userData', JSON.stringify(data));
            app.renderCabinet(data);
        } catch (e) {
            console.error('Failed to load cabinet:', e);
        }

        try {
            const history = await api.call('/history');
            app.renderHistory(Array.isArray(history) ? history : []);
        } catch (e) {
            app.renderHistory([]);
        }
    },

    updateUI() {
        const cb = document.getElementById('cab-btn');
        const lb = document.getElementById('login-btn-top');
        
        if (cb) cb.style.display = this.token ? 'block' : 'none';
        if (lb) lb.style.display = this.token ? 'none' : 'block';
        
        app.updateCounter();
    },

    init() {
        const saved = localStorage.getItem('userData');
        if (this.token && saved) {
            this.userData = JSON.parse(saved);
            this.isGuest = false;
            localStorage.removeItem('guestLeft');
            this.updateUI();
        } else {
            this.isGuest = true;
            this.guestLeft = parseInt(localStorage.getItem('guestLeft') ?? this.GUEST_LIMIT);
            app.updateGuestCounter();
        }
    }
};
