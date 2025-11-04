class UpdateReadCustomer {
    constructor({ ObtenerDataServeRepository }) {
        this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
        return await this.ObtenerDataServeRepository.updateReadCustomer(reqDto);
    }
}

module.exports = UpdateReadCustomer;