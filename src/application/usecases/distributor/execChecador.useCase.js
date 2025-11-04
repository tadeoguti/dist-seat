class ExecChecadorUseCase {
    constructor({ Checador }) {
      this.Checador = Checador;
    }

    async execute(reqDistributorDto) {
      return await this.Checador.validacionesPrincipales(reqDistributorDto);
    }
  }

  module.exports = ExecChecadorUseCase;