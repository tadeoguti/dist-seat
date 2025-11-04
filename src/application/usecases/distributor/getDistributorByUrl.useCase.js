class GetDistributorByUrlUseCase {
    constructor({ DistributorRepository }) {
      this.DistributorRepository = DistributorRepository;
    }

    async execute(reqDto) {
      return await this.DistributorRepository.getDistributorByUrl(reqDto);
    }
  }

  module.exports = GetDistributorByUrlUseCase;