class GetHitsTelUseCase{
    constructor({CreateHistRepository}){
        this.CreateHistRepository = CreateHistRepository;
    }

    async execute(reqDto) {
      return await this.CreateHistRepository.createHitTel(reqDto);
    }
}

module.exports = GetHitsTelUseCase;