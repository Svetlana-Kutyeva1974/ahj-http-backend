
const http = require('http');
const fs = require('fs');
const uuid = require('uuid');
// const {URL} = require('url');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
// require('xmlhttprequest');
// const cors = require('koa2-cors');
const port = process.env.PORT || 7078;
// const public = path.join(__dirname, 'public');
const cors = require('koa2-cors');

// ====,без коа сервер
/*
const server = http.createServer((req, res) => {
  console.log('из первого примера', req);
  console.log('из файла сервер', req.url);
  res.end('server response http-----------');
});

// слушаем определённый порт
server.listen(port, (err) => {
if (err) {
  console.log('Error occured:', error);
return;
}
  console.log(`server is listening on ${port}`);
});
*/
// ====без koa

/*--------koa
//
const http = require('http');
const Koa = require('koa');
const app = new Koa();
app.use(async (ctx) => {
  console.log(ctx.request.query);
  ctx.response.body = 'server response';
});
const server = http.createServer(app.callback()).listen(7070);
*/

//-----koa-body--- организация сервера
const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();
// const server = http.createServer(app.callback()).listen(port); дальше есть

// позволить многопоточность и джисон
app.use(koaBody({
    urlencoded: true,
    multipart: true,
    json: true,
  }));

app.use(async ctx => {
  // что хотим получить
  
  console.log('ctx.request.querystring---', ctx.request.querystring, decodeURIComponent(ctx.request.querystring));
  const {name, phone} = `${decodeURIComponent(ctx.request.querystring)}`;
  // or const {name, phone} = ctx.request.body;
  console.log('ctx.request.body', ctx.request.body, name, phone);
  // заголовки
  // const { name, phone } = ctx.request.body;
    ctx.response.set({
    'Access-Control-Allow-Origin': '*',
    });

  // здесь можем обработать данные
  ctx.response.body = 'server response';// это для примера, мне кажется, потом убрать
  ctx.response.body = 'Ok';// dthyenm ok после обработки
});
const server = http.createServer(app.callback()).listen(port);

//==== заголовки обработка=== из презы
app.use(async (ctx, next) => {
    const origin = ctx.request.get('Origin');
    if (!origin) {
      return await next();
    } 
    const headers = { 'Access-Control-Allow-Origin': '*', };
    if (ctx.request.method !== 'OPTIONS') {
      ctx.response.set({...headers});
    try {
      return await next();
    } catch (e) {
      e.headers = {...e.headers, ...headers};
      throw e;// проброс исключения 
      // alert(e);// throw new Error(e);
    }
    } 

    if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
    ...headers,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Allow-Request-Headers'));
    } 
    ctx.response.status = 204; // No content
    }
    });
//======


//---------------слушаем определённый порт= 
// закрываем прослушку, если сервер уже запущен.а потом начинаем слушать!!! иначе ошибка часто

setTimeout(() => {
  server.close();
  server.listen(port, (err) => {
    if (err) {
      console.log('Error occured:', error);
    return;
    }
      console.log(`server is listening on ${port}`);
    });
  //server.listen(PORT, HOST);
}, 1000);

//было так // слушаем определённый порт
/*
server.listen(port, (err) => {
if (err) {
  console.log('Error occured:', error);
return;
}
  console.log(`server is listening on ${port}`);
});
*/


//----------------
//--------ьбщий вид запрос на сервер
/*
const xhr = new XMLHttpRequest(); // создание объекта
xhr.open('<method>', '<url>', '<async>'); // подготовка запроса
xhr.setRequestHeader('<name>', '<value>'); // установка заголовков
xhr.setRequestHeader('<name>', '<value>');
xhr.addEventListener('readystatechange', (evt) => {
  if (xhr.readyState === 4) {
    if (xhr.status === 200) {
      console.log(xhr.response);
    }
  }
});
xhr.send('<body>')
*/

const queryString = `name=Vasya&phone=89167932127`;
// const url = `http://localhost:${port}/?${encodeURIComponent(queryString)}`;
const url = `http://localhost:${port}/?${encodeURIComponent(queryString)}`;
const xhr = new XMLHttpRequest();
xhr.open('GET', url, true);
xhr.responseType = 'json';
// event listener here
xhr.addEventListener('readystatechange', (evt) => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log('ok status 200, response', xhr.response);
      }
    }
  });
xhr.send();

//-------------?name=Vasya&phone=%2B79000000000




// https://www.digitalocean.com/community/tutorials/workflow-nodemon-ru#
// https://nodejsdev.ru/api/querystring/
//В querystring API считается устаревшим. 
// Хотя он все еще поддерживается, новый код должен использовать вместо него {URLSearchParams} API.
//
/**
 * Основная функция для совершения запросов
 * на сервер.
 * */
 /*                                                                           
 const createRequest = (options = {}) => {
    let url = new URL(options.url, `http://localhost:7070`);
    let method = options.method;
    let callback = options.callback;
    let data = options.data;                                
    
    const xhr = new XMLHttpRequest;
    xhr.responseType = 'json';
                                                
      try {
        if (method === `GET`){
          for (let key in data) {
            url.searchParams.append(`${key}`, data[key]);
            console.log(url);
          }
    
          xhr.open( method, url );
          xhr.send();
        }
        else {
           xhr.open( method, url );
           xhr.send( data );
        }
    
      }
      catch ( err ) {
        // перехват сетевой ошибки
        callback( err );
      }
    
      xhr.onload = function() {
        let body = xhr.response;
        if (xhr.status != 200) { // анализируем HTTP-статус ответа, если статус не 200, то произошла ошибка
          console.log(`Ошибка ${xhr.status}: ${xhr.statusText}`); // Например, 404: Not Found
          //callback( e );
          callback(xhr.status , xhr.response);
        } else { // если всё прошло гладко, выводим результат
         // alert(`Готово, получили ${xhr.response.length} байт`); 
          callback(xhr.status , xhr.response);
      }
    };
    
    xhr.onerror = function() {
      throw new Error('Запрос не удался');//console.log("Запрос не удался");
      callback( err );
    };
    
    }
    
           
*/
// список запущ процессов ps -la или все : ps -ax
//ps -la // Для получения основных сведений о процессах, запущенных текущем пользователем
//ps -ela  // Для всех пользователей 
// ps -a  // Базовая информация для текущего пользователя