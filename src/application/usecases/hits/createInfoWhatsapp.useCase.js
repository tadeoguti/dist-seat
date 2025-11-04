class CreateInfoWhatsappUseCase{
    constructor({CreateInfoWhatsappRepository}){
        this.CreateInfoWhatsappRepository = CreateInfoWhatsappRepository;
    }

    async execute(reqDto) {
      return await this.CreateInfoWhatsappRepository.insertWA(reqDto);
    }
}

module.exports = CreateInfoWhatsappUseCase;