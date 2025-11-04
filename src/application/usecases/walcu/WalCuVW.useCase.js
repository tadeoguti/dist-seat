class WalCuVWUseCase{
    constructor({WalCuVW}){
        this.WalCuVW = WalCuVW;
    }

    async execute(reqDto) {
        return await this.WalCuVW.enviar(reqDto);
      }
  }

module.exports = WalCuVWUseCase;