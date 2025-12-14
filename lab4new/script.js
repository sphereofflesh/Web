/* ==========================================
   КЛАСИ (ЛОГІКА ТЕСТУВАННЯ) - НЕ ЗМІНЮЄТЬСЯ
   ========================================== */

class Question {
    constructor(id, text, points = 1) {
        this.id = id;
        this.text = text;
        this.points = points;
    }
    render() { throw new Error("Method 'render()' must be implemented."); }
    checkAnswer() { return 0; }
}

class SingleChoiceQuestion extends Question {
    constructor(id, text, type, options, correctAnswer, points) {
        super(id, text, points);
        this.type = type;
        this.options = options.sort(() => Math.random() - 0.5);
        this.correctAnswer = correctAnswer;
    }
    render() {
        const name = `q_${this.id}`;
        let html = `<h3>${this.id}. ${this.text}</h3>`;
        if (this.type === 'select') {
            html += `<select name="${name}" class="form-control"><option value="" disabled selected>Оберіть...</option>${this.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}</select>`;
        } else {
            html += this.options.map(opt => `<label class="answer-option"><input type="radio" name="${name}" value="${opt}"> ${opt}</label>`).join('');
        }
        return html;
    }
    checkAnswer(formData) { return formData.get(`q_${this.id}`) === this.correctAnswer ? this.points : 0; }
}

class MultiChoiceQuestion extends Question {
    constructor(id, text, options, correctAnswers, points) {
        super(id, text, points);
        this.options = options.sort(() => Math.random() - 0.5);
        this.correctAnswers = correctAnswers.sort();
    }
    render() {
        const name = `q_${this.id}`;
        let html = `<h3>${this.id}. ${this.text} <small style="color: #666; font-size: 0.8em;">(кілька відповідей)</small></h3>`;
        html += this.options.map(opt => `<label class="answer-option"><input type="checkbox" name="${name}" value="${opt}"> ${opt}</label>`).join('');
        return html;
    }
    checkAnswer(formData) {
        const selected = formData.getAll(`q_${this.id}`).sort();
        return JSON.stringify(selected) === JSON.stringify(this.correctAnswers) ? this.points : 0;
    }
}

class TextQuestion extends Question {
    constructor(id, text, type, correctAnswer, points) {
        super(id, text, points);
        this.type = type;
        this.correctAnswer = correctAnswer.trim().toLowerCase();
    }
    render() {
        const name = `q_${this.id}`;
        const inputTag = this.type === 'textarea' ? `<textarea name="${name}" rows="3" placeholder="Ваш код або відповідь..."></textarea>` : `<input type="text" name="${name}" placeholder="Введіть відповідь...">`;
        return `<h3>${this.id}. ${this.text}</h3>${inputTag}`;
    }
    checkAnswer(formData) {
        const val = (formData.get(`q_${this.id}`) || '').trim().toLowerCase();
        // Проста перевірка на входження
        return val.includes(this.correctAnswer) ? this.points : 0;
    }
}

class DragDropQuestion extends Question {
    constructor(id, text, pairs, points) {
        super(id, text, points);
        this.pairs = pairs;
        this.shuffledKeys = Object.keys(pairs).sort(() => Math.random() - 0.5);
    }
    render() {
        const draggables = this.shuffledKeys.map(key => `<div class="draggable" draggable="true" data-id="${key}">${key}</div>`).join('');
        const dropzones = Object.values(this.pairs).map(val => `<div class="drop-slot" data-expected="${val}"><strong>${val}</strong><div class="slot-content"></div></div>`).join('');
        return `<h3>${this.id}. ${this.text}</h3><div class="dnd-area"><div class="dnd-source" id="source_${this.id}">${draggables}</div><div class="dnd-target" id="target_${this.id}">${dropzones}</div></div>`;
    }
    attachEvents() {
        const source = document.getElementById(`source_${this.id}`);
        const target = document.getElementById(`target_${this.id}`);
        
        // Початок перетягування
        source.addEventListener('dragstart', e => {
            if(e.target.classList.contains('draggable')) {
                e.dataTransfer.setData('text/plain', e.target.dataset.id);
                e.target.style.opacity = '0.5';
            }
        });
        
        source.addEventListener('dragend', e => {
             e.target.style.opacity = '1';
        });

        // Дозвіл на drop
        target.addEventListener('dragover', e => e.preventDefault());

        // Drop логіка
        target.addEventListener('drop', e => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            const draggable = document.querySelector(`.draggable[data-id="${id}"]`);
            const slot = e.target.closest('.drop-slot');
            
            if (slot && draggable) {
                const content = slot.querySelector('.slot-content');
                // Якщо в слоті вже щось є, повертаємо старе назад
                if (content.children.length > 0) source.appendChild(content.firstElementChild);
                content.appendChild(draggable);
            }
        });
    }
    checkAnswer() {
        let correct = 0;
        document.querySelectorAll(`#target_${this.id} .drop-slot`).forEach(slot => {
            const item = slot.querySelector('.draggable');
            if (item && this.pairs[item.dataset.id] === slot.dataset.expected) correct++;
        });
        return correct === Object.keys(this.pairs).length ? this.points : 0;
    }
}

/* ==========================================
   БАЗА ПИТАНЬ ДЛЯ ВАРІАНТУ 11
   (Теми: Масиви, Функції, DOM, Події)
   ========================================== */

const questionBank = {
    easy: [
        new SingleChoiceQuestion(1, "Який метод додає елемент в кінець масиву?", 'radio', ['push()', 'pop()', 'shift()'], 'push()', 1),
        new SingleChoiceQuestion(2, "Який індекс у першого елемента масиву?", 'radio', ['0', '1', '-1'], '0', 1),
        new TextQuestion(3, "Напишіть ключове слово для оголошення змінної, яку не можна переприсвоїти:", 'input', 'const', 1),
        new SingleChoiceQuestion(4, "Як отримати елемент за його ID?", 'select', ['getElementById', 'querySelector', 'getElementsByClassName'], 'getElementById', 1),
        new MultiChoiceQuestion(5, "Які з наведених є типами подій миші?", ['click', 'mouseover', 'keydown'], ['click', 'mouseover'], 1),
        new TextQuestion(6, "Властивість для отримання довжини масиву: array.____", 'input', 'length', 1),
        new SingleChoiceQuestion(7, "Що повертає confirm()?", 'radio', ['Boolean (true/false)', 'String', 'Number'], 'Boolean (true/false)', 1),
        new SingleChoiceQuestion(8, "Як вивести повідомлення в консоль?", 'radio', ["console.log()", "print()", "alert()"], "console.log()", 1),
        new TextQuestion(9, "Символ для коментаря в один рядок у JS?", 'input', '//', 1),
        new SingleChoiceQuestion(10, "Який метод перетворює рядок в масив?", 'select', ["split()", "join()", "slice()"], "split()", 1),
    ],
    medium: [
        new SingleChoiceQuestion(1, "Що робить метод map()?", 'radio', ['Створює новий масив на основі старого', 'Фільтрує масив', 'Нічого'], 'Створює новий масив на основі старого', 2),
        new DragDropQuestion(2, "Встановіть відповідність подій:", {'click': 'Клік мишкою', 'submit': 'Відправка форми', 'keydown': 'Натискання клавіші'}, 2),
        new TextQuestion(3, "Метод для видалення слухача подій: ____Listener", 'input', 'removeEvent', 2),
        new TextQuestion(4, "Властивість об'єкта event, що вказує на елемент, на якому відбулась подія:", 'input', 'target', 2),
        new MultiChoiceQuestion(5, "Методи для пошуку елементів у масиві:", ['find()', 'filter()', 'map()'], ['find()', 'filter()'], 2),
        new SingleChoiceQuestion(6, "Який метод зупиняє спливання події?", 'radio', ['stopPropagation()', 'preventDefault()'], 'stopPropagation()', 2),
        new SingleChoiceQuestion(7, "Як змінити HTML вміст елемента?", 'select', ['innerHTML', 'innerText', 'value'], 'innerHTML', 2),
        new MultiChoiceQuestion(8, "Які методи змінюють вихідний масив (мутують)?", ['splice()', 'sort()', 'slice()'], ['splice()', 'sort()'], 2),
        new TextQuestion(9, "Що означає DOM?", 'input', 'document object model', 2),
        new TextQuestion(10, "Для скасування стандартної дії браузера використовують event.____()", 'input', 'preventDefault', 2),
    ],
    hard: [
        new DragDropQuestion(1, "Методи перебору масиву:", {'reduce': 'Акумулює значення', 'forEach': 'Просто перебирає', 'filter': 'Відбирає елементи'}, 3),
        new SingleChoiceQuestion(2, "Що таке Event Delegation?", 'radio', ['Вішання одного обробника на батька', 'Вішання обробників на всіх дітей', 'Видалення подій'], 'Вішання одного обробника на батька', 3),
        new TextQuestion(3, "Як перетворити псевдомасив (наприклад arguments) у масив? Array.____()", 'input', 'from', 3),
        new MultiChoiceQuestion(4, "Які фази є у розповсюдження події?", ['Capture', 'Target', 'Bubbling', 'Shadow'], ['Capture', 'Target', 'Bubbling'], 3),
        new TextQuestion(5, "Метод масиву, що перевіряє, чи задовольняє ХОЧА Б ОДИН елемент умові:", 'input', 'some', 3),
        new SingleChoiceQuestion(6, "Який атрибут використовується для зберігання користувацьких даних в HTML?", 'radio', ['data-*', 'user-*', 'custom-*'], 'data-*', 3),
        new TextQuestion(7, "Як динамічно створити HTML елемент? document.____('div')", 'input', 'createElement', 3),
        new TextQuestion(8, "Щоб вставити елемент в кінець іншого елемента використовують метод ____()", 'input', 'append', 3),
        new SingleChoiceQuestion(9, "Яка різниця між querySelector та getElementById?", 'radio', ['querySelector універсальний (CSS селектори)', 'Немає різниці'], 'querySelector універсальний (CSS селектори)', 3),
        new MultiChoiceQuestion(10, "Які методи використовуються для роботи з класами елемента (classList)?", ['add', 'remove', 'toggle', 'set'], ['add', 'remove', 'toggle'], 3),
    ]
};


/* ==========================================
   ЛОГІКА ІНТЕРФЕЙСУ (БЕЗ ЗМІН)
   ========================================== */

let currentQuestions = [], userData = {};

document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

document.getElementById('start-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const nameInput = document.getElementById('userName');
    const groupInput = document.getElementById('userGroup');
    let isValid = true;

    // Валідація імені
    if(nameInput.value.trim().length < 2) {
        nameInput.classList.add('invalid'); isValid = false;
        document.getElementById('error-name').textContent = "Мінімум 2 літери";
    } else {
        nameInput.classList.remove('invalid'); document.getElementById('error-name').textContent = "";
    }

    // Валідація групи
    const groupRegex = /^[A-ZА-ЯІЇЄa-zA-Z]{2}-\d{2}$/i; // Трохи розширив регулярку
    if(!groupRegex.test(groupInput.value.trim())) {
        groupInput.classList.add('invalid'); isValid = false;
        document.getElementById('error-group').textContent = "Формат: XX-00 (напр. ІО-21)";
    } else {
        groupInput.classList.remove('invalid'); document.getElementById('error-group').textContent = "";
    }

    if(isValid) {
        const level = document.querySelector('.level-btn.active').dataset.level;
        userData = { name: nameInput.value, group: groupInput.value, level: level };
        
        // ОНОВЛЕННЯ HEADER 
        document.querySelector('.student-info strong').textContent = `Група ${userData.group}, ${userData.name}`;
        
        startQuiz(level);
    }
});

function startQuiz(level) {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('display-level').textContent = `Рівень: ${level.toUpperCase()}`;
    
    // Якщо питань мало, беремо всі, якщо багато - 10
    const allQ = questionBank[level] || questionBank['easy'];

    currentQuestions = allQ
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map((q, index) => {
            q.id = index + 1; 
            return q;
        });
    
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    
    currentQuestions.forEach((q, idx) => {
        const div = document.createElement('div');
        div.className = 'question-block fade-in';
        div.style.animationDelay = `${idx * 0.1}s`; // Каскадна анімація
        div.innerHTML = q.render();
        container.appendChild(div);
        
        // Якщо це Drag&Drop, треба навісити події ПІСЛЯ рендеру
        if(q instanceof DragDropQuestion) q.attachEvents();
    });
    document.getElementById('progress-text').textContent = `${currentQuestions.length} питань`;
}

document.getElementById('finish-btn').addEventListener('click', () => {
    let score = 0, maxScore = 0;
    const formData = new FormData();
    
    // Збираємо дані з форми (окрім D&D, які перевіряються по DOM)
    document.querySelectorAll('#questions-container input, #questions-container select, #questions-container textarea').forEach(input => {
         // Пропускаємо радіо/чекбокси, якщо вони не вибрані
         if((input.type === 'radio' || input.type === 'checkbox') && !input.checked) return;
         // Пропускаємо D&D інпути (якщо вони там є)
         if(input.closest('.dnd-area')) return;
         
         formData.append(input.name, input.value);
    });

    currentQuestions.forEach(q => {
        maxScore += q.points;
        if(q instanceof DragDropQuestion) {
            score += q.checkAnswer();
        } else {
            score += q.checkAnswer(formData);
        }
    });

    showResults(score, maxScore);
});

function showResults(score, maxScore) {
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    document.getElementById('final-score').textContent = score;
    document.getElementById('max-score').textContent = maxScore;
    document.getElementById('res-name').textContent = userData.name;
    document.getElementById('res-group').textContent = userData.group;
    
    try {
        localStorage.setItem('lab4_variant11_result', JSON.stringify({ user: userData, score, max: maxScore, date: new Date() }));
        document.getElementById('storage-status').textContent = "Результат збережено локально";
    } catch (e) { document.getElementById('storage-status').textContent = "Помилка збереження (Local Storage вимкнено)"; }
}