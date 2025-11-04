class GetConfirmationUseCase {
    constructor({ ObtenerDataServeRepository }) {
      this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
      return await this.ObtenerDataServeRepository.getConfirmacion(reqDto);
    }
  }

  module.exports = GetConfirmationUseCase;