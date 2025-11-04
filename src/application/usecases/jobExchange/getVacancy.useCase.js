class GetVacancyUseCase {
    constructor({ JobExchangeRepository }) {
        this.JobExchangeRepository = JobExchangeRepository;
    }

    async execute(reqDto) {
        return await this.JobExchangeRepository.getVacancy(reqDto);
    }
}

module.exports = GetVacancyUseCase;