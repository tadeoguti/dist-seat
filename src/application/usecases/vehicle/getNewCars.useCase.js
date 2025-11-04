class GetHitsUseCase{
    constructor({GetNewCarsRepository}){
        this.GetNewCarsRepository = GetNewCarsRepository;
    }

    async execute(reqDto) {
      return await this.GetNewCarsRepository.getNewCars(reqDto);
    }
}

module.exports = GetHitsUseCase;