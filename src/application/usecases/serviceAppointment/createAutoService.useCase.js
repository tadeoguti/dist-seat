class CreateAutoServiceUseCase {
    constructor({ ServiceAppointmentRepository }) {
        this.ServiceAppointmentRepository = ServiceAppointmentRepository;
    }

    async execute(reqDto) {
        return await this.ServiceAppointmentRepository.CreateAutoService(reqDto);
    }
}

module.exports = CreateAutoServiceUseCase;