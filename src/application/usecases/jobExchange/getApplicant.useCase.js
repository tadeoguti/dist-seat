class GetApplicantUseCase {
    constructor({ JobExchangeRepository }) {
        this.JobExchangeRepository = JobExchangeRepository;
    }

    async execute(reqDto) {
        return await this.JobExchangeRepository.getApplicant(reqDto);
    }
}

module.exports = GetApplicantUseCase;