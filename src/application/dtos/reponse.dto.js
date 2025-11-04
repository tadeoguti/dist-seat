class ResponseDto {
    constructor(message = '', data = null) {
        this.message = message;
        this.data = data;
        this.isSuccess = false;
        this.statusCode = 400;
    }
}

module.exports = ResponseDto;
