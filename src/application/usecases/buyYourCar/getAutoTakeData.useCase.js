class GetAutoTakeDataUseCase{
    constructor({GetAutoTakeDataRepository}){
        this.GetAutoTakeDataRepository = GetAutoTakeDataRepository;
    }

    async execute(reqDto) {
      return await this.GetAutoTakeDataRepository.getAutoTakeData(reqDto);
    }
}

module.exports = GetAutoTakeDataUseCase;