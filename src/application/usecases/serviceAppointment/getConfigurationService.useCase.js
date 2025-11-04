class GetConfigurationServiceUseCase {
    constructor({ ObtenerDataServeRepository }) {
        this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
        return await this.ObtenerDataServeRepository.getConfigurationService(reqDto);
    }
}

module.exports = GetConfigurationServiceUseCase;