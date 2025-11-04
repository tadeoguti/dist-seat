class CustomerUseCase{
    constructor({CustomerRepository}){
        this.CustomerRepository = CustomerRepository;
    }

    async execute(reqDto) {
      return await this.CustomerRepository.createCustomer(reqDto);
    }
}

module.exports = CustomerUseCase;