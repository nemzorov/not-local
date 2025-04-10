const dgram = require("dgram");

const PORT = 5005;
const BROADCAST_IP = "255.255.255.255";

// Текущий пользователь
const from = "Максим";

// Коллеги
const colleagues = ["Алексей", "Маша", "Руслан", "Максим", "Сергей"];

window.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("buttons");

    colleagues.forEach((name) => {
        const btn = document.createElement("button");
        btn.textContent = `Позвать ${name}`;
        btn.onclick = () => sendPing(name);
        container.appendChild(btn);
    });
});

function sendPing(to) {
    const client = dgram.createSocket("udp4");

    const message = {
        from,
        to,
        message: "Подойди, пожалуйста"
    };

    const payload = Buffer.from(JSON.stringify(message));

    client.bind(() => {
        client.setBroadcast(true);
        client.send(payload, 0, payload.length, PORT, BROADCAST_IP, (err) => {
            if (err) console.error(err.message);
            client.close();
        });
    });
}