#!/usr/bin/env node

// var amqp = require('amqplib/callback_api');
const AWS = require('aws-sdk');

let channel = null;
const QUEUE = 'hello_world';
const WRONGQUEUE = 'wrong_queue';


const getFullMessage = function(data) {
  let dayname = '';
  const ds = '' + data;
  const dd = parseInt(ds.substr(ds.length - 1));
  if(data > 4 && data < 21) dayname = ' дней';
  else if (dd == 1) dayname = ' день';
  else if (dd == 2 || dd == 3 || dd == 4) dayname = ' дня';
  else dayname =' дней';
  return 'До нового года: ' + data + dayname + '!';
}


require('amqplib').connect('amqp://user:bitnami@127.0.0.1')
.then(conn =>conn.createChannel())
.then(ch => {

    ch.assertQueue(WRONGQUEUE);
    ch.assertQueue(QUEUE)
    .then(() => {

      try {
        console.log(' [x] Awaiting RPC requests');

        //Watch incomming messages
        ch.consume(QUEUE, msg => {
  
          let result = 'lol';
          console.log(msg.content.toString());

          const lambda = new AWS.Lambda({
              region: 'eu-central-1'
          });
          const params = {
            FunctionName: 'daysleft', /* required */
            Payload: JSON.stringify({date: msg.content.toString()})
          };

          lambda.invoke(params, function(err, data) {
            if (err) {
              smthWrong(msg, ch);      
            } else  {
              // console.log(data);           // successful response
              result = getFullMessage(data.Payload);
              console.log(result)

              ch.sendToQueue(msg.properties.replyTo,
                new Buffer.from(result.toString()),
                // уникальный идентификатор, который покажет, какой таск какому запросу принадлежит
                {correlationId: msg.properties.correlationId});
            }
          });

          // подтверждение для информирования RabbitMQо том, что полученное сообщение было обработано и его можно удалить
          // если подтверждение не будет получено, этот таск передадут его другому подписчику
          ch.ack(msg);
        });
      } catch(err) {
        smthWrong(msg, ch);   
      }
  });
});

function smthWrong(msg, ch) {
  if(msg.properties.type === 'retry') {  
    console.log('ну эх');
             
    ch.sendToQueue(WRONGQUEUE,
      new Buffer.from('Нового года не будет :('),
      // уникальный идентификатор, который покажет, какой таск какому запросу принадлежит
      {correlationId: msg.properties.correlationId});
                    
  } else {
    console.log('i will give you one more chance')
                    
    ch.sendToQueue(QUEUE,
    new Buffer.from(msg.content.toString()),
    // уникальный идентификатор, который покажет, какой таск какому запросу принадлежит
    {correlationId: msg.properties.correlationId, replyTo: msg.properties.replyTo, type: 'retry'});
  }
}

module.exports.getFullMessage = getFullMessage;
