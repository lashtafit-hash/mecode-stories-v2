{\rtf1\ansi\ansicpg1251\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const auth = \{\
    token: localStorage.getItem("token") || "",\
    userData: \{\},\
    isGuest: false,\
    guestLeft: parseInt(localStorage.getItem('guestLeft') ?? '3'),\
    GUEST_LIMIT: 3,\
\
    save(data) \{\
        this.token = data.token;\
        this.userData = data;\
        localStorage.setItem('token', this.token);\
        localStorage.setItem('userData', JSON.stringify(data));\
        this.isGuest = false;\
        localStorage.removeItem('guestLeft');\
        this.updateUI();\
    \},\
\
    logout() \{\
        this.token = '';\
        this.userData = \{\};\
        localStorage.removeItem('token');\
        localStorage.removeItem('userData');\
        this.isGuest = true;\
        this.guestLeft = parseInt(localStorage.getItem('guestLeft') ?? this.GUEST_LIMIT);\
        this.updateUI();\
        app.showPage('pg-login');\
    \},\
\
    async doLogin() \{\
        const email = document.getElementById('login-email').value.trim();\
        const pw = document.getElementById('login-pw').value;\
        const btn = document.getElementById('login-btn');\
        \
        btn.disabled = true;\
        btn.textContent = '\uc0\u1047 \u1072 \u1075 \u1088 \u1091 \u1079 \u1082 \u1072 \'85';\
        \
        try \{\
            const data = await api.call('/login', \{\
                method: 'POST',\
                body: \{ email, password: pw \}\
            \});\
            \
            if (data.error) \{\
                app.showErr('login-err', data.error);\
                return;\
            \}\
            \
            this.save(data);\
            app.showPage('pg-cabinet');\
        \} catch (e) \{\
            app.showErr('login-err', '\uc0\u1054 \u1096 \u1080 \u1073 \u1082 \u1072  \u1089 \u1086 \u1077 \u1076 \u1080 \u1085 \u1077 \u1085 \u1080 \u1103 ');\
        \} finally \{\
            btn.disabled = false;\
            btn.textContent = '\uc0\u1042 \u1086 \u1081 \u1090 \u1080  \u8594 ';\
        \}\
    \},\
\
    async doRegister() \{\
        const email = document.getElementById('reg-email').value.trim();\
        const pw = document.getElementById('reg-pw').value;\
        const btn = document.getElementById('reg-btn');\
        \
        btn.disabled = true;\
        btn.textContent = '\uc0\u1047 \u1072 \u1075 \u1088 \u1091 \u1079 \u1082 \u1072 \'85';\
        \
        try \{\
            const data = await api.call('/register', \{\
                method: 'POST',\
                body: \{ email, password: pw \}\
            \});\
            \
            if (data.error) \{\
                app.showErr('reg-err', data.error);\
                return;\
            \}\
            \
            this.save(data);\
            app.showPage('pg-cabinet');\
        \} catch (e) \{\
            app.showErr('reg-err', '\uc0\u1054 \u1096 \u1080 \u1073 \u1082 \u1072  \u1089 \u1086 \u1077 \u1076 \u1080 \u1085 \u1077 \u1085 \u1080 \u1103 ');\
        \} finally \{\
            btn.disabled = false;\
            btn.textContent = '\uc0\u1057 \u1086 \u1079 \u1076 \u1072 \u1090 \u1100  \u1072 \u1082 \u1082 \u1072 \u1091 \u1085 \u1090  \u8594 ';\
        \}\
    \},\
\
    async loadCabinet() \{\
        try \{\
            const data = await api.call('/me');\
            if (data.error) \{\
                this.logout();\
                return;\
            \}\
            this.userData = data;\
            localStorage.setItem('userData', JSON.stringify(data));\
            app.renderCabinet(data);\
        \} catch (e) \{\
            console.error('Failed to load cabinet:', e);\
        \}\
\
        try \{\
            const history = await api.call('/history');\
            app.renderHistory(Array.isArray(history) ? history : []);\
        \} catch (e) \{\
            app.renderHistory([]);\
        \}\
    \},\
\
    updateUI() \{\
        const cb = document.getElementById('cab-btn');\
        const lb = document.getElementById('login-btn-top');\
        \
        if (cb) cb.style.display = this.token ? 'block' : 'none';\
        if (lb) lb.style.display = this.token ? 'none' : 'block';\
        \
        app.updateCounter();\
    \},\
\
    init() \{\
        const saved = localStorage.getItem('userData');\
        if (this.token && saved) \{\
            this.userData = JSON.parse(saved);\
            this.isGuest = false;\
            localStorage.removeItem('guestLeft');\
            this.updateUI();\
        \} else \{\
            this.isGuest = true;\
            this.guestLeft = parseInt(localStorage.getItem('guestLeft') ?? this.GUEST_LIMIT);\
            app.updateGuestCounter();\
        \}\
    \}\
\};}