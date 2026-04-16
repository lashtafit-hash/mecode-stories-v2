{\rtf1\ansi\ansicpg1251\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // API \uc0\u1082 \u1086 \u1085 \u1092 \u1080 \u1075 \u1091 \u1088 \u1072 \u1094 \u1080 \u1103 \
const REMOTE_API = "https://web-production-3a26.up.railway.app";\
const API = (window.location.protocol === 'file:' || ['localhost','127.0.0.1'].includes(window.location.hostname))\
    ? 'http://127.0.0.1:5000'\
    : REMOTE_API;\
\
// \uc0\u1060 \u1083 \u1072 \u1075  \u1076 \u1083 \u1103  \u1087 \u1077 \u1088 \u1077 \u1082 \u1083 \u1102 \u1095 \u1077 \u1085 \u1080 \u1103  \u1085 \u1072  v2 (\u1087 \u1086 \u1082 \u1072  false)\
const USE_V2 = false;\
\
const api = \{\
    async call(endpoint, options = \{\}) \{\
        const url = USE_V2 && endpoint === '/generate' \
            ? '/generate-v2' \
            : endpoint;\
        \
        const headers = \{\
            'Content-Type': 'application/json',\
            ...options.headers\
        \};\
        \
        if (auth.token) \{\
            headers['Authorization'] = `Bearer $\{auth.token\}`;\
        \}\
        \
        try \{\
            const response = await fetch(`$\{API\}$\{url\}`, \{\
                method: options.method || 'GET',\
                headers,\
                body: options.body ? JSON.stringify(options.body) : null\
            \});\
            \
            if (response.status === 401 && auth.token) \{\
                auth.logout();\
                throw new Error('\uc0\u1057 \u1077 \u1089 \u1089 \u1080 \u1103  \u1080 \u1089 \u1090 \u1077 \u1082 \u1083 \u1072 ');\
            \}\
            \
            return await response.json();\
        \} catch (e) \{\
            console.error('API error:', e);\
            throw e;\
        \}\
    \}\
\};}