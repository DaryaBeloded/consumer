// npm test

const assert = require('assert');
const {getFullMessage} = require('./consumer.js');

it('правильно формирует ответ на сервер: 360 ДНЕЙ', () => {
	let expect = 'До нового года: 360 дней!'; 
	let curr = getFullMessage('360');
  	assert.equal(curr, expect);
});


it('правильно формирует ответ на сервер: 3 ДНЯ', () => {
	let expect = 'До нового года: 3 дня!'; 
	let curr = getFullMessage('3');
  	assert.equal(curr, expect);
});

it('правильно формирует ответ на сервер: 1 ДЕНЬ', () => {
	let expect = 'До нового года: 1 день!'; 
	let curr = getFullMessage('1');
  	assert.equal(curr, expect);
});