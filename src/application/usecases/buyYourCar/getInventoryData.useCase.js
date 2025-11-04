class GetInventoryDataUseCase{
    constructor({GetInventoryDataRepository}){
        this.GetInventoryDataRepository = GetInventoryDataRepository;
    }

    async execute(reqDto) {
      return await this.GetInventoryDataRepository.getInventoryData(reqDto);
    }
}

module.exports = GetInventoryDataUseCase;