class NetcarUseCase{
    constructor({NetcarService}){
        this.NetcarService = NetcarService;
    }

    async execute(reqDto) {
      return await this.NetcarService.sendCot(reqDto);
    }
}

module.exports = NetcarUseCase;