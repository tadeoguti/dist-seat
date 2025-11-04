class GetAvailableDatesUseCase {
    constructor({ ObtenerDataServeRepository }) {
        this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
        return await this.ObtenerDataServeRepository.getFechasDisponibles(reqDto);
    }
}

module.exports = GetAvailableDatesUseCase;