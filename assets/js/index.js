const Storage = {
    save() {
        localStorage.setItem('dev.finance:transactions', JSON.stringify(Transaction.all));
    },
    get() {
        return JSON.parse(localStorage.getItem('dev.finance:transactions'));
    }
}

const Modal = {
    open() {
        document.querySelector('div.modal-overlay').classList.add('active');
    },
    close() {
        document.querySelector('div.modal-overlay').classList.remove('active');
        Form.clearFields();
        document.querySelector('input#action').value = 'create'
    }
}

const Transaction = {
    all: Storage.get(),
    add(transaction) {
        this.all.push(transaction);
        App.reload();
        Storage.save();
    }, 
    remove(index) {
        if(index >= this.all.length) reload;
        this.all.splice(index, 1);

        App.reload();
        Storage.save();
    },
    replace(transaction, index) {
        this.all[index] = transaction;
        App.reload();
        Storage.save();
    },
    edit(e) {
        document.querySelector('input#action').value = `edit-${e.dataset.position}`;
        Form.setFormEdit(this.all[e.dataset.position]);
        Modal.open();
    },
    incomes() {
        // Sum incomes
        let income = 0;
        this.all.forEach((item) => {
            if(item.amount > 0){
                income += item.amount;
            }
        })

        return income;
    },
    expenses() {
        // Sum expenses
        let expense = 0;
        this.all.forEach((item) => {
            if(item.amount < 0){
                expense += item.amount;
            }
        })

        return expense*=-1;
    },
    total() {
        // Calculate the final amount (incomes - expenses)
        return this.incomes() - this.expenses();
    }
}

let regionCode = 'BRL';


const Utils = {
    formatCurrency(amount) {
        amount = Number(amount);
        const signal = amount < 0 ? '-' : ''; 
        amount = String(amount/100).replace('-', '');

        const options = {style: 'currency', currency: regionCode}; // I created a personalized option for better maintenance code read
        amount = Number(amount).toLocaleString(navigator.language, options); // I used navigator language to format
        return `${signal} ${amount}`;
    },
    formatAmount(amount) {
        amount = Number(String(amount).replaceAll(',', '.')) * 100;
        return Number(amount.toFixed(2));
    },
    formatDate(date) {
        const splittedDate = date.split('-');
        splittedDate.reverse();
        return splittedDate.join('/');
    },
    formatInverseDate(date = []){
        date = date.split('/');
        date = date.reverse();
        date = date.join('-');
        return date;
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues(){
        return {
            description: this.description.value, 
            amount: this.amount.value,
            date: this.date.value
        }
    },
    setFormEdit(transaction){
        this.description.value = transaction.description;
        this.amount.value = transaction.amount/100;
        this.date.value = Utils.formatInverseDate(transaction.date);
    },
    validateFields(){
        const { description, amount, date } = this.getValues();
        if(description.trim() === '' || amount.trim() === '' || date.trim() === ''){
            throw new Error('Por favor, preencha todos os campos!');
        }
        return true;
     },
    formatValues() {
        let { description, amount, date } = this.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {description, amount, date};
    },
    clearFields(){
        description.value = '';
        amount.value = '';
        date.value = '';
    },
    submit(event){
        event.preventDefault();
        let isEdit = document.querySelector('input#action').value.includes("edit");

        try {
            this.validateFields();

            const transaction = this.formatValues();

            if(isEdit) {
                let index = Number(document.querySelector('input#action').value.replace(/\D/g, ''));
                document.querySelector('input#action').value = "create";
                Transaction.replace(transaction, index);
            }else{
                Transaction.add(transaction);
            }

            this.clearFields();

            Modal.close();
        } catch (error) {
            App.alert(error.message)
        }

    }
}

const App = {
    init(){
        DOM.updateBalance();
        Transaction.all.forEach((item, index) => DOM.addTransaction(item, index));
    },
    reload(){
        DOM.clearTransactions();
        this.init();
    },
    alert(errmsg){
        DOM.alertContainer.classList.remove('invisible');
        DOM.alertContainer.firstElementChild.innerText = errmsg;
        setTimeout(() => {
            DOM.alertContainer.classList.add('invisible');
            DOM.alertContainer.firstElementChild.innerText = '';
        }, 3000);
    },
    configs() {// Get automatically
        const region = navigator.language.slice(-2).toLowerCase();
        (async () => {
            link = await fetch(`https://restcountries.eu/rest/v2/alpha/${region}`)
                .then(data => data.json()).then(r => r )
            regionCode = link.currencies[0].code;
        
            // Reload informations with the current local money
            App.init();
        })();
        // Close modal when click modal's background
        document.querySelector('div.modal-overlay').onclick = function(e) {
            if(e.target === this ){
                Modal.close();
            }
        }
    }
}

const DOM = {
    transactionsContainer: document.querySelector('table#data-table tbody'),
    alertContainer: document.querySelector('div.alert'),
    clearTransactions(){
        this.transactionsContainer.innerHTML = '';
    },
    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = this.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        this.transactionsContainer.appendChild(tr); // I used 'THIS'
    },
    innerHTMLTransaction(transaction, index) {
        const CSSClass = transaction.amount >= 0 ? 'income' : 'expense';
        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
                        <td class="description">${transaction.description}</td>
                        <td class="${CSSClass}">${amount}</td>
                        <td class="date">${transaction.date}</td>
                        <td class="items">
                        <i class="fas fa-pen" onclick="Transaction.edit(this)" data-position="${index}"></i>
                            <img src="./assets/img/minus.svg" onclick="Transaction.remove(${index})" alt="Remover transação">
                        </td>
                    `;
        return html;
    },
    updateBalance(){
        document.querySelector('div p#income-display').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.querySelector('div p#expense-display').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.querySelector('div p#total-display').innerHTML = Utils.formatCurrency(Transaction.total());
    }
}



Storage.save();

window.onload = () => App.configs(); 








// const tbody = document.querySelector('table#data-table tbody'); AQUI EU COMECEI UM PROTÓTIPO ANTES DA AULA DO MAYK
// tbody.innerHTML = '';
// transactions.forEach((item) => {
//     let tr = document.createElement('tr');

//     let id = document.createElement('td');
//     let description = document.createElement('td');
//     let amount = document.createElement('td');
//     let date = document.createElement('td');

//     description.innerText = item.description;
//     amount.innerText = item.amount;
//     date.innerText = item.date;

//     tr.appendChild(description);
//     tr.appendChild(amount);
//     tr.appendChild(date);

//     tbody.appendChild(tr);
// })