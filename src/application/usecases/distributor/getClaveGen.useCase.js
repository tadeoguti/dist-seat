class GetClaveGenUseCase {
    constructor({ GetClaveGenRepository }) {
      this.GetClaveGenRepository = GetClaveGenRepository;
    }

    async execute(reqDto) {
      return await this.GetClaveGenRepository.getClaveGen(reqDto);
    }
  }

  module.exports = GetClaveGenUseCase;