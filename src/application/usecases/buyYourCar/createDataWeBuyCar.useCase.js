class CreateDataWeBuyCarUseCase{
    constructor({CreateDataWeBuyCarRepository}){
        this.CreateDataWeBuyCarRepository = CreateDataWeBuyCarRepository;
    }

    async execute(reqDto) {
      return await this.CreateDataWeBuyCarRepository.createDataWeBuyCar(reqDto);
    }
}

module.exports = CreateDataWeBuyCarUseCase;