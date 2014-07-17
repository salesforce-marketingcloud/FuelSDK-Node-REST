module.exports = {
	get200: {
		endpoints: {
			test: '/test/test/test'
		}
	},
	401: {
		documentation: "",
		errorcode: 1,
		message: "Unauthorized"
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
