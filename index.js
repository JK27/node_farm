const fs = require("fs");
const http = require("http");
const url = require("url");

///////////////////////////////////////////////////////////////////// FILES
// BLOCKING SYNCHRONOUS WAY
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);

// const textOut = `This is what we know about the avocado: ${textIn}. \nCreated on ${Date.now()}`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("File written!");

// NON-BLOCKING SYNCHRONOUS WAY
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
// 	if (err) return console.log("Error!💥");
// 	fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
// 		console.log(data2);
// 		fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
// 			console.log(data3);
// 			fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", err => {
// 				console.log("Your file has been written! 😊😊😊");
// 			});
// 		});
// 	});
// });
// console.log("Will read file!");

///////////////////////////////////////////////////////////////////// SERVER
// DOES => Replaces all placeholders in templates with appropiate data
const replaceTemplate = (temp, product) => {
	let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
	output = output.replace(/{%IMAGE%}/g, product.image);
	output = output.replace(/{%PRICE%}/g, product.price);
	output = output.replace(/{%FROM%}/g, product.from);
	output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
	output = output.replace(/{%QUANTITY%}/g, product.quantity);
	output = output.replace(/{%DESCRIPTION%}/g, product.description);
	output = output.replace(/{%ID%}/g, product.id);

	if (!product.organic)
		output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");

	return output;
};

const tempOverview = fs.readFileSync(
	`${__dirname}/templates/overview.html`,
	"utf-8"
);
const tempCard = fs.readFileSync(`${__dirname}/templates/card.html`, "utf-8");
const tempProduct = fs.readFileSync(
	`${__dirname}/templates/product.html`,
	"utf-8"
);
// DOES => Reads the data in the json file and parses it into a JS object before the page is loaded
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

////////////////////////////////////////////////////// CREATE SERVER
const server = http.createServer((req, res) => {
	// DOES => Creates query and pathname variables using destructuring by accessing these prperties fromt the url request
	const { query, pathname } = url.parse(req.url, true);

	///////////////////////////////////// OVERVIEW PAGE
	// If path name is equal to root or overview then load overview template...
	if (pathname === "/" || pathname === "/overview") {
		res.writeHead(200, { "Content-type": "text/html" });

		// DOES => Loop through data object with all products, replacing each card placeholder in the template with the product card in each iteration
		const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join("");
		const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);

		res.end(output);
		/////////////////////////////////// PRODUCT PAGE
		// ... if path name is equal to product then display product template...
	} else if (pathname === "/product") {
		// DOES => Takes the product based on the id obtained from the query
		res.writeHead(200, { "Content-type": "text/html" });
		const product = dataObj[query.id];
		const output = replaceTemplate(tempProduct, product);

		res.end(output);
		/////////////////////////////////// API
		// ... if path name is api to product then display the data loaded...
	} else if (pathname === "/api") {
		// NOTE => Need to specify in what format the data is (json)
		res.writeHead(200, { "Content-type": "application/json" });
		res.end(data);
		/////////////////////////////////// NOT FOUND
		// ... else display 404 error
	} else {
		// NOTE => Headers must always be set before sending out the response
		res.writeHead(404, {
			"Content-type": "text/html",
			"my-header": "Hello world",
		});
		res.end("<h1>Page not found!</h1>");
	}
});

server.listen(8000, "127.0.0.1", () => {
	console.log("Listening to request on port 8000");
});
