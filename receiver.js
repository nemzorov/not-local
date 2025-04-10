// receiver.js (приемник)
const dgram = require("dgram");
const notifier = require("node-notifier");

const PORT = 5005;

const server = dgram.createSocket("udp4");

server.on("message", (msg, rinfo) => {
    try {
        const { to, from, message } = JSON.parse(msg.toString());

        // Имя текущего пользователя — поменяй на своё
        const myName = "Максим";

        if (to === myName) {
            console.log(`📨 Вызов от ${from}: ${message}`);

            notifier.notify({
                title: `Вызов от ${from}`,
                message: message || "Тебя зовут",
                sound: true
            });
        }
    } catch (e) {
        console.error("Ошибка при получении сообщения:", e.message);
    }
});

server.bind(PORT, () => {
    console.log(`🎧 Слушаю порт ${PORT}...`);
});