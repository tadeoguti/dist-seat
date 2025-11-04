class SendEmailDistributorUseCase{
    constructor({SendToDistributor,GetDistribuidorUseCase}){
        this.SendToDistributor = SendToDistributor;
        this.GetDistribuidorUseCase = GetDistribuidorUseCase;
    }

    async execute(reqDto) {
          return await this.SendToDistributor.enviar(reqDto);
      }
  }

module.exports = SendEmailDistributorUseCase;