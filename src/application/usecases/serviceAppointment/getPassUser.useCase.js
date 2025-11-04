class GetPassUserUseCase {
    constructor({ ObtenerDataServeRepository }) {
        this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
        return await this.ObtenerDataServeRepository.damePassUser(reqDto);
    }
}

module.exports = GetPassUserUseCase;