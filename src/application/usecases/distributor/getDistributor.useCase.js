class GetDistribuidorUseCase {
    constructor({ DistributorRepository }) {
      this.DistributorRepository = DistributorRepository;
    }

    async execute(reqDto) {
      return await this.DistributorRepository.getDistributor(reqDto);
    }
  }

  module.exports = GetDistribuidorUseCase;