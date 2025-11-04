class CreateResumeUseCase {
    constructor({ JobExchangeRepository }) {
        this.JobExchangeRepository = JobExchangeRepository;
    }

    async execute(reqDto) {
        return await this.JobExchangeRepository.createResume(reqDto);
    }
}

module.exports = CreateResumeUseCase;