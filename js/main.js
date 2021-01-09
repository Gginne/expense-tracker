//Chart Control
const chartCtrl = (function(){
    const ctx = document.getElementById('myChart');
    const options = {
        responsive: true,
        legend: {
            display: true,
            position: "bottom",
            labels: {
              fontColor: "#333",
              fontSize: 16
            }
     }
    }
    return{
        buildChart: function(data){
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(data),
                    datasets: [{
                        label: 'Expenses',
                        data: Object.values(data),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                        ],
                        borderWidth: 1
                    }]
                },
                options: options
            });
        }
    }
 
})()
//LocalStorage Control
const storageCtrl = (function(){

    return {
        set(data){
            localStorage.setItem("expenses", JSON.stringify(data))
        },
        get(){
            return JSON.parse(localStorage.getItem("expenses") || "[]")
        },
        clear(){
            localStorage.clear()
        }
    }
})()
//Data Control

const dataCtrl = (function (storageCtrl) {
    let data = {
        items: storageCtrl.get()
    }

    //Generate unique ID for expense
    const createID = () => {
        if (data.items.length === 0) {
            return 1
        } else {
            //Map all current IDs
            let ids = data.items.map(item => item.id)
            //Sort all the IDs on ascending order
            let sorted = ids.sort((a, b) => a - b)
            //Return latest ID + 1 as new ID
            return sorted[sorted.length - 1] + 1
        }
    }

    //Expense Constructor
    const Expense = function (title, amount, date, type) {
        this.title = title
        this.amount = Number(amount)
        this.date = date
        this.type = type
        this.id = createID()
    }


    //Public Methods
    return {
        //Console Log Data
        logData: () => console.log(data),
        //Get items
        getItems: () => data.items,
        //Get categories
        getCategories: () => {
            let categories = {}
            data.items.forEach(item => {
                categories[item.type] = categories.hasOwnProperty(item.type) ? 
                categories[item.type] + item.amount : item.amount        
            })
            return categories
        },
        //Add Items
        addItem(title, amount, date, type){
            data.items.push(new Expense(title, amount, date, type))
            storageCtrl.set(data.items)
        },
        //Delete Item
        deleteItem(id){
            let index = null
            data.items.forEach(item => {
                if (item.id == id) {
                    index = data.items.indexOf(item)
                }
            })
            data.items.splice(index, 1)
            storageCtrl.set(data.items)
        },
        //Sort items by price
        sortItemByAmount(option){
            if(option === "" ) return;

            data.items.sort((a, b) => option === 'descending' ? 
            b.amount - a.amount : 
            a.amount - b.amount)
        },
        //Clear Data
        clearItems(){
            data.items = []
            storageCtrl.clear()
        }

    }
})(storageCtrl)

const UICtrl = (function () {
    const UISelectors = {
        title: '#title',
        amount: '#amount',
        date: '#date',
        type: '#type',
        tbody: '#exp-list',
        addBtn: '#add-btn',
        clearBtn: '#clear-btn',
        deleteBtn: '#delete-btn',
        sortBtn: "#sort-btn",
        sortAmount: "#sort-amount",
        sortDate: "#sort-date",
        sortType: "#sort-type"
    }

    return {

        updateUI(items){
            let html = ''
            items.forEach(item => {
                html += `<div class="expense" id='${item.id}'>
                <span><b>${item.title}</b></span>
                <span>${item.amount}</span>
                <span>${item.type}</span>
                <span>${item.date}</span>
              
                <a href='#' class='text-danger delete-btn'><i class="fas fa-trash-alt"></i></a>
                
                </div>`
            });
            document.querySelector(UISelectors.tbody).innerHTML = html
        },
        clearFields(){
            document.querySelector(UISelectors.title).value = ''
            document.querySelector(UISelectors.amount).value = ''
            document.querySelector(UISelectors.date).value = ''
            document.querySelector(UISelectors.type).value = ''
        },
        getSelectors: () => UISelectors,
        getSelectorValue(selector){
            return document.querySelector(UISelectors[selector]).value
        },
        getValues(){
            return {
                title: document.querySelector(UISelectors.title).value,
                amount: document.querySelector(UISelectors.amount).value,
                date: document.querySelector(UISelectors.date).value,
                type: document.querySelector(UISelectors.type).value
            }
        },


    }

})()

const app = (function (dataCtrl, UICtrl, chartCtrl) {

    //Get UI Selectors
    const UISelectors = UICtrl.getSelectors()

    //Event Listeners
    const loadEventListeners = function(){
        //Add Button
        document.querySelector(UISelectors.addBtn).addEventListener('click', submitItemData)
        //Clear Button
        document.querySelector(UISelectors.clearBtn).addEventListener('click', clearItemData)
        //Delete Button
        document.querySelector(UISelectors.tbody).addEventListener('click', deleteItemData)
        //Sort Button
        document.querySelector(UISelectors.sortBtn).addEventListener('click', sortItemData)
    }

    //Submit data from input fields
    const submitItemData = function(e){
        //Get input values
        const values = UICtrl.getValues()

        //Add new expense to data
        if (values.title !== '' && Number(values.amount) > 0.0 && values.date !== '' && values.type !== '') {

            //Create new item and add to data
            dataCtrl.addItem(values.title, values.amount, values.date, values.type)

            console.log(values.title, values.amount, values.date, values.type)
            //Clear Fields
            UICtrl.clearFields()
        }
        
        //Update UI
        UICtrl.updateUI(dataCtrl.getItems())

        //Update Chart
        chartCtrl.buildChart(dataCtrl.getCategories())
        e.preventDefault()
    }

    //Clear Data and Update UI
    const clearItemData = function(e){
        //Clear items from data
        dataCtrl.clearItems()

        //Update UI
        UICtrl.updateUI(dataCtrl.getItems())

        //Update Chart
        chartCtrl.buildChart(dataCtrl.getCategories())

        //Clear fields
        UICtrl.clearFields()

        e.preventDefault()
    }

    //Delete Expense item and Update UI
    const deleteItemData = function(e){
        if (e.target.parentElement.classList.contains('delete-btn')) {
            //Get Item ID
            let ID = e.target.parentElement.parentElement.parentElement.id

            //Delete ID from data
            dataCtrl.deleteItem(ID)

            //Update UI
            UICtrl.updateUI(dataCtrl.getItems())

            //Update Chart
            chartCtrl.buildChart(dataCtrl.getCategories())
        }
        e.preventDefault()
    }

    const sortItemData = function(e){
        e.preventDefault()
        const amount = UICtrl.getSelectorValue("sortAmount")
        const date = UICtrl.getSelectorValue("sortDate")
        const type = UICtrl.getSelectorValue("sortType")

        dataCtrl.sortItemByAmount(amount)
        UICtrl.updateUI(dataCtrl.getItems())
    }



    return {
        init(){

            UICtrl.updateUI(dataCtrl.getItems())

            //Event Listeners
            loadEventListeners()

            //Build chart
            chartCtrl.buildChart(dataCtrl.getCategories())

        }

    }

})(dataCtrl, UICtrl, chartCtrl)

app.init()