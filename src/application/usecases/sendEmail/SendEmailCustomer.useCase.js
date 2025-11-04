class SendEmailCustomerUseCase{
    constructor({SendToCustomer}){
        this.SendToCustomer = SendToCustomer;
    }

    async execute(reqDto) {
      return await this.SendToCustomer.enviar(reqDto);
    }
}

module.exports = SendEmailCustomerUseCase;