/*
NOTES

budgetController,UIController and controller are not independent of each other  
*/

//BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else { this.percentage = -1 }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;

    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum = sum + cur.value;
        })
        data.totals[type] = sum;
    }
    //Will hold all the data
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, Id;

            //Generate unique Id
            if (data.allItems[type].length != 0) {
                //data.allItems['inc'][last entry in array].id + 1-- Not impacted by deletion of elements
                Id = data.allItems[type][data.allItems[type].length - 1].id + 1;

            }
            else {
                Id = 0;
            }

            //Creat new element based on type
            if (type == 'exp') {
                newItem = new Expense(Id, des, val);
            }
            else if (type == 'inc') {
                newItem = new Income(Id, des, val);
            }

            //Push the new Item into data object's allItems
            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (current) { //map returns an array 
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            //1.Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //2.Calculate budget = income - expenses
            data.budget = data.totals['inc'] - data.totals['exp'];

            //3.Calculate Percentage of expense 
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals['exp'] / data.totals['inc']) * 100);
            }
            else { data.percentage = -1 }

        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });

            return allPerc;
        },

        getBudget: function () {

            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testDataStructure: function () {
            console.log(data);
        }




    }


})();

//UI CONTROLLER
var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };


    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,//inc for income and exp for expense
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        getDOMStrings: function () {
            return DOMStrings;
        },

        addListItem: function (obj, type) {
            var html, newHtml;

            //Create HTML
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //console.log("obj", obj)
			
            //Replace placeholder with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            //Insert HTML into DOM(ie webpage)
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        deleteListItem: function (selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            //querySelectorAll() returns a list 
            var fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            //Convert list to Array using slice method
            var fieldsArr = Array.prototype.slice.call(fields);

            //Using forEach()
            fieldsArr.forEach((currVal) => {
                currVal.value = "";
            })
            fieldsArr[0].focus();//The cursor returns back to fieldsArr[0](ie :description) 
        },

        displayBudget: function (obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;


            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage;
            }
            else {
                document.querySelector(DOMStrings.percentageLabel).textContent = "---";
            }
        },
        displayMonth: function () {
            var now = new Date();
            months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            //console.log("Fields", fields);
            var nodeListForEach = function (list, callback) {
                
                for (var i = 0; i < list.length; i++) {
                    
                    callback(list[i], i);
                }
            };

            
            nodeListForEach(fields, function (current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }
                else {
                    current.textContent = '---'
                }
            });
        }
    }

})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCntrl, UICntrl) {
    //Import DOMStrings 
    var DOMStrings = UICntrl.getDOMStrings();

    //Set up Event listeners
    var setupEventListeners = function () {
        document.querySelector(DOMStrings.inputBtn).addEventListener('click', cntrlAddItem);

        //callback function of eventListner always have access to 'event' object which we can access
        document.addEventListener('keypress', function (event) {
            if (event.keyCode == 13) { //keyCode == 13 => Enter key
                cntrlAddItem();
            }
        });

        document.querySelector(DOMStrings.container).addEventListener('click', ctrlDeleteItem);
    };

    var updatePercentages = function () {

        //1.Calculate percentages
        budgetCntrl.calculatePercentages();

        //2.Read percentages and  budget controller
        var percentages = budgetCntrl.getPercentages();

        //3.Update UI with new percentages
        UICntrl.displayPercentages(percentages);
    };

    var updateBudget = function () {
        //1.Calculate Budget 
        budgetCntrl.calculateBudget();

        //2.Return Budget
        var budget = budgetCntrl.getBudget();

        //3.Display budget on UI
        UICntrl.displayBudget(budget);

    };

    var cntrlAddItem = function () {
        //1.Get the field input data
        console.log("Application started");

        var input = UICntrl.getInput();

        //Check if input.value is not null and input.description is not null 
        if (!isNaN(input.value) && (input.description != '') && input.value >= 0) {
            //2.Calling budgetCntrl.addItem to store data 
            var newItem = budgetCntrl.addItem(input.type, input.description, input.value);

            //3.Add income/expense to UI
            UICntrl.addListItem(newItem, input.type);

            //4.Clear the fields
            UICntrl.clearFields();

            //5.Caluculate and update budget 
            updateBudget();

            //6.Calculate and update Percentages
            updatePercentages();
        }
    }

    var ctrlDeleteItem = function (event) {
        var itemID
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            test = itemID.split('-');

            var [type, ID] = itemID.split('-');
            //console.log(type, ID)
            ID = parseInt(ID);
            //1. Delete item from Data structure
            budgetCntrl.deleteItem(type, ID);
            //2.Delete item from UI
            UICntrl.deleteListItem(itemID);
            //3.Update and show new budget
            updateBudget();

            //4.Calculate and update Percentages
            updatePercentages();
        }
    }

    return {

        init: function () {
            setupEventListeners();
            UICntrl.displayMonth();
            UICntrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    }

})(budgetController, UIController);


controller.init();