class CreateLogSaleForceUseCase{
    constructor({CreateLogSaleforceVWRepository}){
        this.CreateLogSaleforceVWRepository = CreateLogSaleforceVWRepository;
    }

    async execute(reqDto) {
      return await this.CreateLogSaleforceVWRepository.actualizaIDSF(reqDto);
    }
}

module.exports = CreateLogSaleForceUseCase;