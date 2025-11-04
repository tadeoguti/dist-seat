class GetFollowsUseCase {
    constructor({ ObtenerDataServeRepository }) {
        this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
        return await this.ObtenerDataServeRepository.getSeguimientos(reqDto);
    }
}

module.exports = GetFollowsUseCase;