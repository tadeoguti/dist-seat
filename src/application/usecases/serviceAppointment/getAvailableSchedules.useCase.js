class GetAvailableSchedulesUseCase {
    constructor({ ObtenerDataServeRepository }) {
        this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
        return await this.ObtenerDataServeRepository.getHorariosServicio(reqDto);
    }
}

module.exports = GetAvailableSchedulesUseCase;