class SendSaleforceVWUseCase{
    constructor({SaleforceVW}){
        this.SaleforceVW = SaleforceVW;
    }

    async execute(reqDto) {
      return await this.SaleforceVW.envia(reqDto);
    }
}

module.exports = SendSaleforceVWUseCase;