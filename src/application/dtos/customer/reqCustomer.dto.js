const ReqPayloadDTO = require('../reqPayload.dto');
class ReqCustomerDTO extends ReqPayloadDTO{
    constructor() {
        super();
        this.FullName = "";
        this.Name = "";
        this.SurnameP = "";
        this.SurnameM = "";
        this.Email = "";
        this.Phone = "";
        this.TypeSol = "";
        this.ReceivePromo = "";
        this.TypePhone = "";
    }
}
module.exports = ReqCustomerDTO;