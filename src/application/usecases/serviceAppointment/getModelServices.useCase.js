class GetModelServicesUseCase {
    constructor({ ObtenerDataServeRepository }) {
        this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
        return await this.ObtenerDataServeRepository.getModelosServicio(reqDto);
    }
}

module.exports = GetModelServicesUseCase;