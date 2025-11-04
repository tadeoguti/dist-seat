class ReqTokenDto {
    constructor({ MasID, ApiKey, Url }) {
        this.MasID = MasID;
        this.ApiKey = ApiKey;
        this.Url = Url;
    }
}

module.exports = ReqTokenDto;