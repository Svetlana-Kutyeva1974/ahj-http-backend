
const http = require('http');
const fs = require('fs');
const uuid = require('uuid');
// const {URL} = require('url');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
// require('xmlhttprequest');
// const cors = require('koa2-cors');
const port = process.env.PORT || 7070;
// const public = path.join(__dirname, 'public');
const cors = require('koa2-cors');

class Ticket {
  constructor(id, name, status, created) {
    this.id = id // идентификатор (уникальный в пределах системы)
    this.name = name // краткое описание
    this.status = status // boolean - сделано или нет
    this.created = created // дата создания (timestamp)
  }
}

class TicketFull {
  constructor(id, name, description, status, created) {
    this.id = id // идентификатор (уникальный в пределах системы)
    this.name = name // краткое описание
    this.description = description // полное описание
    this.status = status // boolean - сделано или нет
    this.created = created // дата создания (timestamp)
  }
}

let ticketsFull = [
  new TicketFull(0, 'Переустановить Win', 'Переустановить Windows 10,пк холл 24', false, new Date().toString().slice(3,21)),
  new TicketFull(1, 'Поменять cartridge', 'Поменять краску в принтере, ком #404', true, new Date().toString().slice(3,21)),
  new TicketFull(2, 'Установить обновление', 'Установить обновление КВ-ХХХ', true, new Date().toString().slice(3,21))
];


function arrayOfTickets() {
  const arr = [];
  ticketsFull.forEach((item) => {
    arr.push(new Ticket(item.id, item.name, item.status, item.created));
  });
  return arr;
}

function findTicket(id) {
  const result = ticketsFull.find((ticket) => ticket.id === id);
  return result;
}


// слушаем определённый порт
/*server.listen(port, (err) => {
if (err) {
  console.log('Error occured:', error);
return;
}
  console.log(`server is listening on ${port}`);
});
*/
// ====без koa



//-----koa-body--- организация сервера
const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();
// const server = http.createServer(app.callback()).listen(port); дальше есть

// позволить многопоточность и джисон
app.use(koaBody({
    text: true,
    urlencoded: true,
    multipart: true,
    json: true,
  }));

app.use(async ctx => {
  // что хотим получить
  
  const params = new URLSearchParams(ctx.request.querystring);
  console.log('urlsearch=====', params, params.get('method'), params.get('id'));
  console.log('ctx.request.querystring===', ctx.request.querystring, decodeURIComponent(ctx.request.querystring));
  console.log('ctx.request.query-----------------',ctx.request.query);
  //const {name, phone} = `${decodeURIComponent(ctx.request.querystring)}`;
  // const { name, phone } = `${params}`;
  const name = params.get('method');
  const phone = params.get('id');
  // or 
  // const {name1, phone1} = ctx.request.body;
  const { name1, phone1 } = ctx.request.body;// если post запрос, то будет боди ?, 
  // то что было отправлено методом пост, тело запроса

  console.log('ctx.request.body===', ctx.request.body, name, phone, name1, phone1);
  // заголовки
  // const { name, phone } = ctx.request.body;
  
    ctx.response.set({
    'Access-Control-Allow-Origin': '*',
    });

  // здесь можем обработать данные
   //for task
   // const params = new URLSearchParams(ctx.request.querystring);
  const obj = { method: params.get('method'), id: params.get('id') };
  const { method, id } = obj;
  const { body } = ctx.request;// данные формыб обьект

  console.log('==method:', method, '==id:', id, '=ctx body=', body);
  switch (method) {
    case 'allTickets':
      ctx.response.body = arrayOfTickets();
      console.log('ctx.response.body return!!!', arrayOfTickets(), ctx.request.body);
      return;
    case 'ticketById':
      if (ctx.request.query.id) {
        ctx.response.body = findTicket(+id);
        console.log('ctx.response.body return!!!', findTicket(+id), ctx.request.body);
      }
      return;
    case 'createTicket':
      const nextId = ticketsFull.length;
      ticketsFull[nextId] = new TicketFull(nextId, body.title, body.description, false, new Date().toString().slice(3,21));
      // ticketsFull.push(new TicketFull(nextId, body.title, body.description, false, new Date().toString().slice(3,21)));
      ticketsFull.push(ticketsFull[nextId]);
      ctx.response.body = ticketsFull[nextId];
      console.log('new tiket length ', ticketsFull.length, ticketsFull[nextId]);
      return;
    case 'editTicket':
      const index = body.id;
      ticketsFull[index].name = body.title;
      ticketsFull[index].description = body.description;
      ctx.response.body = ticketsFull[index];
      return;
    case 'deleteTicket':
      const ind = ticketsFull.findIndex((ticket) => +ticket.id === +id);
      console.log('index', ind);
      ctx.response.body = 'del';
      ticketsFull.splice(ind, 1);
      return;
    default:
      ctx.response.status = 404;
      return;
  }
  //
  // ctx.response.body = 'server response';// это для примера, мне кажется, потом убрать
  // ctx.response.body = 'Ok';// dthyenm ok после обработки//  то что возвращаем после запроса!!!
});
//------------const server = http.createServer(app.callback()).listen(port);

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
/*
const server = http.createServer(app.callback()).listen(port);
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

// const queryString = `name=Vasya&phone=89167932127`;
// const url = `http://localhost:${port}/?${encodeURIComponent(queryString)}`;
/*for (let key in data) {
  url.searchParams.append(`${key}`, data[key]);
  console.log(url);
}
*/

// const url = `http://localhost:${port}/?${encodeURIComponent(queryString)}`;
let url = new URL(`http://localhost:${port}/`);
// const url = `http://localhost:${port}/`;
url.searchParams.set(`method`, 'allTickets');
// url.searchParams.set(`id`, '1');
const xhr = new XMLHttpRequest();
// 
xhr.responseType = 'json';
// event listener here
xhr.addEventListener('readystatechange', (evt) => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log('ok status 200, response', xhr.response);
        // https://server-heroku-7.herokuapp.com/ // deploy
      }
    }
  });
xhr.open('GET', url, true);
xhr.send();

//-------------?name=Vasya&phone=%2B79000000000

const server = http.createServer(app.callback()).listen(port);
/*
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
*/


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
//