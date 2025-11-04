class GetPassUserTblUseCase {
    constructor({ ObtenerDataServeRepository }) {
        this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
        return await this.ObtenerDataServeRepository.DamePassUserTbl(reqDto);
    }
}

module.exports = GetPassUserTblUseCase;