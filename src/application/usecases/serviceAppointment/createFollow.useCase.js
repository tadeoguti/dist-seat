class CreateFollowUseCase {
    constructor({ ObtenerDataServeRepository }) {
        this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
        return await this.ObtenerDataServeRepository.createFollow(reqDto);
    }
}

module.exports = CreateFollowUseCase;