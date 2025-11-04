class CreateVacancytUseCase {
    constructor({ JobExchangeRepository }) {
        this.JobExchangeRepository = JobExchangeRepository;
    }

    async execute(reqDto) {
        return await this.JobExchangeRepository.createVacancy(reqDto);
    }
}

module.exports = CreateVacancytUseCase;