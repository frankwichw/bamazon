var mysql = require("mysql");
var inquirer = require("inquirer");

var userInput = process.argv[2];
var userInputTwo = process.argv[3];

// connection variable with details of connection
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

// function to connect 
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
});

var startup = function(){
	connection.query("SELECT * FROM products", 
		function(err, res) {
		if (err) throw err;
		// Log all results of the SELECT statement
		for (var i = 0; i < 10; i++){
			console.log("\nItem ID: " + res[i].item_id + " | Product: " + res[i].product_name + " | Price: $" + res[i].price);
    }
    console.log("\n");
    // connection.end();
    buyOptions();
  });
  
};

var buyOptions = function(){
  inquirer.prompt(
  	{
  	type: "input",
  	name: "ID",
  	message: "What is the item ID of the item you would like to buy? (Type just the ID and hit enter)"
  	}).then(function(answers) {
  		if (parseInt(answers.ID) < 11){
        console.log(answers.ID);
      } else {
        console.log("Please enter a valid ID");
      };
  });
  connection.end();
};

startup();