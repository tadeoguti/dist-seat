class LoginApiKeyUseCase {
    constructor({ AuthRepository }) {
      this.AuthRepository = AuthRepository;
    }

    async execute(resTokenDto) {
      return await this.AuthRepository.getToken(resTokenDto);
    }
  }

  module.exports = LoginApiKeyUseCase;