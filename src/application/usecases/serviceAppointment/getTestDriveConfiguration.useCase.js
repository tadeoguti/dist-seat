class GetTestDriveConfiguration {
    constructor({ ObtenerDataServeRepository }) {
        this.ObtenerDataServeRepository = ObtenerDataServeRepository;
    }

    async execute(reqDto) {
        return await this.ObtenerDataServeRepository.getTestDriveConfiguration(reqDto);
    }
}

module.exports = GetTestDriveConfiguration;