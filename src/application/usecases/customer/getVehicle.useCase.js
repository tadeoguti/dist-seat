class GetVehicleUseCase{
    constructor({GetVehicleRepository}){
        this.GetVehicleRepository = GetVehicleRepository;
    }

    async execute(reqDto) {
      return await this.GetVehicleRepository.searchVehicle(reqDto);
    }
}

module.exports = GetVehicleUseCase;