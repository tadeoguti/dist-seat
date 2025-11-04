class QualificationUseCase{
    constructor({PowerStartsServices}){
        this.PowerStartsServices = PowerStartsServices;
    }

    async execute(reqDto) {
      return await this.PowerStartsServices.getDatosDealer(reqDto);
    }
}

module.exports = QualificationUseCase;