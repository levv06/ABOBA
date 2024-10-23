//Основные библиотеки
const express = require("express")
const server = express()
const http = require("http").createServer(server).listen(3000)
const io = require("socket.io")(http)
const fs = require("fs-extra")
//Подключение статических папок
server.use(express.static(__dirname + "/js"))
server.use(express.static(__dirname + "/css"))
server.use("/img", express.static(__dirname + "/img"))
//Подключение главной html страницы
server.get("/", function(request, response) {
    response.sendFile(__dirname + "/index.html")    
})
//Подключение дополнительных html страниц
server.get("/subIndex", function(request, response) {
    response.sendFile(__dirname + "/subSite.html")    
})
//Родительский сокет
io.sockets.on("connection", (socket) => {
    //Принятие запроса с клиента (Дополнительный сокет)
    socket.on("client-server-Request", (clientBody) => {
        //Обработка запроса с клиента
        let serverBody = "hello: " + clientBody
        //Отправка ответа запроса с сервера на клиент
        socket.emit("server-client-Request", serverBody)
    })
    //Пример сокета авторизации
    socket.on("авторизация", (логин_с_клиента, пароль_с_клиента) => {
        //Чтение базы данных
        let database = fs.readJSONSync("database.json")
        //Поиск пользователя в БД по логину и паролю
        for (let i = 0; i < database.length; i++) {
            //сравнение введенных данных и данных из БД
            if (логин_с_клиента == database[i].login && пароль_с_клиента == database[i].password) {
                //сокет для переадресации
                socket.emit("переадресация")
                //Прекращение цикла
                break
            }
        }
    })
    //Пример сокета регистрации
    socket.on("регистрация", (логин, пароль) => {
        //Чтение базы данных
        let database = fs.readJSONSync("database.json")
        //Формирование нового пользователя
        let user = {
            "login": логин,
            "password": пароль
        }
        //Добавление нового пользователя в БД
        database.push(user)
        //Построение структуры БД (нужно для того, чтобы БД не записывалась в строку)
        database = JSON.stringify(database, null, 4)
        //Сохранение изменений в БД
        fs.writeFileSync("database.json", database)
    })
})