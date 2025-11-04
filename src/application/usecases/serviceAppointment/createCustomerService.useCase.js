class CreateCustomerServiceUseCase {
    constructor({ ServiceAppointmentRepository }) {
        this.ServiceAppointmentRepository = ServiceAppointmentRepository;
    }

    async execute(reqDto) {
        return await this.ServiceAppointmentRepository.CreateClienteService(reqDto);
    }
}

module.exports = CreateCustomerServiceUseCase;