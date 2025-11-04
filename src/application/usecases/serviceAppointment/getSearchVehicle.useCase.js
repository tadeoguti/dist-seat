class GetSearchVehicleUseCase {
    constructor({ ObtenerDataServeRepository }) {
        this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
        return await this.ObtenerDataServeRepository.getAutosNuevosPM(reqDto);
    }
}

module.exports = GetSearchVehicleUseCase;