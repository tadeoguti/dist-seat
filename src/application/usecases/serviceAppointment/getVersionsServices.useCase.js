class GetVersionsServicesUseCase {
    constructor({ ObtenerDataServeRepository }) {
        this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
        return await this.ObtenerDataServeRepository.getVersionsServices(reqDto);
    }
}

module.exports = GetVersionsServicesUseCase;