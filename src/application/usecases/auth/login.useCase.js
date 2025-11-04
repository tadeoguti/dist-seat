class LoginUseCase {
    constructor({ AuthRepository }) {
      this.AuthRepository = AuthRepository;
    }
  
    execute() {
      return this.AuthRepository.getToken();
    }
  
  }
  
  module.exports = LoginUseCase;