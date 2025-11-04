
class CreateDataWhatsAppUseCase{
    constructor({CreateDataWhatsAppRepository}){
        this.CreateDataWhatsAppRepository = CreateDataWhatsAppRepository;
    }

    async execute(reqDto) {
      return await this.CreateDataWhatsAppRepository.createDataWhatsApp(reqDto);
    }
}

module.exports = CreateDataWhatsAppUseCase;