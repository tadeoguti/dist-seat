class ServiceAppointmentUseCase {
    constructor({ ServiceAppointmentRepository }) {
      this.ServiceAppointmentRepository = ServiceAppointmentRepository;
    }

    async execute(reqDto) {
      return await this.ServiceAppointmentRepository.createCotizacion(reqDto);
    }
  }

  module.exports = ServiceAppointmentUseCase;