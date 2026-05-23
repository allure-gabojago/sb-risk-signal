const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const NaverStrategy = require('passport-naver-v2').Strategy;
const InstagramStrategy = require('passport-instagram-graph').Strategy;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const JWT_SECRET = "INVEST_HUB_SECRET_KEY_1234!";
app.use(express.json());
app.use(passport.initialize());

const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email, provider: user.provider }, JWT_SECRET, { expiresIn: '7d' });
};

passport.use(new GoogleStrategy({ clientID: "G", clientSecret: "G", callbackURL: "/auth/google/callback" }, (a, r, p, d) => d(null, { id: p.id, provider: 'google' })));
passport.use(new KakaoStrategy({ clientID: "K", callbackURL: "/auth/kakao/callback" }, (a, r, p, d) => d(null, { id: p.id, provider: 'kakao' })));
passport.use(new NaverStrategy({ clientID: "N", clientSecret: "N", callbackURL: "/auth/naver/callback" }, (a, r, p, d) => d(null, { id: p.id, provider: 'naver' })));
passport.use(new InstagramStrategy({ clientID: "I", clientSecret: "I", callbackURL: "/auth/instagram/callback" }, (a, r, p, d) => d(null, { id: p.id, provider: 'instagram' })));

let marketData = {
    TSLA: { price: 174.60, change: 3.15 },
    SAMSUNG: { price: 76200, change: -1.23 },
    BTC: { price: 98450000, change: 0.85 },
    NASDAQ: { price: 18230.25, change: -0.45 }
};

setInterval(() => {
    marketData.TSLA.price += (Math.random() - 0.5) * 1.2;
    marketData.TSLA.change = ((marketData.TSLA.price - 170) / 170 * 100);
    marketData.SAMSUNG.price += Math.round((Math.random() - 0.5) * 500);
    marketData.SAMSUNG.change = ((marketData.SAMSUNG.price - 77000) / 77000 * 100);
    marketData.BTC.price += Math.round((Math.random() - 0.5) * 120000);
    marketData.BTC.change = ((marketData.BTC.price - 97500000) / 97500000 * 100);
    marketData.NASDAQ.price += (Math.random() - 0.5) * 15;
    marketData.NASDAQ.change = ((marketData.NASDAQ.price - 18300) / 18300 * 100);

    const payload = JSON.stringify(marketData);
    wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) client.send(payload); });
}, 1000);

wss.on('connection', (ws) => { ws.send(JSON.stringify(marketData)); });

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` 투자 커뮤니티 백엔드 통합 엔진이 성공적으로 켜졌습니다.`);
    console.log(` 로컬 작동 포트 주소: http://localhost:${PORT}`);
    console.log(`=======================================================`);
});
