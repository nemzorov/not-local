const dgram = require("dgram");
const notifier = require("node-notifier");

const PORT = 5005;
const BROADCAST_IP = "255.255.255.255";

// имя текущего пользователя
const from = "Ирина"; // замените на своё

// список всех коллег
const colleagues = ["Алексей", "Маша", "Олег", "Лена", "Сергей", "Ирина"];

// кто сейчас в сети
const onlineUsers = {}; // { username: timeoutId }

function startReceiver() {
    const server = dgram.createSocket("udp4");

    server.on("message", (msg) => {
        try {
            const parsed = JSON.parse(msg.toString());
            const { type, from: sender, to, message } = parsed;

            // Получили статус "я в сети"
            if (type === "status") {
                if (sender === from) return; // не обрабатываем своё

                if (!onlineUsers[sender]) {
                    addUserToUI(sender);
                }

                // обновляем таймер
                clearTimeout(onlineUsers[sender]);
                onlineUsers[sender] = setTimeout(() => {
                    removeUserFromUI(sender);
                    delete onlineUsers[sender];
                }, 15000);
            }

            // Получили пинг
            if (type === "ping" && to === from) {
                console.log(`📨 Вызов от ${sender}: ${message}`);
                notifier.notify({
                    title: `Вызов от ${sender}`,
                    message: message || "Тебя зовут",
                    sound: true
                });
            }
        } catch (error) {
            console.error("Ошибка при получении сообщения:", error.message);
        }
    });

    server.bind(PORT, () => {
        console.log(`🎧 Слушаю порт ${PORT}...`);
    });
}

function sendMessage(payload) {
    const client = dgram.createSocket("udp4");

    const message = Buffer.from(JSON.stringify(payload));

    client.bind(() => {
        client.setBroadcast(true);
        client.send(message, 0, message.length, PORT, BROADCAST_IP, (err) => {
            if (err) console.error(err.message);
            client.close();
        });
    });
}

function broadcastStatus() {
    sendMessage({ type: "status", from });
}

function sendPing(to) {
    sendMessage({
        type: "ping",
        from,
        to,
        message: "Подойди, пожалуйста"
    });
}

function notifyAll() {
    colleagues.forEach((name) => {
        if (name !== from) {
            sendPing(name);
        }
    });
}

// Интерфейс
window.addEventListener("DOMContentLoaded", () => {
    const userList = document.getElementById("online");
    const buttonsContainer = document.getElementById("buttons");

    startReceiver();
    setInterval(broadcastStatus, 5000); // каждые 5 сек — сообщение "я в сети"
    broadcastStatus(); // сразу при старте

    // Кнопка для вызова всех
    document.getElementById("notifyAll").onclick = () => notifyAll();

    // Создание кнопок для каждого сотрудника
    colleagues.forEach((name) => {
        if (name === from) return;

        const btn = document.createElement("button");
        btn.textContent = `Позвать ${name}`;
        btn.id = `btn-${name}`;
        btn.disabled = true;
        btn.onclick = () => sendPing(name);
        buttonsContainer.appendChild(btn);
    });
});

// Отображение в интерфейсе
function addUserToUI(name) {
    const btn = document.getElementById(`btn-${name}`);
    if (btn) btn.disabled = false;

    const el = document.getElementById("online-list");
    if (el && !document.getElementById(`online-${name}`)) {
        const li = document.createElement("li");
        li.id = `online-${name}`;
        li.textContent = name;
        el.appendChild(li);
    }
}

function removeUserFromUI(name) {
    const btn = document.getElementById(`btn-${name}`);
    if (btn) btn.disabled = true;

    const el = document.getElementById(`online-${name}`);
    if (el) el.remove();
}
