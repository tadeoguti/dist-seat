class GetNewVehiclePMUseCase {
    constructor({ ObtenerDataServeRepository }) {
        this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
        return await this.ObtenerDataServeRepository.getNewVehiclePM(reqDto);
    }
}

module.exports = GetNewVehiclePMUseCase;