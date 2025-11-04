class GetUsedCarsUseCase{
    constructor({GetUsedCarsRepository}){
        this.GetUsedCarsRepository = GetUsedCarsRepository;
    }

    async execute(reqDto) {
      return await this.GetUsedCarsRepository.getUsedCars(reqDto);
    }
}

module.exports = GetUsedCarsUseCase;