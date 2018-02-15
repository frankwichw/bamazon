// requiring node packages
var mysql = require("mysql");
var inquirer = require("inquirer");

// initializing variable so they are available globally
var productID;
var productUnitCount;
var warehouseCount;

var resultObject;

// connection variable with port/username/password/etc.
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "root",
  database: "bamazon"
});

// this function connects user upon the file being loaded in node
connection.connect(function(err) {
  if (err) throw err;
  //console.log("connected as id " + connection.threadId + "\n");
});

// starting function, called at the bottom of the file
var startup = function(){
  // query that selects all (denoted by *) rows from the products table
	connection.query("SELECT * FROM products", 
		function(err, res) {
    if (err) throw err;
    // saving result to global variable
    resultObject = res;
		// for loop that loops through results and console logs out products and information about them
		for (var i = 0; i < resultObject.length; i++){
			console.log("\nItem ID: " + res[i].item_id + " | Product: " + res[i].product_name + " | Price: $" + res[i].price);
    }
    // console log to give an extra space beneath the products without having to add that space to each looped console log
    console.log("\n");
    // calling next function
    buyOptions();
  });
  
};

// function to house inquirer prompts
var buyOptions = function(){
  inquirer.prompt(
  	{
  	type: "input",
  	name: "ID",
  	message: "What is the item ID of the item you would like to buy?"
  	}).then(function(answers) {
      // if/else statement checking that the entered number is valid as an item_id
  		if (parseInt(answers.ID) < resultObject.length + 1){
        // setting global variable to property of answers object
        productID = answers.ID;

        inquirer.prompt(
          {
          type: "input",
          name: "units",
          message: "How many units of this item would you like to buy?"
          }).then(function(answers) {
            // setting global variable and calling next function on success
            productUnitCount = answers.units;
            fulfillOrder();
        });
      } else {
        // otherwise console logging an error message and ending the connection
        console.log("Please enter a valid ID");
        connection.end();
      };
  });
};

// function to validate that there are enough units to buy
var fulfillOrder = function(){
  // console logs current order information for user
  console.log("\nYour current order:\nID: " + productID + "\nNumber of units: " + productUnitCount + "\n");
  // query that selects the stock_quantity column from item_id equal to the ID the customer previously entered
  connection.query("SELECT stock_quantity FROM products WHERE ?", 
    {
      item_id: productID
    },
		function(err, res) {
      // setting global variable with result object
      warehouseCount = res[0].stock_quantity;

      // if there are more than, or the same number of units, call next function, otherwise console log error
      if (warehouseCount >= productUnitCount){
        updateUnits();
      } else {
        console.log("\nInsufficient Quantity!\n");
      }
  });
}

// function to update the units according to how many were bought
var updateUnits = function(){
  // setting variable to the new number of units
  var newQuantity = parseInt(warehouseCount) - parseInt(productUnitCount);
  // updating stock quantity 
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
      console.log("\nYour order has been processed! Allow 5-24 days for shipping.\n");
    }
  );
  connection.end();
}

// calling first function
startup();