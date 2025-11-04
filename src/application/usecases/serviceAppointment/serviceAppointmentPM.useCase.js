class ServiceAppointmentPMUseCase {
    constructor({ ServiceAppointmentRepository }) {
      this.ServiceAppointmentRepository = ServiceAppointmentRepository;
    }

    async execute(reqDto) {
      return await this.ServiceAppointmentRepository.createCotizacionPM(reqDto);
    }
  }

  module.exports = ServiceAppointmentPMUseCase;