const fs = require("fs");
const http = require("http");
const url = require("url");

///////////////////////////////////////////////////////////////////// CUSTOM MODULES
const replaceTemplate = require("./modules/replaceTemplate");

///////////////////////////////////////////////////////////////////// SERVER

const tempOverview = fs.readFileSync(
	`${__dirname}/templates/index.html`,
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
	// If path name is equal to root or index then load index template...
	if (pathname === "/" || pathname === "/index") {
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
