class GetYearsServicesUseCase {
    constructor({ ObtenerDataServeRepository }) {
        this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
        return await this.ObtenerDataServeRepository.getYearsServices(reqDto);
    }
}

module.exports = GetYearsServicesUseCase;