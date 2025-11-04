class CreateArcRequestUseCase {
    constructor({ ObtenerDataServeRepository }) {
        this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
        return await this.ObtenerDataServeRepository.createArcRequest(reqDto);
    }
}

module.exports = CreateArcRequestUseCase;