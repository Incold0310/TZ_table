const JSON_FILE= JSON.parse(JSON_DOC); //Парсим исходный файл
const tbodyMain = document.querySelector("tbody");//Тело таблицы
let rowNumber=0; //Переменная для нумерования строк
let tbodyMainCopy; //Создадим копию тела таблицы, которая понадобится для корректной работы поиска по таблице

/*В данном способе реализации задачи, я не использую стрелочные функции,
т.к. их преимущества не нужны, а ключевое слово function визуально мне нравится больше*/

//Создание таблицы
function createTable() {
	//Использую классический цикл for, т.к. важен текущий индекс и он быстрее чем forEach
	for (let i=0; i<JSON_FILE.length; i++) { 
		rowNumber++;
		//Создаём строки
		let row = document.createElement("tr");
		row.className="rows"; 
		row.setAttribute("data-toggle","modal");   // Здесь и на следующей строке дабавляем
		row.setAttribute("data-target","#modalWindow");	//строкам атрибуты (нужно для стилистики)	
		tbodyMain.appendChild(row);
		//Создаём ячейки в строке. Их количество определяется по количеству названий столбцов
		for (let j of document.querySelector("thead tr").children) {
			let cell = document.createElement("td");
			row.appendChild(cell);
		}
		cellValue(row,i); //Заполняем ячейки соответствующими значениями
	}
	tbodyMainCopy = tbodyMain.innerHTML; //Обновляем копию тела таблицы
}

//Функция заполнения ячеек значениями
function cellValue (row,i) {
	let columnsName = document.querySelector("thead tr").children; //Переменная, в которой хранится коллекция всех ячейки с названиями столбцов
	for (let j=0; j<columnsName.length; j++) {
//Использую switch, т.к. если захочется поменять порядок столбцов, в коде ничего не надо менять
		switch (columnsName[j].textContent) {// В зависимости от текста в ячейке
			case "Номер":
				row.children[j].innerHTML = rowNumber;
				break;
			case "Идентификатор":
				row.children[j].innerHTML = JSON_FILE[i].id;
				break;
			case "Имя":
				row.children[j].innerHTML = JSON_FILE[i].name.first;;
				break;
			case "Фамилия":
				row.children[j].innerHTML = JSON_FILE[i].name.last;
				break;
			case "Пол":
				row.children[j].innerHTML = JSON_FILE[i].gender;
				break;
			case "Ключевые фразы":
				row.children[j].innerHTML = newMemo(JSON_FILE[i].memo); //Вывод массива memo
				row.children[j].className="text-nowrap"; //Запрет переноса строки 
				break;
			case "Изображение":
				row.children[j].innerHTML = JSON_FILE[i].img;
				row.children[j].style.wordBreak = 'break-all' //Автоматический перенос строки
				break;
		}
	}
}

//Функция вывода массива memo по строкам
function newMemo(memo) {
	for (let elem of memo) {
		if (!elem) memo.length-=1; //Эта проверка нужна для метода split, который будет реализован ниже
		//т.к. если в самом конце стоит точка, то split добавит в массив пустую строку
	}
	let string = memo.reduce( (str,elem) => str+elem+"."+"<br>",""); //Добавляем точку и перенос строки(в виде HTML-элемента) к каждому элементу массива
	return string;
}

//Функция настройки области видимости, которая сбрасывает все изменения
function deleteSettings() {
	let check= document.querySelectorAll(".form-check-input"); //Переменная, которая хранит коллекцию всех чекбоксов
	for (let i=0; i<check.length; i++) {
		check[i].checked = true; //Ставим галочку во все чекбоксы
		delete_addColumn(i, false); //Добавляем (показываем) все столбцы
	}
}

//Функция настройки области видимости в зависимости от чекбоксов (стоит галочка или нет)
function applySettings() {
	let check= document.querySelectorAll(".form-check-input");
	for (let i=0; i<check.length; i++) {
		if (!check[i].checked) { //Если галочка не стоит, то убираем соответствующий столбец
			delete_addColumn(i, true);
		}
		else { //Если галочка стоит, то добавляем соответствующий столбец
			delete_addColumn(i, false);
		}
	}
}

//Функция настройки области видимости, которая скрывает/показывает столбцы
function delete_addColumn(i, hid) {
	let columnsName = document.querySelector("thead tr").children; //Переменная, в которой хранится коллекция всех ячеек с названиями столбцов
	columnsName[i].hidden = hid; //Скрываем/показываем названия столбцов в зависимости от параметра hid
	let row = document.querySelectorAll(".rows");
	for (let j=0; j<row.length; j++) {
		row[j].children[i].hidden = hid; //Скрываем/показываем столбец с соответствующим названием
	}
	tbodyMainCopy=tbodyMain.innerHTML; //Обновляем копию тела таблицы
}

//Функция редактирования строки
function openModalWindow() {
	let inputs = document.querySelectorAll(".formInp"); //Переменная, хранящая коллекцию всех полей ввода в окне редактирования
	tbodyMain.onclick = function(event) { //Вешаем обработчик события на всю таблицу
		let target = event.target; //Получаем целевой элемент (тот кто вызвал событие)
		while (target.className!="rows") { //Пока не дошло до строки (tr в дереве DOM) с классом rows
			target=target.parentElement; //Переходим к родителю текущего элемента
		}
		for (let j=0; j<inputs.length; j++) {
			inputs[j].value=target.children[j+1].textContent; //Записываем в поля ввода соответствующие значения из ячеек
		}
		saveChanges(target,inputs); //Сохраняем все изменения 
	}
}

//Функция сохранения изменений строки
function saveChanges(elem,inputs) {
	let saveBtn = document.querySelector(".modal-footer button"); //Кнопка "Сохранить"
	saveBtn.onclick = function() { //Вешаем обработчик события на кнопку
		for (let j=0; j<inputs.length; j++) {
			elem.children[j+1].textContent=inputs[j].value; //Записываем в ячейки значения из полей ввода
			if (inputs[j].previousElementSibling.textContent=="Ключевые фразы")// Проверяем значение "левого" элемента в дереве DOM (label) 
				//Используем функция вывода массива memo по строкам и записываем результат её работы в соответствующую ячейку
				elem.children[j+1].innerHTML=newMemo(inputs[j].value.split(".")); //В качестве аргумента передаём массив введённых фраз
		}
		tbodyMainCopy=tbodyMain.innerHTML; //Обновляем копию тела таблицы
	}
}

//Функция поиска по таблице
function searchWord(input,tbody) {
	let correctText = correctInp(input.value); //Исправляем введённое слово
	let regExpCorrectText; //Переменная, необходимая для превращения строки в регулярное выражение
	if (!correctText) { //Если ничего не введено
		inputStyle("","red","Введите слово!");
		return;
	}
	if (tbody.innerHTML.search(correctText) == -1) { //Если ничего не найдено
		inputStyle("","yellow","Ничего не найдено!");
		return;
	}
	inputStyle(correctText,"","Поиск") //Очищаем стили, если до этого были ошибки ввода
	regExpCorrectText= new RegExp(correctText,"g"); //Создаём регулярное выражение
	//Заменяем найденное слово на то, что в обратных кавычках
	tbody.innerHTML= tbody.innerHTML.replace(regExpCorrectText,`<b style="background:yellow">${correctText}</b>`);
	showRowsWithWord(); 
}

//Функция, скрывающая строки, в которых нет найденного слова
function showRowsWithWord() {
	let tag = "</b>";
	let row = document.querySelectorAll(".rows");
	for (let elem of row) {
		if (elem.innerHTML.indexOf(tag)==-1) elem.hidden=true;
		else elem.hidden=false;
	}
}
//Функция, придающая стили полю ввода для поиска
function inputStyle (inputValue,color,placeholderValue) {
	let input = document.querySelector("#inputSearch");
	input.value=inputValue;
	input.style.background = color;
	input.placeholder = placeholderValue;
}

//Функция правки введённого слова
function correctInp(str) {
	str=str.replace(/^[\s,.?;:]+/g,""); //Удаляем пробелы, знаки табуляции, запятые и т.д. в начале
	return str.replace(/\s+$/g,""); //Удаляем пробелы и знаки табуляции в конце
}

//Функция объединяющая обработчики событий для реализации поиска
function clickSearch(event) {
	let input = document.querySelector("#inputSearch"); //Поле ввода для поиска слова
	document.querySelector("#searchWord").onclick = function() { //Вешаем обработчик события на кнопку поиска
		if (tbodyMain.innerHTML!=tbodyMainCopy) clearSearch(tbodyMainCopy); //Убираем предыдущий результат поиска (если он был)
		searchWord(input,tbodyMain); //Ищем слово
	}
	document.querySelector("#clearInput").onclick = function() {//Вешаем обработчик события на кнопку очистки
		clearSearch(tbodyMainCopy); //Убираем результат поиска
		inputStyle("","","Поиск"); 
	}
}

//Функция очистки результатов поиска
function clearSearch(tbodyCopy) {
	tbodyMain.innerHTML=tbodyCopy;
}



window.onload= function () {//На всякий случай, дожидаемся полной загрузки HTML-документа
	createTable();
	document.querySelector("#applyBtn").addEventListener("click",applySettings); //Вешаем обработчики события на кнопки "Применить"
	document.querySelector("#deleteBtn").addEventListener("click",deleteSettings); //и "Сбросить всё" в настройке области видимости
	openModalWindow();
	clickSearch(event);
}
