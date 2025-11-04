class GetHitsUseCase{
    constructor({CreateHistRepository}){
        this.CreateHistRepository = CreateHistRepository;
    }

    async execute(reqDto) {
      return await this.CreateHistRepository.createHit(reqDto);
    }
}

module.exports = GetHitsUseCase;