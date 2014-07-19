module.exports = {
	get200: {
		endpoints: {
			test: '/test/test/test'
		}
	},
	post200: {
		id: 1
	},
	404: {
		documentation: "https://code.docs.exacttarget.com/rest/errors/404",
		errorcode: 404,
		message: "Not Found"
	},
	500: {
		documentation: "",
		errorcode: 0,
		message: "Internal Server Error"
	}
};
