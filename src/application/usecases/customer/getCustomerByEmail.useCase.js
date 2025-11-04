class GetCustomerByEmailUseCase{
    constructor({GetCustomerByEmailRepository}){
        this.GetCustomerByEmailRepository = GetCustomerByEmailRepository;
    }

    async execute(reqDto) {
      return await this.GetCustomerByEmailRepository.getCustomerByEmail(reqDto);
    }
}

module.exports = GetCustomerByEmailUseCase;