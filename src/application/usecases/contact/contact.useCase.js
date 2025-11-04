class ContactUseCase{
    constructor({ContactRepository}){
        this.ContactRepository = ContactRepository;
    }

    async execute(reqDto) {
      return await this.ContactRepository.getContactos(reqDto);
    }
}

module.exports = ContactUseCase;