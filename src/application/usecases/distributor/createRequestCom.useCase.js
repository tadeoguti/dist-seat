class CreateRequestComUseCase {
    constructor({ CreateRequestComRepository }) {
      this.CreateRequestComRepository = CreateRequestComRepository;
    }

    async execute(reqDto) {
      return await this.CreateRequestComRepository.createRequestCom(reqDto);
    }
  }

  module.exports = CreateRequestComUseCase;