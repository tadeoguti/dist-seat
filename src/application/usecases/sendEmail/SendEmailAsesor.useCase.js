class SendEmailAsesorUseCase{
    constructor({SendToAsesor}){
        this.SendToAsesor = SendToAsesor;
    }

    async execute(reqDto) {
        return await this.SendToAsesor.enviar(reqDto);
      }
  }

module.exports = SendEmailAsesorUseCase;