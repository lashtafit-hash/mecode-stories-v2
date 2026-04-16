const app = {
    archetypeData: {},
    selectedCat: null,
    selectedTone: null,
    selectedCount: 3,
    lastGenParams: null,
    
    CAT_LABELS: {
        sell: '✦ Продающие',
        warmup: '◈ Прогрев',
        life: '✿ Лайф',
        expert: '◇ Экспертные'
    },

    showPage(id) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
        document.getElementById(id).classList.add('on');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (id === 'pg-cabinet') auth.loadCabinet();
    },

    showErr(id, msg) {
        const e = document.getElementById(id);
        e.textContent = msg;
        e.classList.add('show');
    },

    hideErr(id) {
        document.getElementById(id).classList.remove('show');
    },

    updateCounter() {
        const el = document.getElementById('top-counter');
        if (!el) return;
        
        const isPaid = auth.userData.is_paid && auth.userData.paid_until && new Date(auth.userData.paid_until) > new Date();
        
        if (isPaid) {
            el.textContent = '∞ Безлимит';
            el.className = 'counter unlimited';
        } else {
            el.textContent = `${auth.userData.free_left ?? 0} из 3`;
            el.className = 'counter';
        }
        el.style.display = 'block';
    },

    updateGuestCounter() {
        const el = document.getElementById('top-counter');
        if (!el) return;
        el.textContent = `${Math.max(auth.guestLeft, 0)} из ${auth.GUEST_LIMIT}`;
        el.className = 'counter';
        el.style.display = 'block';
    },

    goGuest() {
        auth.isGuest = true;
        auth.guestLeft = parseInt(localStorage.getItem('guestLeft') ?? auth.GUEST_LIMIT);
        this.updateGuestCounter();
        this.showPage('pg-app');
    },

    async analyzeNiche() {
        const niche = document.getElementById('niche').value.trim();
        if (!niche) {
            this.showErr('err1', 'Расскажи о своём блоге');
            return;
        }

        if (auth.isGuest && auth.guestLeft <= 0) {
            this.showErr('err1', 'Бесплатные попытки закончились. Зарегистрируйся чтобы продолжить!');
            this.showPage('pg-register');
            return;
        }

        this.hideErr('err1');
        const btn = document.getElementById('analyze-btn');
        btn.innerHTML = '<span class="dot">·</span><span class="dot">·</span><span class="dot">·</span>';
        btn.disabled = true;

        try {
            const data = await api.call('/analyze', {
                method: 'POST',
                body: { niche }
            });
            
            this.archetypeData = data;
            this.renderArchetype(data);
        } catch (e) {
            // Fallback
            this.archetypeData = {
                archetype: 'Правитель + Эстет',
                why: 'Связь с сервером пропала, поэтому показали базовый архетип.',
                deep_need: 'Нужен сильный результат и ощущение уровня.',
                shadow_fear: 'Потратить время на слабый и безликий продукт.',
                visual_code: 'Чистый визуал, статус, точность.',
                hook_phrase: 'Люди покупают то, что считывается как уровень.',
                content_vector: 'Контраст, разбор качества, уверенная экспертность.'
            };
            this.renderArchetype(this.archetypeData);
        }

        btn.textContent = '→';
        btn.disabled = false;
    },

    renderArchetype(data) {
        document.getElementById('arch-name').textContent = data.archetype || '';
        document.getElementById('arch-why').textContent = data.why || '';
        document.getElementById('arch-need').textContent = data.deep_need || '';
        document.getElementById('arch-fear').textContent = data.shadow_fear || '';
        document.getElementById('arch-visual').textContent = data.visual_code || '';
        document.getElementById('arch-vector').textContent = data.content_vector || '';
        document.getElementById('arch-hook').textContent = data.hook_phrase ? `«${data.hook_phrase}»` : '';
        
        document.getElementById('arch-card').classList.add('show');
        document.getElementById('cats-label').classList.add('show');
        document.getElementById('cats-grid').classList.add('show');
    },

    pickCat(el, cat) {
        document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('sel'));
        el.classList.add('sel');
        this.selectedCat = cat;
        document.getElementById('count-row').style.display = 'flex';
        document.getElementById('btn-next').classList.add('show');
    },

    pickCount(el, n) {
        document.querySelectorAll('.count-pill').forEach(p => p.classList.remove('sel'));
        el.classList.add('sel');
        this.selectedCount = n;
    },

    pickTone(el, tone) {
        document.querySelectorAll('.tone-pill').forEach(p => p.classList.remove('sel'));
        el.classList.add('sel');
        this.selectedTone = tone;
    },

    goStep2() {
        if (!this.selectedCat) {
            this.showErr('err1', 'Выбери тип сторис');
            return;
        }
        this.hideErr('err1');
        document.getElementById('sc1').classList.remove('on');
        document.getElementById('sc2').classList.add('on');
        document.getElementById('cat-badge').textContent = this.CAT_LABELS[this.selectedCat];
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    goBack() {
        document.getElementById('sc2').classList.remove('on');
        document.getElementById('sc1').classList.add('on');
        document.getElementById('result-wrap').classList.remove('show');
        document.getElementById('paywall').classList.remove('show');
        document.getElementById('btn-restart').classList.remove('show');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    restartAll() {
        this.selectedCat = null;
        this.selectedTone = null;
        this.selectedCount = 3;
        this.archetypeData = {};
        this.lastGenParams = null;
        
        document.getElementById('niche').value = '';
        document.getElementById('topic').value = '';
        document.getElementById('goal').value = '';
        
        document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('sel'));
        document.querySelectorAll('.tone-pill').forEach(p => p.classList.remove('sel'));
        document.querySelectorAll('.count-pill').forEach((p, i) => {
            p.classList.remove('sel');
            if (i === 0) p.classList.add('sel');
        });
        
        document.getElementById('arch-card').classList.remove('show');
        document.getElementById('cats-label').classList.remove('show');
        document.getElementById('cats-grid').classList.remove('show');
        document.getElementById('count-row').style.display = 'none';
        document.getElementById('btn-next').classList.remove('show');
        document.getElementById('result-wrap').classList.remove('show');
        document.getElementById('paywall').classList.remove('show');
        document.getElementById('btn-restart').classList.remove('show');
        document.getElementById('reg-prompt').style.display = 'none';
        document.getElementById('sc2').classList.remove('on');
        document.getElementById('sc1').classList.add('on');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async generate() {
        const topic = document.getElementById('topic').value.trim();
        if (!topic) {
            this.showErr('err2', 'Напиши ситуацию или тему');
            return;
        }
        if (!this.selectedTone) {
            this.showErr('err2', 'Выбери тональность');
            return;
        }

        if (auth.isGuest && auth.guestLeft <= 0) {
            document.getElementById('reg-prompt').style.display = 'block';
            document.getElementById('reg-prompt').scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        this.hideErr('err2');
        const btn = document.getElementById('gen-btn');
        const regenBtn = document.getElementById('btn-regen');
        
        btn.innerHTML = 'Создаём сторис <span class="dot">·</span><span class="dot">·</span><span class="dot">·</span>';
        btn.disabled = true;
        
        this.showErr('err2', `Подождите, генерируем гениальные сторис на ${this.selectedCount} экранов. Обычно это занимает 15–30 секунд ✦`);
        document.getElementById('err2').style.color = 'var(--muted)';
        
        if (regenBtn) regenBtn.disabled = true;
        
        document.getElementById('result-wrap').classList.remove('show');
        document.getElementById('paywall').classList.remove('show');
        document.getElementById('hook-block').style.display = 'none';
        document.getElementById('post-block').style.display = 'none';
        document.getElementById('cta-block').style.display = 'none';
        document.getElementById('stories-list').innerHTML = '';

        const params = {
            niche: document.getElementById('niche').value.trim(),
            archetype: this.archetypeData.archetype || '',
            archetype_data: this.archetypeData,
            cat: this.selectedCat,
            tone: this.selectedTone,
            topic,
            goal: document.getElementById('goal').value.trim(),
            count: this.selectedCount
        };
        this.lastGenParams = params;

        try {
            const data = await api.call('/generate', {
                method: 'POST',
                body: params
            });

            if (data.need_payment) {
                document.getElementById('paywall').classList.add('show');
                return;
            }
            
            if (data.error) {
                document.getElementById('err2').style.color = 'var(--pink2)';
                this.showErr('err2', data.error);
                return;
            }

            if (auth.isGuest) {
                auth.guestLeft = Math.max(auth.guestLeft - 1, 0);
                localStorage.setItem('guestLeft', auth.guestLeft);
                this.updateGuestCounter();
                
                if (auth.guestLeft <= 0) {
                    setTimeout(() => {
                        const rp = document.getElementById('reg-prompt');
                        if (rp) {
                            rp.style.display = 'block';
                            rp.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 800);
                }
            } else {
                if (typeof data.free_left !== 'undefined') auth.userData.free_left = data.free_left;
                if (typeof data.is_paid !== 'undefined') auth.userData.is_paid = data.is_paid;
                if (data.paid_until) auth.userData.paid_until = data.paid_until;
                localStorage.setItem('userData', JSON.stringify(auth.userData));
                this.updateCounter();
            }

            this.hideErr('err2');
            document.getElementById('err2').style.color = 'var(--pink2)';
            this.parseAndRender(data.result || '', data.strategy || '');
            document.getElementById('btn-restart').classList.add('show');
            
        } catch (e) {
            document.getElementById('err2').style.color = 'var(--pink2)';
            this.showErr('err2', 'Ошибка соединения с сервером.');
        }
        
        btn.textContent = 'Создать сторис →';
        btn.disabled = false;
        if (regenBtn) regenBtn.disabled = false;
    },

    parseAndRender(text, strategy) {
        document.getElementById('strategy-tag').textContent = strategy ? `Стратегия: ${strategy}` : '';
        
        const hookM = text.match(/HOOK:\s*(.+?)(?:\n|$)/i);
        if (hookM) {
            document.getElementById('hook-text').textContent = hookM[1].trim();
            document.getElementById('hook-block').style.display = 'block';
        }
        
        const list = document.getElementById('stories-list');
        list.innerHTML = '';
        
        const sr = /СТОРИС\s*(\d+)[^\n]*:\s*([\s\S]*?)(?=СТОРИС\s*\d+|ПОСТ:|CTA:|$)/gi;
        let m;
        while ((m = sr.exec(text)) !== null) {
            const c = m[2].trim();
            if (!c) continue;
            
            const el = document.createElement('div');
            el.className = 'story-item';
            
            const num = document.createElement('span');
            num.className = 'story-num';
            num.textContent = `Сторис ${m[1]}`;
            
            const body = document.createElement('div');
            body.className = 'story-text';
            body.style.whiteSpace = 'pre-line';
            body.textContent = c;
            
            el.appendChild(num);
            el.appendChild(body);
            list.appendChild(el);
        }
        
        const pm = text.match(/ПОСТ:\s*([\s\S]*?)(?=CTA:|$)/i);
        if (pm && pm[1].trim()) {
            const postText = document.getElementById('post-text');
            postText.style.whiteSpace = 'pre-line';
            postText.textContent = pm[1].trim();
            document.getElementById('post-block').style.display = 'block';
        }
        
        const cm = text.match(/CTA:\s*([\s\S]*?)$/i);
        if (cm && cm[1].trim()) {
            const ctaText = document.getElementById('cta-text');
            ctaText.style.whiteSpace = 'pre-line';
            ctaText.textContent = cm[1].trim();
            document.getElementById('cta-block').style.display = 'block';
        }
        
        document.getElementById('result-wrap').classList.add('show');
        document.getElementById('result-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    copyRes() {
        const parts = [];
        const h = document.getElementById('hook-text').textContent;
        if (h) parts.push('HOOK: ' + h);
        
        document.querySelectorAll('.story-item').forEach(s => {
            parts.push(s.querySelector('.story-num').textContent + ':\n' + s.querySelector('.story-text').innerText);
        });
        
        const p = document.getElementById('post-text').textContent;
        if (p) parts.push('ПОСТ:\n' + p);
        
        const c = document.getElementById('cta-text').textContent;
        if (c) parts.push('CTA: ' + c);
        
        navigator.clipboard.writeText(parts.join('\n\n')).then(() => {
            const btn = document.querySelector('.btn-copy-res');
            btn.textContent = 'Скопировано ✦';
            setTimeout(() => btn.textContent = 'Скопировать', 2000);
        });
    },

    async startPayment(source) {
        const checkboxId = source === 'cab' ? 'oferta-check-cab' : 'oferta-check-wall';
        if (!document.getElementById(checkboxId).checked) {
            alert('Примите условия оферты');
            return;
        }
        
        try {
            const data = await api.call('/create-payment', {
                method: 'POST',
                body: { return_url: window.location.href }
            });
            
            if (data.payment_url) {
                window.location.href = data.payment_url;
            } else {
                alert('Ошибка создания платежа');
            }
        } catch (e) {
            alert('Ошибка соединения');
        }
    },

    renderCabinet(data) {
        document.getElementById('cab-email').textContent = data.email;
        
        const isPaid = data.is_paid && data.paid_until && new Date(data.paid_until) > new Date();
        
        document.getElementById('cab-status').textContent = isPaid ? 'Подписка активна ✦' : 'Бесплатный период';
        document.getElementById('cab-status').className = 'sval' + (isPaid ? ' paid' : '');
        document.getElementById('cab-free').textContent = isPaid ? '∞ Безлимит' : `${data.free_left ?? 0} из 3`;
        document.getElementById('cab-pay-btn').className = 'pay-btn' + (isPaid ? ' hide' : '');
        document.getElementById('cab-pay-note').style.display = isPaid ? 'block' : 'none';
        
        if (data.paid_until) {
            const dt = new Date(data.paid_until);
            document.getElementById('cab-until').textContent = dt.toLocaleDateString('ru-RU');
            document.getElementById('cab-until-row').style.display = isPaid ? 'flex' : 'none';
        }
    },

    renderHistory(items) {
        const list = document.getElementById('hist-list');
        list.innerHTML = '';
        
        if (!items.length) {
            const empty = document.createElement('div');
            empty.className = 'hist-empty';
            empty.textContent = 'Генераций пока нет';
            list.appendChild(empty);
            return;
        }
        
        items.forEach(it => {
            const item = document.createElement('div');
            item.className = 'hist-item';
            
            const niche = document.createElement('div');
            niche.className = 'hist-niche';
            niche.textContent = `${it.niche || '—'} · ${it.archetype || ''}`;
            
            const meta = document.createElement('div');
            meta.className = 'hist-meta';
            meta.textContent = `${it.tone || ''} · ${it.cat || ''} · ${it.created_at}`;
            
            item.appendChild(niche);
            item.appendChild(meta);
            list.appendChild(item);
        });
    },

    installPWA() {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            window.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                window.deferredPrompt = null;
            });
        }
    },

    init() {
        auth.init();
        this.showPage('pg-app');
        
        document.getElementById('niche').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.analyzeNiche();
        });
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
        });
    }
};

// Старт
document.addEventListener('DOMContentLoaded', () => app.init());
