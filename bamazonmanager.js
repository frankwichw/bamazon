// requiring node packages
var mysql = require("mysql");
var inquirer = require("inquirer");

// initializing variable so they are available globally
var productID;
var productUnitCount;
var warehouseCount;

var resultObject;

var productName;
var productDepartment;
var productPrice;
var productUnitCount;

// connection variable with port/username/password/etc.
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "root",
  database: "bamazon"
});

// creating a new product questions
var productCreationQuestions = [
    {
      type: 'input',
      name: 'product_name',
      message: "What is the product name?"
    },
    {
      type: 'input',
      name: 'department_name',
      message: "What is the product's department?"
    },
    {
        type: 'input',
        name: 'price',
        message: "How much does this product cost?"
    },
    {
        type: 'input',
        name: 'stock_quantity',
        message: "How many units are there?"
    }
];

// this function connects user upon the file being loaded in node
connection.connect(function(err) {
  if (err) throw err;
  //console.log("connected as id " + connection.threadId + "\n");
});

var startup = function(){
    // not sure why this inquirer shows twice when launching in node
    inquirer.prompt(
    {
      type: 'checkbox',
      message: 'Menu',
      name: 'menu',
      choices: [
        {
          name: 'View Products for Sale'
        },
        {
          name: 'View Low Inventory'
        },
        {
          name: 'Add to Inventory'
        },
        {
          name: 'Add New Product'
        },
      ]
    }).then(function(answers) {
        console.log("answers.menu[0] " + answers.menu[0]);
        var functionName = answers.menu[0];
        switch (functionName) {
            case 'View Products for Sale':
              viewProducts();
              break;
            case 'View Low Inventory':
              lowInventory();
              break;
            case 'Add to Inventory':
              addInventory();
              break;
            case 'Add New Product':
              addProduct();
              break;
        }
    });
};

var viewProducts = function(){
    connection.query("SELECT * FROM products", 
        function(err, res) {
        if (err) throw err;
        resultObject = res;
    });
    
    connection.query("SELECT * FROM products", 
        function(err, res) {
        if (err) throw err;
        // for loop that loops through results and console logs out products and information about them
        for (var i = 0; i < resultObject.length; i++){
            console.log("\nItem ID: " + res[i].item_id + " | Product: " + res[i].product_name + " | Price: $" + res[i].price + " | Quantity: " + res[i].stock_quantity);
        }
        console.log("\n");
    });
    connection.end();
};

var lowInventory = function(){
	connection.query("SELECT * FROM products", 
		function(err, res) {
        if (err) throw err;
		for (var i = 0; i < res.length; i++){
            if (res[i].stock_quantity < 5){
                console.log("\nItem ID: " + res[i].item_id + " | Product: " + res[i].product_name + " | Price: $" + res[i].price + " | Quantity: " + res[i].stock_quantity);
            }
        }
        console.log("\n");
    });
    connection.end();
};

var addInventory = function(){
    // selecting all products to put result in global variable
    connection.query("SELECT * FROM products", 
        function(err, res) {
        if (err) throw err;
        resultObject = res;
    });

    inquirer.prompt(
        {
        type: "input",
        name: "ID",
        message: "What is the item ID of the item you would like to add more units to?"
        }).then(function(answers) {
        // if/else statement checking that the entered number is valid as an item_id
            if (parseInt(answers.ID) < resultObject.length + 1){
          // setting global variable to property of answers object
          productID = answers.ID;
  
          inquirer.prompt(
            {
            type: "input",
            name: "units",
            message: "How many units would you like to add?"
            }).then(function(answers) {
              // setting global variable and calling next function on success
              productUnitCount = answers.units;
              // creating an index variable
              var productIndex = productID - 1;
              // addint variables together to get new unit count
              var newQuantity = parseInt(productUnitCount) + parseInt(resultObject[productIndex].stock_quantity);
              // not updating actual table...
              connection.query("UPDATE products SET ? WHERE ?",
                [
                {
                    stock_quantity: newQuantity
                },
                {
                    item_id: productID
                }
                ],
                function(err, res) {
                console.log("\nUnits have been added. The new stock quantity is " + newQuantity + ".\n");
                connection.end();
                }
            );
          });
        } else {
          // otherwise console logging an error message and ending the connection
          console.log("Please enter a valid ID");
          connection.end();
        };
    });
};

var addProduct = function(){
    connection.query("SELECT * FROM products", 
        function(err, res) {
        if (err) throw err;
        resultObject = res;
    });

    inquirer.prompt(productCreationQuestions).then(function(answers) {
        productName = answers.product_name;
        productDepartment = answers.department_name;
        productPrice = parseFloat(answers.price);
        productUnitCount = answers.stock_quantity;
        var query = connection.query("INSERT INTO products SET ?",
            {
              product_name: productName,
              department_name: productDepartment,
              price: productPrice,
              stock_quantity: productUnitCount
            },
            function(err, res) {
                console.log("\nUpdated successfully!\n");
            }
          );
    });
};

startup();